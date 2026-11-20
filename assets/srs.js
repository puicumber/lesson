// Spaced repetition for word sets (window.WORD_SETS from words.js).
// State is saved like the portal decorations: one result row "me:words" whose details hold every card.
//   details = { cards: { "setId|word": {b, d, m, r, f, t, last} }, days: ["YYYY-MM-DD"...], ts }
//   b = level (0 = new or forgotten), d = next due day, m = times forgotten, r = reviews,
//   f = first day seen, t = timestamp of the last review, last = 1 remembered / 0 forgotten.
// "Not yet" -> back tomorrow. "I knew it" -> after 3 days, then 7, 14, 30, 60, 120.
(function () {
  const C = window.PORTAL_CONFIG || {};
  const KEY = "me:words";
  const STEPS = [3, 7, 14, 30, 60, 120];
  const NEW_PER_DAY = 20;
  const pad = n => String(n).padStart(2, "0");
  const dayOf = dt => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const today = () => dayOf(new Date());
  function addDays(day, n) { const [y, m, d] = day.split("-").map(Number); return dayOf(new Date(y, m - 1, d + n)); }
  function diffDays(a, b) { const p = s => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((p(b) - p(a)) / 864e5); }
  const slug = s => String(s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const all = () => (window.WORD_SETS || []).filter(s => s && s.id && Array.isArray(s.words));
  const cardId = (set, w) => set.id + "|" + w.w;

  // Sets for a student: `for` matches the student's name slug or the start of the code ("sasha" in "sasha-xxxx").
  function setsFor(student, code) {
    const keys = new Set([slug(student && student.name), slug((student && student.name || "").split(/\s+/)[0]), String(code || (student && student.code) || "").replace(/-[^-]*$/, "")].filter(Boolean));
    return all().filter(s => (s.for || []).some(f => f === "all" || keys.has(slug(f))));
  }
  function empty() { return { cards: {}, days: [], ts: 0 }; }
  function clean(s) { s = s && typeof s === "object" ? s : {}; return { cards: s.cards && typeof s.cards === "object" ? s.cards : {}, days: Array.isArray(s.days) ? s.days : [], ts: s.ts || 0 }; }
  // Merge two states card by card: the newer review wins.
  function merge(a, b) {
    a = clean(a); b = clean(b);
    const out = { cards: Object.assign({}, a.cards), days: [...new Set([...a.days, ...b.days])].sort().slice(-90), ts: Math.max(a.ts, b.ts) };
    for (const [k, v] of Object.entries(b.cards)) if (!out.cards[k] || (v.t || 0) > (out.cards[k].t || 0)) out.cards[k] = v;
    return out;
  }
  function grade(st, ok, day) {
    st = st || {};
    const n = { b: st.b || 0, m: st.m || 0, r: (st.r || 0) + 1, f: st.f || day, t: Date.now(), last: ok ? 1 : 0 };
    if (ok) { n.d = addDays(day, STEPS[Math.min(n.b, STEPS.length - 1)]); n.b = n.b + 1; }
    else { n.b = 0; n.m = n.m + 1; n.d = addDays(day, 1); }
    return n;
  }
  // Cards for today's session: due reviews first (forgotten ones first), then new words up to the daily limit.
  function queue(sets, state, day) {
    day = day || today(); state = clean(state);
    const review = [], fresh = [];
    let newToday = Object.values(state.cards).filter(c => c.f === day).length;
    sets.forEach(s => s.words.forEach(w => {
      const id = cardId(s, w), st = state.cards[id];
      if (!st) fresh.push({ id, set: s, w });
      else if (st.d <= day) review.push({ id, set: s, w, st });
    }));
    review.sort((x, y) => (x.st.last - y.st.last) || (x.st.d < y.st.d ? -1 : 1));
    const room = Math.max(0, NEW_PER_DAY - newToday);
    return { review, fresh: fresh.slice(0, room), waitingNew: Math.max(0, fresh.length - room) };
  }
  function stats(set, state, day) {
    day = day || today(); state = clean(state);
    let fresh = 0, learning = 0, strong = 0, due = 0;
    set.words.forEach(w => { const st = state.cards[cardId(set, w)];
      if (!st) { fresh++; return; }
      if (st.d <= day) due++;
      if (st.b >= 2) strong++; else learning++; });
    return { total: set.words.length, fresh, learning, strong, due };
  }
  function nextDue(sets, state) {
    state = clean(state); let best = null;
    sets.forEach(s => s.words.forEach(w => { const st = state.cards[cardId(s, w)]; if (st && (!best || st.d < best)) best = st.d; }));
    return best;
  }
  function streak(state) {
    const days = new Set(clean(state).days); let d = today(), n = 0;
    if (!days.has(d)) d = addDays(d, -1);
    while (days.has(d)) { n++; d = addDays(d, -1); }
    return n;
  }
  function whenText(day) {
    const n = diffDays(today(), day);
    if (n <= 0) return "today"; if (n === 1) return "tomorrow";
    if (n < 7) return `in ${n} days`;
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  // ---- saving (student side) ----
  const lsKey = code => "words:" + code;
  function local(code) { try { return JSON.parse(localStorage.getItem(lsKey(code)) || "null"); } catch (e) { return null; } }
  function keepLocal(code, state) { try { localStorage.setItem(lsKey(code), JSON.stringify(state)); } catch (e) {} }
  async function save(code, state, keepalive) {
    keepLocal(code, state);
    if (!code || !C.url || !C.key) return false;
    const strong = Object.values(state.cards).filter(c => c.b >= 2).length;
    try {
      const r = await fetch(C.url + "/rest/v1/rpc/log_result", { method: "POST", keepalive: !!keepalive,
        headers: { "Content-Type": "application/json", apikey: C.key },
        body: JSON.stringify({ p_code: code, p_activity: KEY, p_score: strong, p_total: Object.keys(state.cards).length, p_details: state }) });
      return r.ok;
    } catch (e) { return false; }
  }

  // ---- portal panel ----
  function renderPortal(el, student, serverState, code) {
    if (!el) return;
    const sets = setsFor(student, code);
    if (!sets.length) { el.hidden = true; return; }
    const state = merge(serverState, local(code));
    const q = queue(sets, state);
    const n = q.review.length + q.fresh.length, st = streak(state);
    const nd = nextDue(sets, state);
    const href = "../words/?c=" + encodeURIComponent(code);
    const total = sets.reduce((a, s) => a + s.words.length, 0);
    const strong = sets.reduce((a, s) => a + stats(s, state).strong, 0);
    el.hidden = false;
    el.innerHTML = `<div class="row" style="justify-content:space-between"><h2>🌱 Word garden</h2>${st ? `<span class="pill go">🔥 ${st} day${st > 1 ? "s" : ""} in a row</span>` : ""}</div>
      <p class="muted">${n ? `<b style="color:var(--ink)">${n} word${n > 1 ? "s" : ""}</b> to review today${q.fresh.length ? ` (${q.fresh.length} new)` : ""}. It takes a few minutes.` : `All done for today ✓${nd ? ` Next words come back ${whenText(nd)}.` : ""}`}</p>
      <div class="bar" title="Words you know well"><span style="width:${total ? Math.round(strong / total * 100) : 0}%"></span></div>
      <p class="muted" style="font-size:14px">${strong} of ${total} words growing strong · ${sets.map(s => esc(s.title)).join(" · ")}</p>
      <div class="row"><a class="btn${n ? "" : " ghost"}" style="text-decoration:none" href="${href}">${n ? "Start ▸" : "Open my garden"}</a></div>`;
  }

  // ---- Teacher Desk ----
  function renderTeacher(el, student, state, previewBase) {
    if (!el) return;
    const sets = setsFor(student, student.code);
    state = clean(state);
    if (!sets.length) { el.innerHTML = '<p class="muted">No word sets for this student yet.</p>'; return; }
    const day = today();
    const last = state.ts ? new Date(state.ts).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null;
    const week = Array.from({ length: 7 }, (_, i) => addDays(day, -i)).filter(d => state.days.includes(d)).length;
    let html = `<p class="muted">${last ? `Last practice: ${last} · ${week} of the last 7 days · streak ${streak(state)}` : "Hasn't practised yet."}</p>`;
    html += `<div class="table-wrap"><table><thead><tr><th>Set</th><th>Words</th><th>Strong</th><th>Learning</th><th>Not seen</th><th>Due now</th><th></th></tr></thead><tbody>`;
    sets.forEach(s => { const x = stats(s, state, day);
      html += `<tr><td>${esc(s.title)}</td><td>${x.total}</td><td>${x.strong}</td><td>${x.learning}</td><td>${x.fresh}</td><td>${x.due}</td><td><a href="${previewBase}?preview=${encodeURIComponent(s.id)}" target="_blank" rel="noopener">Preview</a></td></tr>`; });
    html += `</tbody></table></div>`;
    const hard = [];
    sets.forEach(s => s.words.forEach(w => { const st = state.cards[cardId(s, w)]; if (st && (st.m || 0) > 0) hard.push({ s, w, st }); }));
    hard.sort((a, b) => (b.st.m - a.st.m) || (a.st.last - b.st.last));
    html += `<p style="margin-top:6px"><b>Words that don't stick</b></p>`;
    html += hard.length ? `<ul>${hard.slice(0, 15).map(h => `<li><b>${esc(h.w.w)}</b> <span class="muted">· ${esc(h.w.ru || "")} · forgot ${h.st.m}× in ${h.st.r} review${h.st.r > 1 ? "s" : ""} · ${h.st.last ? "remembered last time" : "forgot last time"}</span></li>`).join("")}</ul>` : '<p class="muted">Nothing yet.</p>';
    el.innerHTML = html;
  }

  window.SRS = { KEY, STEPS, NEW_PER_DAY, today, addDays, slug, esc, all, cardId, setsFor, empty, clean, merge, grade, queue, stats, nextDue, streak, whenText, local, keepLocal, save, renderPortal, renderTeacher };
})();
