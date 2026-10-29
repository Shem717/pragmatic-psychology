import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync,mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
test('per-page CSP remains hash-only and bounded even when a global union exceeds Vercel limit',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'ppo-csp-'));
 try {
  mkdirSync(path.join(dir,'out'));
  const pages:Record<string,string>={'index.html':'window.home=1','404.html':'window.notFound=1','a.b/index.html':'window.dotted=1'};
  for(let i=0;i<700;i++)pages[`p${i}/index.html`]=`window.page=${i}`;
  for(const [file,script] of Object.entries(pages)){mkdirSync(path.dirname(path.join(dir,'out',file)),{recursive:true});writeFileSync(path.join(dir,'out',file),`<script>${script}</script><script src="/bundle.js"></script>`);}
  execFileSync(process.execPath,[path.resolve('scripts/security-headers.mjs')],{cwd:dir});
  assert.equal(existsSync(path.join(dir,"out/vercel.json")),false);
  const config=JSON.parse(readFileSync(path.join(dir,'.vercel/output/config.json'),'utf8'));
  const report=JSON.parse(readFileSync(path.join(dir,'output/security-headers.json'),'utf8'));
  assert.equal(report.pagePolicies.length,703);assert.ok(report.inlineScriptHashes*54>32768);
  for(const [file,script] of Object.entries(pages)){
   const policy=report.pagePolicies.find((p:{file:string})=>p.file===file);
   assert.deepEqual(policy.hashes,[`'sha256-${createHash('sha256').update(script).digest('base64')}'`]);
   assert.ok(Buffer.byteLength(policy.csp)<32768);assert.match(policy.csp,/script-src 'self' 'sha256-/);assert.ok(!/script-src[^;]*(unsafe-inline|unsafe-eval|https:|\*)/.test(policy.csp));
   for(const directive of ["object-src 'none'","frame-ancestors 'none'","base-uri 'self'","form-action 'self'","connect-src 'self'","upgrade-insecure-requests"])assert.ok(policy.csp.includes(directive));
   const canonical='/'+file.replace(/index\.html$/,'');
   for(const url of ['/'+file,canonical,canonical.replace(/\/$/,'')||'/']){
    const terminal=config.routes.find((r:{src?:string;dest?:string})=>r.dest&&r.src&&new RegExp(r.src).test(url));assert.equal(terminal.dest,'/'+file);assert.equal(terminal.headers['Content-Security-Policy'],policy.csp);
   }
  }
  assert.equal(config.routes.at(-1).status,404);assert.equal(config.routes.at(-1).headers['Content-Security-Policy'],report.pagePolicies.find((p:{file:string})=>p.file==='404.html').csp);
  for(const route of config.routes)for(const value of Object.values(route.headers??{}))assert.ok(String(value).length<=32768);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
