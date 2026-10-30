import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const pins = new Set(["489a47c3b3099fbc578dfbfeacd58f6d1d1e0390eff9f90784a1b489d86bde63","bff1c18a2219ad0d54ef1b8d31741ccb02ffd70533bc59c5078413bb8e21cde9","d5db30ad373a305a36888f0640676ea8c2aa4dd7b5bf4ce7ca9269071b867ba1","716798eff72a92225a30d38cff6455dc7db3f3a1ebabdc50f08331340127ab28","6ed1c65f69fc5fe036926c087bfcbab0eb8dfb104feeb1a86587a3bfeeebf1da","5a4e851db2e3dd72db79790cb27a705e858c6f4a2183925ae0be25c6bc4c8c2e","e53ddf881cf0532ed6e79ddbe473da331241d0565abf34351a95b92ef61b5d55","4731900d5424b597e1273fe07ee3571a2ba79ef761189762ee8e618c6d740213","e00d414d117dca5deda1fa999cac0939d79b24bc07a2476efa035dd0354cd4d0","878eb497f172de119fcc5c23e103993fff99e4aa7a78a85eb5b2647a82f4b49a","58f4e1b368a702048fbaf848abdc1c7923e29b9db961181a8aa6ec778196efdb","ade4391d7ed31448057f3b9c478dfc46fb8f7788b13ba04e1a1f7fa45ecd4246","edb42c260a9a1b8dc41d0ace2f87404e3d6a978159caea5c9f317ca98d08c28f","5df2a5fd7cab487fce6b8e62167bebc21a811b63cdeaf45ec9c5d036c916b22c","a19736ee8a654adb8989e10c8795719e4ff3898122af52195c28da139bf91568"]);
export function restoreExpectationsBaseline(value: unknown): unknown {
 if (Array.isArray(value)) return value.filter(item=>{
  if(!item || typeof item!=='object') return true;
  const r=item as Record<string,unknown>;
  if(['CL-interpersonal-expectation-boundaries','R129','R130','R131'].includes(String(r.id)) || r.claimId==='CL-interpersonal-expectation-boundaries') {
   assert.ok(pins.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')),'Unexpected interpersonal expectation addition drift');return false;
  } return true;
 }).map(restoreExpectationsBaseline);
 if(!value||typeof value!=='object') return value;
 return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,restoreExpectationsBaseline(v)]));
}
