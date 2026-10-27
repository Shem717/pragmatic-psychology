import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { content } from '../lib/content';
import { claimRelationships, relationshipLabels } from '../lib/evidence';
import { EvidenceDeskSources } from '../features/observatory/EvidenceDesk';
const claim=(id:string)=>content.claims.find(item=>item.id===id)!;

test('Observatory source connections use every canonical role exactly once, including context and mixed pairs',()=>{
  for(const id of ['CL-situation-instruction-package','CL-action-planning-timing','CL-depletion-belief-boundaries','CL-habit-context','CL-imagery']){
    const c=claim(id),relationships=claimRelationships(c),html=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:c}));
    assert.equal((html.match(/data-source-id=/g)||[]).length,relationships.length);
    for(const r of relationships){
      assert.equal(html.split(`data-source-id="${r.sourceId}"`).length-1,1);
      assert.ok(html.includes(`data-source-id="${r.sourceId}" data-role="${r.role}"`));
      assert.ok(html.includes(relationshipLabels[r.role].replaceAll('&','&amp;')));
      assert.ok(html.includes(`/evidence/claims/${c.slug}#connection-${r.sourceId}`));
    }
    assert.doesNotMatch(html,/Recorded supporting sources|Counterevidence recorded/);
  }
  for(const [claimId,sourceId,role] of [['CL-situation-instruction-package','R63','context'],['CL-situation-instruction-package','R65','multiple'],['CL-depletion-belief-boundaries','R67','multiple'],['CL-habit-context','R64','multiple'],['CL-imagery','R21','qualifies']])assert.equal(claimRelationships(claim(claimId)).find(r=>r.sourceId===sourceId)?.role,role);
});

test('Observatory empty/source role presentation preserves selection and retired-record handling with dossier scope anchors',()=>{
  const html=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:claim('CL-identity')}));
  assert.match(html,/No source connection is recorded/);assert.match(html,/not proof that no counterevidence exists/);assert.doesNotMatch(html,/data-source-id=/);
  const desk=readFileSync('features/observatory/EvidenceDesk.tsx','utf8');
  assert.match(desk,/filterObservatoryClaims\(content.claims,query\)/);assert.match(desk,/resolveObservatoryClaim\(claims,selected\)/);assert.match(desk,/!isRetiredClaim\(claim\)/);
  assert.doesNotMatch(desk,/claim\?\.(?:sourceIds|challengeSourceIds)/);
  const dossier=readFileSync('app/evidence/claims/[slug]/page.tsx','utf8');assert.ok(dossier.includes('id={`connection-${r.sourceId}`}'));
});
