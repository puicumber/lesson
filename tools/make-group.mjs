// Prints assets/groups.js for the groups below. Run: node tools/make-group.mjs
// Each student gets an entry found by a hash of her own code; the classmates' codes inside
// are encrypted with her code, so the public file doesn't reveal anyone's portal link.
import { webcrypto as C } from "node:crypto";
const GROUPS = JSON.parse(process.env.GROUPS_JSON || "[]"); // [{name, start, goal, codes:[...]}]
const enc = new TextEncoder();
const sha = s => C.subtle.digest("SHA-256", enc.encode(s));
const hex = b => Buffer.from(b).toString("hex");
const b64 = b => Buffer.from(b).toString("base64");
const out = {};
for (const g of GROUPS) for (const code of g.codes) {
  const id = hex(await sha("group-id|" + code)).slice(0, 20);
  const key = await C.subtle.importKey("raw", await sha("group-key|" + code), "AES-GCM", false, ["encrypt"]);
  const iv = C.getRandomValues(new Uint8Array(12));
  const body = { name: g.name, start: g.start, goal: g.goal, mates: g.codes.filter(c => c !== code) };
  const ct = await C.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(body)));
  out[id] = { iv: b64(iv), ct: b64(ct) };
}
console.log("// Student groups for the weekly competition on the portal. Made with tools/make-group.mjs.\n// Entries are encrypted: only a student's own portal link can open hers.\nwindow.PORTAL_GROUPS = " + JSON.stringify(out, null, 2) + ";");
