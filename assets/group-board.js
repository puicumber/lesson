// Weekly group competition on the student portal (/my/).
// A group is listed in assets/groups.js. Each entry is found by a hash of the student's own code
// and holds the classmates' codes encrypted with that code, so the file reveals nothing on its own.
// Points (Moscow time, weeks run Monday to Sunday):
//   +10 for each exercise finished with 80% or more, +5 more for 100%
//   +5 for each day with any practice
// Each student saves her own weekly totals as "me:week" so past weeks don't change later.
(function () {
  const PTS = { pass: 10, perfect: 5, day: 5 };
  const DAY = 864e5, MSK = 3 * 36e5;
  const enc = new TextEncoder();
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const sha = s => crypto.subtle.digest("SHA-256", enc.encode(s));

  async function findGroup(code) {
    const G = window.PORTAL_GROUPS || {};
    if (!code || !window.crypto || !crypto.subtle) return null;
    const id = hex(await sha("group-id|" + code)).slice(0, 20);
    const e = G[id];
    if (!e) return null;
    const key = await crypto.subtle.importKey("raw", await sha("group-key|" + code), "AES-GCM", false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(e.iv) }, key, unb64(e.ct));
    return JSON.parse(new TextDecoder().decode(plain)); // {name, start, goal, mates:[codes]}
  }

  // dates as "YYYY-MM-DD" in Moscow time
  const day = t => new Date(+new Date(t) + MSK).toISOString().slice(0, 10);
  const today = () => day(Date.now());
  const monday = d => { const x = new Date(d + "T00:00:00Z"); return new Date(+x - ((x.getUTCDay() + 6) % 7) * DAY).toISOString().slice(0, 10); };
  const addDays = (d, n) => new Date(+new Date(d + "T00:00:00Z") + n * DAY).toISOString().slice(0, 10);

  // One student's numbers from her get_portal data.
  function score(d, start) {
    const res = (d && d.results) || [], st = (d && d.state) || {};
    const saved = st["me:week"] || {};
    const ex = res.filter(r => r.activity && r.activity.includes("/") && !/^(me|done):/.test(r.activity));
    const days = new Set((saved.days || []).filter(x => /^\d{4}-\d\d-\d\d$/.test(x)));
    ex.forEach(r => { if (r.last) days.add(day(r.last)); });
    const weeks = {};
    const add = (w, n) => { if (w >= start) weeks[w] = (weeks[w] || 0) + n; };
    days.forEach(x => add(monday(x), PTS.day));
    ex.forEach(r => {
      const s = st[r.activity];
      if (!r.last || !r.total || (s && s.partial)) return;
      if (r.best / r.total >= 0.8) add(monday(day(r.last)), PTS.pass + (r.best >= r.total ? PTS.perfect : 0));
    });
    // keep the highest total ever seen for each week, so redoing an old exercise doesn't lower an old week
    Object.entries(saved.weeks || {}).forEach(([w, n]) => { if (w >= start && +n > (weeks[w] || 0)) weeks[w] = +n; });
    // streak: days in a row up to today (or yesterday, if she hasn't practised yet today)
    let streak = 0, cur = days.has(today()) ? today() : addDays(today(), -1);
    while (days.has(cur)) { streak++; cur = addDays(cur, -1); }
    let best = 0, run = 0, prev = null;
    [...days].sort().forEach(x => { run = prev && addDays(prev, 1) === x ? run + 1 : 1; best = Math.max(best, run); prev = x; });
    const look = st["me:style"] || {};
    return { name: (d && d.student && d.student.name) || "Classmate", avatar: look.avatar || "🙂", weeks, days, streak, bestStreak: best,
      changed: JSON.stringify(Object.entries(weeks).sort()) !== JSON.stringify(Object.entries(saved.weeks || {}).filter(([w]) => w >= start).sort())
        || [...days].some(x => !(saved.days || []).includes(x)) };
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");

  const CSS = `
.gb{position:relative;overflow:hidden;background:linear-gradient(160deg,color-mix(in srgb,var(--gold) 16%,var(--card)),var(--card) 55%)}
.gb-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.gb-cup{font-size:clamp(40px,8vw,58px);line-height:1;transform:rotate(8deg);filter:drop-shadow(0 4px 0 color-mix(in srgb,var(--gold) 35%,transparent))}
.gb-say{font-weight:700;font-size:18px}
.gb-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.gb-row{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:12px 14px;border-radius:16px;border:1px solid var(--line);background:var(--bg)}
.gb-row.me{border-color:var(--green);box-shadow:inset 0 0 0 1px var(--green)}
.gb-av{position:relative;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:32px;background:var(--card);border:3px solid var(--line)}
.gb-row:first-child .gb-av{border-color:var(--gold)}
.gb-av i{position:absolute;top:-16px;left:50%;transform:translateX(-50%) rotate(-12deg);font-style:normal;font-size:22px}
.gb-who{display:flex;flex-direction:column;gap:6px;min-width:0}
.gb-who b{font-family:var(--display);font-size:20px;line-height:1.1}
.gb-who em{font-style:normal;font-family:var(--body);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--card);background:var(--green);border-radius:99px;padding:1px 8px;vertical-align:middle}
.gb-bar{height:10px;border-radius:99px;background:var(--line);overflow:hidden}
.gb-bar span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--green),var(--gold));transition:width .8s}
.gb-bar.team{height:14px}
.gb-dots{display:flex;gap:4px}
.gb-dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:700;color:var(--muted);border:1px dashed var(--line)}
.gb-dot.on{background:var(--green);border:1px solid var(--green);color:var(--card)}
.gb-dot.now{outline:2px solid var(--gold);outline-offset:1px}
.gb-pts{display:flex;flex-direction:column;align-items:flex-end;line-height:1.05}
.gb-pts b{font-family:var(--display);font-size:clamp(28px,5vw,38px);font-weight:800;color:var(--green);font-variant-numeric:tabular-nums}
.gb-pts small{color:var(--muted);font-size:13px}
.gb-fire{margin-top:6px;font-weight:700;font-size:14px;white-space:nowrap}
.gb-team{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:16px;border:1px dashed var(--gold);background:var(--gold-soft)}
.gb-last{font-weight:700}
.gb-how summary{cursor:pointer;font-weight:700;color:var(--green)}
.gb-how summary:focus-visible{outline:3px solid var(--gold);outline-offset:3px;border-radius:6px}
.gb-how ul{margin:8px 0;padding-left:20px}
@media (max-width:520px){.gb-row{grid-template-columns:auto 1fr;gap:10px}.gb-pts{grid-column:1/-1;flex-direction:row;align-items:baseline;gap:8px;justify-content:flex-start}.gb-fire{margin:0 0 0 auto}.gb-av{width:46px;height:46px;font-size:26px}.gb-dot{width:20px;height:20px}}
@media (prefers-reduced-motion:reduce){.gb-bar span{transition:none}}`;
  function addCss() { if (document.getElementById("gbCss")) return; const s = document.createElement("style"); s.id = "gbCss"; s.textContent = CSS; document.head.appendChild(s); }

  let OUT = { badges: [] };

  function render(box, G, me, mates, wk) {
    const all = [me, ...mates];
    const pts = p => p.weeks[wk] || 0;
    const sorted = [...all].sort((a, b) => pts(b) - pts(a) || (a === me ? -1 : 1));
    const top = Math.max(1, ...all.map(pts));
    const total = all.reduce((s, p) => s + pts(p), 0);
    const goal = G.goal || 120;
    const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
    const leaderPts = pts(sorted[0]);
    const tie = all.filter(p => pts(p) === leaderPts).length > 1;

    let say;
    if (!total) say = "A new week, a clean slate. The first exercise takes the lead!";
    else if (tie) say = "Neck and neck! One more exercise breaks the tie.";
    else if (sorted[0] === me) say = "You're in the lead. Keep the streak going!";
    else { const gap = leaderPts - pts(me); say = gap <= 15 ? `Only ${gap} points behind. One exercise and you're back in it!` : `${gap} points to catch up. Every exercise is +10, every day of practice +5.`; }

    const rows = sorted.map((p, i) => {
      const dots = dayNames.map((n, k) => { const dd = addDays(wk, k); const on = p.days.has(dd);
        return `<span class="gb-dot${on ? " on" : ""}${dd === today() ? " now" : ""}" title="${dd}">${n}</span>`; }).join("");
      const crown = i === 0 && pts(p) > 0 && !tie ? "👑" : "";
      return `<li class="gb-row${p === me ? " me" : ""}">
        <span class="gb-av" aria-hidden="true">${esc(p.avatar)}<i>${crown}</i></span>
        <span class="gb-who"><b>${esc(p.name)}${p === me ? ' <em>you</em>' : ""}</b>
          <span class="gb-bar"><span style="width:${Math.round(pts(p) / top * 100)}%"></span></span>
          <span class="gb-dots" aria-label="Practice days this week">${dots}</span></span>
        <span class="gb-pts"><b>${pts(p)}</b><small>points</small><span class="gb-fire" title="Days in a row">🔥 ${plural(p.streak, "day")}</span></span>
      </li>`;
    }).join("");

    // last finished week
    const lw = addDays(wk, -7);
    let last = "";
    if (lw >= G.start) {
      const lp = all.map(p => [p, p.weeks[lw] || 0]).sort((a, b) => b[1] - a[1]);
      if (lp[0][1] > 0) {
        const winners = lp.filter(x => x[1] === lp[0][1]).map(x => x[0]);
        last = winners.length > 1
          ? `Last week: a shared crown for ${winners.map(p => esc(p.name)).join(" and ")} 👑 (${lp[0][1]} points each)`
          : `Last week's winner: ${esc(winners[0].name)} 👑 with ${lp[0][1]} points`;
      }
    }
    const crowns = all.map(p => `${esc(p.name)} 👑×${wins(p, all, wk, G.start)}`).join(" · ");

    box.innerHTML = `
      <div class="gb-head"><div><p class="eyebrow">This week · Mon ${fmt(wk)} – Sun ${fmt(addDays(wk, 6))}</p><h2>${esc(G.name || "Group cup")}</h2></div><span class="gb-cup" aria-hidden="true">🏆</span></div>
      <p class="gb-say">${say}</p>
      <ol class="gb-list">${rows}</ol>
      <div class="gb-team"><div class="row" style="justify-content:space-between"><b>🤝 Team goal</b><span>${Math.min(total, goal)} / ${goal}</span></div>
        <div class="gb-bar team"><span style="width:${Math.min(100, Math.round(total / goal * 100))}%"></span></div>
        <small class="muted">${total >= goal ? "You did it together! The Dream team badge is yours. 🎉" : `Reach ${goal} points together this week and you both get the Dream team badge.`}</small></div>
      ${last ? `<p class="gb-last">${last}</p>` : ""}
      <details class="gb-how"><summary>How to get points</summary>
        <ul><li><b>+10</b> for every exercise you finish with 80% or more</li><li><b>+5</b> more if you get everything right</li>
        <li><b>+5</b> for every day you practise 🔥</li><li>On Monday the week starts again. The winner of the week gets a 👑 badge.</li></ul>
        <p class="muted">Crowns so far: ${crowns}</p></details>`;
    addCss(); box.hidden = false;
  }
  const fmt = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  function wins(p, all, wk, start) {
    let n = 0;
    for (let w = start; w < wk; w = addDays(w, 7)) {
      const mine = p.weeks[w] || 0;
      if (mine > 0 && all.every(o => (o.weeks[w] || 0) <= mine)) n++;
    }
    return n;
  }

  async function load(d, code) {
    OUT = { badges: [] };
    const box = document.getElementById("groupBoard");
    let G;
    try { G = await findGroup(code); } catch (e) { G = null; }
    if (!G || !Array.isArray(G.mates)) return OUT;
    const start = monday(G.start || today());
    G.start = start;
    const me = score(d, start);
    const mates = (await Promise.all(G.mates.map(c => window.Portal.getPortal(c).catch(() => null))))
      .filter(x => x && x.student).map(x => score(x, start));
    const wk = monday(today());
    if (me.changed) {
      const keep = [...me.days].sort().slice(-120);
      window.Portal.log("me:week", 1, 1, { weeks: me.weeks, days: keep, ts: Date.now() });
    }
    const all = [me, ...mates];
    const myWins = wins(me, all, wk, start);
    const teamHit = Object.keys(me.weeks).some(w => all.reduce((s, p) => s + (p.weeks[w] || 0), 0) >= (G.goal || 120));
    OUT.badges = [
      { id: "cup-win", e: "👑", t: "Winner of the week", d: myWins > 1 ? `Won the ${G.name || "group cup"} ${myWins} times` : `Win a week of the ${G.name || "group cup"}`, ok: myWins > 0 },
      { id: "cup-team", e: "🤝", t: "Dream team", d: `Reach the team goal together in one week`, ok: teamHit },
      { id: "cup-streak", e: "🔥", t: "On a roll", d: "Practise 3 days in a row", ok: me.bestStreak >= 3 }
    ];
    if (box) { if (mates.length) render(box, G, me, mates, wk); else box.hidden = true; }
    return OUT;
  }

  window.GroupBoard = { load, badges: () => OUT.badges, _score: score };
})();
