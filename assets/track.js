// Progress tracking for exercise pages.
// Saves every answer (not only finished exercises), keeps a local copy,
// retries failed saves, flushes when the page is closed, and restores answers on return.
(function () {
  const C = window.PORTAL_CONFIG || {};
  const P = window.Portal;
  const code = P && P.code ? P.code() : null;
  const online = !!(C.url && C.key && code);
  let SET = "";
  const ex = {};          // ex name -> {answers:{}, score, total, final, extra}
  const timers = {};
  const status = [];      // listeners
  let state = "idle";

  const lsKey = k => "trk:" + (code || "anon") + ":" + k;
  const lsGet = k => { try { return JSON.parse(localStorage.getItem(lsKey(k)) || "null"); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(lsKey(k), JSON.stringify(v)); } catch (e) {} };
  const QKEY = "trk-queue:" + (code || "anon");
  const qGet = () => { try { return JSON.parse(localStorage.getItem(QKEY) || "[]"); } catch (e) { return []; } };
  const qSet = q => { try { localStorage.setItem(QKEY, JSON.stringify(q.slice(-50))); } catch (e) {} };

  function setState(s) { state = s; status.forEach(f => { try { f(s); } catch (e) {} }); }

  async function send(body, keepalive) {
    const r = await fetch(C.url + "/rest/v1/rpc/log_result", {
      method: "POST", keepalive: !!keepalive,
      headers: { "Content-Type": "application/json", apikey: C.key },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error("save failed " + r.status);
  }
  async function deliver(body, keepalive) {
    if (!online) return;
    setState("saving");
    try { await send(body, keepalive); setState("saved"); }
    catch (e) { const q = qGet(); q.push(body); qSet(q); setState("offline"); }
  }
  async function drainQueue() {
    if (!online) return;
    const q = qGet(); if (!q.length) return;
    qSet([]);
    for (const b of q) { try { await send(b); } catch (e) { const r = qGet(); r.push(b); qSet(r); } }
  }

  function body(name, keepalive) {
    const e = ex[name];
    const answers = Object.values(e.answers);
    const wrong = answers.filter(a => a.ok === false).map(a => a.c ? `${a.q} → ${a.c}` : a.q);
    const details = Object.assign({}, e.extra || {}, { answers: e.answers, wrong, partial: !e.final, ts: Date.now() });
    return { p_code: code, p_activity: SET + "/" + name, p_score: e.score || 0, p_total: e.total || 0, p_details: details };
  }
  function persist(name, now) {
    const e = ex[name];
    lsSet(name, { answers: e.answers, score: e.score, total: e.total, final: e.final, extra: e.extra, ts: Date.now() });
    clearTimeout(timers[name]);
    if (now) { delete timers[name]; deliver(body(name)); }
    else timers[name] = setTimeout(() => { delete timers[name]; deliver(body(name)); }, 3000);
  }
  function flush() {
    Object.keys(timers).forEach(n => { clearTimeout(timers[n]); delete timers[n]; deliver(body(n), true); });
  }
  addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });

  function get(name) {
    if (!ex[name]) ex[name] = { answers: {}, score: 0, total: 0, final: false, extra: {} };
    return ex[name];
  }

  window.Track = {
    online,
    // Load saved answers (server + local, newest wins). Resolves to {exName: {answers, score, total, final, extra}}
    async init(set) {
      SET = set;
      let server = {};
      if (online) {
        try {
          const r = await fetch(C.url + "/rest/v1/rpc/get_portal", { method: "POST", headers: { "Content-Type": "application/json", apikey: C.key }, body: JSON.stringify({ p_code: code }) });
          if (r.ok) { const d = await r.json(); server = (d && d.state) || {}; }
        } catch (e) {}
      }
      drainQueue();
      const out = {};
      const names = new Set();
      Object.keys(server).forEach(k => { if (k.startsWith(set + "/")) names.add(k.slice(set.length + 1)); });
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || ""; const pre = "trk:" + (code || "anon") + ":";
        if (k.startsWith(pre)) names.add(k.slice(pre.length));
      }
      names.forEach(n => {
        const s = server[set + "/" + n], l = lsGet(n);
        let pick = null;
        if (s && l) pick = (l.ts || 0) > (s.ts || 0) ? l : { answers: s.answers || {}, score: null, total: null, final: !s.partial, extra: s };
        else if (s) pick = { answers: s.answers || {}, score: null, total: null, final: !s.partial, extra: s };
        else pick = l;
        if (pick) { out[n] = pick; const e = get(n); e.answers = pick.answers || {}; e.final = !!pick.final; e.extra = pick.extra || {}; if (pick.score != null) e.score = pick.score; if (pick.total != null) e.total = pick.total; }
      });
      return out;
    },
    // Record one answer. q = question text, a = what the student gave, c = correct answer.
    answer(name, idx, q, a, c, ok, score, total) {
      const e = get(name);
      e.answers[idx] = { q, a, c, ok };
      e.score = score; e.total = total;
      persist(name, false);
    },
    // Mark an exercise as finished and save immediately.
    finish(name, score, total) { const e = get(name); e.score = score; e.total = total; e.final = true; persist(name, true); },
    // Save extra data (e.g. learned flashcards).
    extra(name, data, score, total) { const e = get(name); e.extra = Object.assign({}, e.extra, data); e.score = score; e.total = total; persist(name, false); },
    reset(name) { ex[name] = { answers: {}, score: 0, total: 0, final: false, extra: {} }; lsSet(name, null); },
    onStatus(f) { status.push(f); f(state); }
  };
})();
