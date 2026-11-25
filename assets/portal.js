(function () {
  const C = window.PORTAL_CONFIG || {};
  // Student-side calls use plain fetch, so they work even if the Supabase library fails to load.
  const ready = !!(C.url && C.key);
  const client = ready && window.supabase ? window.supabase.createClient(C.url, C.key) : null;
  function code() {
    let c = window.STUDENT_CODE || new URLSearchParams(location.search).get("c");
    if (c) { try { localStorage.setItem("portal-code", c); } catch (e) {} return c; }
    try { return localStorage.getItem("portal-code"); } catch (e) { return null; }
  }
  async function rpc(fn, body) {
    const r = await fetch(C.url + "/rest/v1/rpc/" + fn, { method: "POST", headers: { "Content-Type": "application/json", apikey: C.key }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(fn + " failed: " + r.status);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }
  async function getPortal(c) {
    if (!ready || !c) return null;
    return rpc("get_portal", { p_code: c });
  }
  function getRecommendations(c) {
    return rpc("get_recommendations", { p_code: c });
  }
  function tryRecommendation(c, id) {
    return rpc("try_recommendation", { p_code: c, p_id: id });
  }
  function recommendationUrl(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch (e) { return null; }
  }
  async function log(activity, score, total, details) {
    const c = code();
    if (!ready || !c) return false;
    try { await rpc("log_result", { p_code: c, p_activity: activity, p_score: score, p_total: total, p_details: details || {} }); return true; }
    catch (e) { return false; }
  }
  function withCode(url) {
    const c = code();
    if (!c || !/puicumber\.github\.io/.test(url)) return url;
    return url + (url.includes("?") ? "&" : "?") + "c=" + encodeURIComponent(c);
  }
  // Speaking tasks: https://puicumber.github.io/lesson/speak/?id=ab12&t=Title&q=Question&q=Question&max=120
  // Each question is saved as the result "speak/<id>-<n>" (n from 1), with the recording in the "voice" storage bucket.
  function speakTask(url) {
    try {
      const u = new URL(url, location.href);
      if (!/\/speak\/?$/.test(u.pathname.replace(/index\.html$/, ""))) return null;
      const id = (u.searchParams.get("id") || "").replace(/[^a-z0-9]/gi, "").slice(0, 12);
      const qs = u.searchParams.getAll("q").map(q => q.trim()).filter(Boolean);
      if (!id || !qs.length) return null;
      const max = Math.min(300, Math.max(30, parseInt(u.searchParams.get("max"), 10) || 120));
      return { id, title: u.searchParams.get("t") || "Speaking", qs, max, keys: qs.map((_, i) => id + "-" + (i + 1)) };
    } catch (e) { return null; }
  }
  window.Portal = { client, ready, code, getPortal, getRecommendations, tryRecommendation, recommendationUrl, log, withCode, speakTask };
})();
