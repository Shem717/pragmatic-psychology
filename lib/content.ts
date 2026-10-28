import { z } from "zod";
import raw from "@/content/public.json";

const text = z.string().min(1);
const publication = z.literal("public-educational");
const sourceSchema = z.object({
  id: text,
  title: text,
  url: z.url().refine((u) => u.startsWith("https://")),
  accessDepth: text,
  summary: text,
  checkedAt: text,
  retractionStatus: z.literal("unknown"),
  sampleSize: z.number().nullable(),
  sampleSizeNote: text.max(2000).optional(),
  relatedPublications: z.array(z.object({
    relation: z.enum(["methodological-comment", "author-reply", "cited-report-retraction"]),
    title: text.max(300),
    url: z.url().refine((url) => url.startsWith("https://")),
    note: text.max(2000),
  })).min(1).max(8).refine((items) => new Set(items.map((item) => `${item.relation}:${item.url}`)).size === items.length, "Duplicate related publication").optional(),
  design: text,
  population: text,
  authors: z.array(text),
  authorListComplete: z.boolean().optional(),
  correctionNote: text.optional(),
  correctionUrl: z.url().optional(),
  year: z.number().nullable(),
});
const frameSchema = z.object({
  id: text,
  name: text,
  interpretation: text,
  action: text,
  switchWhen: text,
  ethicalBoundary: text,
  supports: z.array(text).min(1),
  challenges: z.array(text).min(1),
  sourceNote: text,
});
const claimSchema = z.object({
  id: text,
  slug: text,
  title: text,
  shortTitle: text,
  statement: text,
  takeaway: text,
  scope: text,
  kind: z.enum([
    "empirical-finding",
    "theoretical-model",
    "mechanistic-inference",
    "research-hypothesis",
    "personal-observation",
    "philosophical-teaching",
  ]),
  confidence: text,
  confidenceRationale: text,
  limitations: z.array(text).min(1),
  sourceIds: z.array(text),
  challengeSourceIds: z.array(text),
  relatedClaimIds: z.array(text).max(8).refine((ids) => new Set(ids).size === ids.length, "Duplicate related claim").optional(),
  implications: z.array(text),
  notImplied: z.array(text),
  questions: z.array(text),
  researchQuestionIds: z.array(text),
  population: text,
  reviewedAt: text,
  reviewStatus: text,
  replacementSlug: text.optional(),
  reviewer: text,
  publicationStatus: publication,
  contentVersion: text,
  history: z.array(z.object({ date: text, change: text })),
});
export const publicSchema = z.object({
  version: text,
  date: text,
  attribution: text,
  sources: z.array(sourceSchema),
  claims: z.array(claimSchema),
  scenarios: z.array(
    z.object({
      id: text,
      title: text,
      scope: text,
      facts: z.array(text),
      unknowns: z.array(text),
      frames: z.array(frameSchema).min(4),
      evidenceUpdates: z.array(
        z.object({ id: text, fact: text, interpretation: text }),
      ),
      relatedClaimIds: z.array(text),
      contentVersion: text,
      publicationStatus: publication,
    }),
  ),
  disciplines: z.array(
    z.object({
      id: text,
      title: text,
      slug: text,
      learningGoal: text,
      practiceTitle: text,
      practice: text,
      artifact: text,
      link: text,
      publicationStatus: publication,
    }),
  ),
  research: z.array(
    z.object({
      id: text,
      summary: text,
      status: text,
      subtype: text,
      publicationStatus: publication,
      reviewedAt: text,
      nextStep: text,
      falsifier: text,
    }),
  ),
  corrections: z.array(
    z.object({
      id: text,
      priority: text,
      text: text,
      sourceIds: z.array(text),
      status: text,
    }),
  ),
  videos: z.array(
    z.object({
      id: text,
      youtubeId: text,
      episode: z.number(),
      title: text,
      platformTitle: text,
      summary: text,
      correctionIds: z.array(text),
      takeaways: z.array(z.object({ title: text, text: text, timestamp: text.optional(), seconds: z.number().optional() })).optional(),
      example: text.optional(),
      action: text.optional(),
      reflection: text.optional(),
      evidenceNote: text.optional(),
      evidenceUrls: z.array(z.url()).optional(),
      sourceNote: text.optional(),
      relatedClaimSlugs: z.array(text).optional(),
      transcriptStatus: text,
      rights: text,
      publicationStatus: publication,
    }),
  ),
  models: z.array(
    z.object({
      id: text,
      title: text,
      focus: text,
      prediction: text,
      limits: text,
      sourceIds: z.array(text),
      evidence: text,
    }),
  ),
});
export const content = publicSchema.parse(raw);
export type Claim = z.infer<typeof claimSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Scenario = (typeof content.scenarios)[number];
export type Frame = z.infer<typeof frameSchema>;
export const getClaim = (id: string) =>
  content.claims.find((c) => c.id === id || c.slug === id);
export const getSource = (id: string) =>
  content.sources.find((s) => s.id === id);
export const kindLabel = (s: string) => s.replaceAll("-", " ");
export function validateRelationships(data = content) {
  const errors: string[] = [];
  for (const [name, items] of Object.entries({
    claims: data.claims,
    sources: data.sources,
    scenarios: data.scenarios,
    disciplines: data.disciplines,
    research: data.research,
    corrections: data.corrections,
    videos: data.videos,
  })) {
    const ids = items.map((x) => x.id);
    if (new Set(ids).size !== ids.length) errors.push(`Duplicate ${name} ID`);
  }
  for (const c of [...data.claims, ...data.models, ...data.corrections])
    for (const id of c.sourceIds)
      if (!data.sources.some((s) => s.id === id))
        errors.push(`Missing source ${id}`);
  for (const c of data.claims)
    for (const id of c.challengeSourceIds)
      if (!data.sources.some((s) => s.id === id))
        errors.push(`Missing challenge source ${id}`);
  for (const c of data.claims)
    for (const id of c.relatedClaimIds ?? [])
      if (id === c.id || !data.claims.some((related) => related.id === id))
        errors.push(`Invalid related claim ${id} on ${c.id}`);
  for (const s of data.scenarios)
    for (const id of s.relatedClaimIds)
      if (!data.claims.some((c) => c.id === id))
        errors.push(`Missing claim ${id}`);
  for (const c of data.claims)
    for (const id of c.researchQuestionIds)
      if (!data.research.some((r) => r.id === id))
        errors.push(`Missing research ${id}`);
  for (const v of data.videos)
    for (const id of v.correctionIds)
      if (!data.corrections.some((c) => c.id === id))
        errors.push(`Missing correction ${id}`);
  const text = JSON.stringify(data);
  // Publication years are public bibliography, not autobiographical narrative.
  // Retain the legacy sensitive-year guard everywhere else without corrupting valid source dates.
  const narrativeText = JSON.stringify({ ...data, sources: data.sources.map((source) => ({ ...source, year: typeof source.year === "number" ? null : source.year })) });
  if (
    /docs\.google\.com|private-reference|READABLE-THREAD|AHj4eM|Dragon Ball|romantic longing/i.test(
      text,
    ) || /2011/.test(narrativeText)
  )
    errors.push("Private source context in public projection");
  if (
    data.disciplines.length !== 8 ||
    data.research.length !== 35 ||
    data.scenarios.length !== 6 ||
    data.corrections.length !== 38
  )
    errors.push("Incomplete content inventory");
  if (
    data.videos.map((v) => v.youtubeId).join(",") !==
    "TOTW_bsKkbE,eX1_yI7scug,AipBMvDBw70,ieR3n0laLAg,nqWsMb06W0I,EB5E24TSBuk,CorAKleaql4"
  )
    errors.push("Video identity changed");
  if (new Set(data.videos.map((v) => v.youtubeId)).size !== data.videos.length) errors.push("Duplicate video identity");
  return errors;
}
