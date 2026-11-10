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
  window.Portal = { client, ready, code, getPortal, log, withCode };
})();
