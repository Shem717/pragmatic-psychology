import { z } from 'zod';
import raw from '@/content/evidence-taxonomy.json';
import type { Claim } from './content';
import { disciplineSlugs } from './indices';
export type EvidenceCatalog = Pick<typeof import('./content').content, 'claims' | 'models' | 'disciplines'>;
import { isRetiredClaim } from './claim-status';

const text = z.string().min(1).max(2000);
const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const disciplineLink = z.object({ discipline: id, rationale: text });
export const dispositionLabels = {
  'supported-within-scope': 'Supported within the stated scope',
  qualified: 'Qualified by scope and limitations',
  unresolved: 'Unresolved / benefit not established',
  'not-appraised': 'No disposition summary recorded',
} as const;
export const domainRelationLabels = { subject: 'Subject connection', 'boundary-context': 'Boundary / related context' } as const;
export const evidenceTaxonomySchema = z.object({
  version: text,
  review: z.object({ status: z.literal('editorial-navigation-reviewed'), date: z.iso.date(), scope: text, reviewer: text, humanScientificReview: z.literal('pending') }),
  domains: z.array(z.object({
    id, title: text, question: text, summary: text,
    disciplineLinks: z.array(disciplineLink),
    modelLinks: z.array(z.object({ modelId: id, rationale: text })),
  })).min(1),
  claimFacets: z.array(z.object({
    claimId: z.string().min(1),
    disposition: z.enum(['supported-within-scope', 'qualified', 'unresolved', 'not-appraised']),
    dispositionRationale: text,
    domainLinks: z.array(z.object({ domainId: id, relation: z.enum(['subject', 'boundary-context']), rationale: text })),
    disciplineLinks: z.array(disciplineLink),
  })),
});
export const evidenceTaxonomy = evidenceTaxonomySchema.parse(raw);
export type EvidenceTaxonomy = z.infer<typeof evidenceTaxonomySchema>;
export type EvidenceDomain = EvidenceTaxonomy['domains'][number];
export type ClaimFacet = EvidenceTaxonomy['claimFacets'][number];
export function claimFacet(claimId: string, taxonomy = evidenceTaxonomy) {
  return taxonomy.claimFacets.find((item) => item.claimId === claimId);
}
export function currentEvidenceClaims(claims: Claim[]) {
  return claims.filter((claim) => claim.publicationStatus === 'public-educational' && !isRetiredClaim(claim));
}
export function validateEvidenceTaxonomy(data: EvidenceCatalog, taxonomy = evidenceTaxonomy) {
  const errors: string[] = [];
  const unique = (values: string[], label: string) => { if (new Set(values).size !== values.length) errors.push(`Duplicate ${label}`); };
  const disciplineIds = data.disciplines.map((item) => item.slug);
  const domains = taxonomy.domains.map((item) => item.id);
  unique(domains, 'evidence domain');
  unique(taxonomy.claimFacets.map((item) => item.claimId), 'claim facet');
  const checkDisciplines = (links: {discipline: string}[], label: string) => {
    unique(links.map((item) => item.discipline), `${label} discipline link`);
    for (const link of links) if (!disciplineIds.includes(link.discipline)) errors.push(`Missing discipline ${link.discipline}`);
  };
  for (const domain of taxonomy.domains) {
    checkDisciplines(domain.disciplineLinks, domain.id);
    unique(domain.modelLinks.map((item) => item.modelId), `${domain.id} model link`);
    for (const link of domain.modelLinks) if (!data.models.some((model) => model.id === link.modelId)) errors.push(`Missing model ${link.modelId}`);
  }
  for (const facet of taxonomy.claimFacets) {
    if (!data.claims.some((claim) => claim.id === facet.claimId)) errors.push(`Missing canonical claim ${facet.claimId}`);
    unique(facet.domainLinks.map((item) => item.domainId), `${facet.claimId} domain link`);
    for (const link of facet.domainLinks) if (!domains.includes(link.domainId)) errors.push(`Missing domain ${link.domainId}`);
    checkDisciplines(facet.disciplineLinks, facet.claimId);
  }
  if (/docs\.google\.com|private-reference|READABLE-THREAD|source-cache|\/workspace\//i.test(JSON.stringify(taxonomy))) errors.push('Private context in public evidence taxonomy');
  return errors;
}
export const initialEvidenceFilters = { q: '', kind: 'all', population: 'all', confidence: 'all', domain: 'all', discipline: 'all', disposition: 'all' };
export type EvidenceFilters = typeof initialEvidenceFilters;
export function filterEvidenceClaims(claims: Claim[], filters: EvidenceFilters, taxonomy = evidenceTaxonomy) {
  const query = filters.q.trim().toLowerCase();
  return currentEvidenceClaims(claims).filter((claim) => {
    const facet = claimFacet(claim.id, taxonomy);
    const domainNames = facet?.domainLinks.map((link) => taxonomy.domains.find((domain) => domain.id === link.domainId)?.title || '').join(' ') || '';
    return (filters.domain === 'all' || facet?.domainLinks.some((link) => link.domainId === filters.domain))
      && (filters.discipline === 'all' || facet?.disciplineLinks.some((link) => link.discipline === filters.discipline))
      && (filters.disposition === 'all' || (facet?.disposition || 'not-appraised') === filters.disposition)
      && (filters.kind === 'all' || claim.kind === filters.kind)
      && (filters.population === 'all' || claim.population === filters.population)
      && (filters.confidence === 'all' || claim.confidence === filters.confidence)
      && `${claim.id} ${claim.title} ${claim.statement} ${claim.researchQuestionIds.join(' ')} ${domainNames}`.toLowerCase().includes(query);
  });
}
/** No category or source count changes confidence, review status or claim identity. */
export function parseEvidenceQuery(search: string, claims: Claim[], taxonomy = evidenceTaxonomy) {
  const params = new URLSearchParams(search);
  const choice = (key: string, values: string[]) => values.includes(params.get(key) || '') ? params.get(key)! : 'all';
  const filters: EvidenceFilters = {
    q: (params.get('q') || '').slice(0, 500),
    kind: choice('kind', claims.map((claim) => claim.kind)),
    population: choice('population', claims.map((claim) => claim.population)),
    confidence: choice('confidence', claims.map((claim) => claim.confidence)),
    domain: choice('domain', taxonomy.domains.map((domain) => domain.id)),
    discipline: choice('discipline', disciplineSlugs),
    disposition: choice('disposition', Object.keys(dispositionLabels)),
  };
  const current = currentEvidenceClaims(claims);
  return {
    filters,
    selected: current.find((claim) => claim.slug === params.get('claim'))?.id || current[0]?.id || '',
    compare: Array.from(new Set((params.get('compare') || '').split(','))).flatMap((slug) => {
      const claim = current.find((item) => item.slug === slug); return claim ? [claim.id] : [];
    }).slice(0, 3),
  };
}
export function serializeEvidenceQuery(filters: EvidenceFilters, selected: string, compare: string[], claims: Claim[]) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  for (const key of ['kind','population','confidence','domain','discipline','disposition'] as const) if (filters[key] !== 'all') params.set(key, filters[key]);
  const claim = claims.find((item) => item.id === selected);
  if (claim && claim !== claims[0]) params.set('claim', claim.slug);
  const compared = Array.from(new Set(compare)).flatMap((id) => { const item = claims.find((c) => c.id === id); return item ? [item.slug] : []; }).slice(0,3);
  if (compared.length) params.set('compare', compared.join(','));
  return params.toString();
}
export function topicClaimCount(domainId: string, claims: Claim[]) {
  return filterEvidenceClaims(claims, { ...initialEvidenceFilters, domain: domainId }).length;
}
