(function () {
  const C = window.PORTAL_CONFIG || {};
  const ready = !!(C.url && C.key && window.supabase);
  const client = ready ? window.supabase.createClient(C.url, C.key) : null;
  function code() {
    let c = window.STUDENT_CODE || new URLSearchParams(location.search).get("c");
    if (c) { try { localStorage.setItem("portal-code", c); } catch (e) {} return c; }
    try { return localStorage.getItem("portal-code"); } catch (e) { return null; }
  }
  async function getPortal(c) {
    if (!client || !c) return null;
    const { data, error } = await client.rpc("get_portal", { p_code: c });
    if (error) throw error;
    return data;
  }
  async function log(activity, score, total, details) {
    const c = code();
    if (!client || !c) return false;
    const { error } = await client.rpc("log_result", { p_code: c, p_activity: activity, p_score: score, p_total: total, p_details: details || {} });
    return !error;
  }
  function withCode(url) {
    const c = code();
    if (!c || !/puicumber\.github\.io/.test(url)) return url;
    return url + (url.includes("?") ? "&" : "?") + "c=" + encodeURIComponent(c);
  }
  window.Portal = { client, ready, code, getPortal, log, withCode };
})();
