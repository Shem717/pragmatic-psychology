import { z } from "zod";
import raw from "@/content/learning-paths.json";
import { content } from "./content";
import { pathRecordFields, PILOT_DISCIPLINE, PILOT_PATH_SLUG } from "./learning-path-records";

const text = z.string().min(1).max(10000);
const block = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), title: text, paragraphs: z.array(text).min(1) });
export const learningPathSchema = z.object({
  id: z.literal("LP-perspective-fit"),
  slug: z.literal(PILOT_PATH_SLUG),
  version: text,
  title: text,
  summary: text,
  primaryDiscipline: z.literal(PILOT_DISCIPLINE),
  relatedDisciplines: z.array(text),
  claimIds: z.array(text).min(1),
  sourceIds: z.array(text).min(1),
  researchIds: z.array(text),
  adjacentResearchIds: z.array(text),
  publicationStatus: z.enum(["editorial-review-required", "public-educational"]),
  review: z.object({ date: z.iso.date(), scope: text, reviewer: text, independentHumanReview: z.literal("pending") }),
  outcomes: z.array(text),
  boundaries: z.array(text),
  lesson: z.array(block),
  example: z.array(block),
  selfCheck: z.object({
    prompt: text,
    options: z.array(z.object({ id: text, text, feedback: text })).min(2).max(4),
    answerId: text,
  }).nullable(),
  prompts: z.record(z.string(), text),
  fieldLabels: z.record(z.string(), text),
  sourceEvolution: text,
  sourceContext: z.object({
    title: text, notice: text,
    anchors: z.array(z.object({ videoId: z.string().regex(/^[\w-]{11}$/), title: text, url: z.url(), publishedDate: z.iso.date(), attribution: text, role: text })).max(2),
  }),
  passports: z.array(z.object({
    id: text, claimType: text, statement: text, disposition: text,
    sourceIds: z.array(text), qualificationSourceIds: z.array(text),
    assumptions: text, evaluation: text, revisionCondition: text, notImplied: z.array(text),
  })).max(6),
}).superRefine((path, ctx) => {
  if (path.publicationStatus !== "public-educational") return;
  for (const key of ["outcomes", "boundaries", "lesson", "example"] as const) {
    if (!path[key].length) ctx.addIssue({ code: "custom", path: [key], message: "Published learning paths require complete reviewed copy." });
  }
  if (!path.selfCheck || !path.selfCheck.options.some((option) => option.id === path.selfCheck?.answerId)) {
    ctx.addIssue({ code: "custom", path: ["selfCheck"], message: "Published paths require an explanatory self-check with a valid answer." });
  }
  for (const { key } of pathRecordFields) {
    if (!path.prompts[key]) ctx.addIssue({ code: "custom", path: ["prompts", key], message: "Missing reviewed field prompt." });
    if (!path.fieldLabels[key]) ctx.addIssue({ code: "custom", path: ["fieldLabels", key], message: "Missing reviewed field label." });
  }
  if (path.passports.length !== 6) ctx.addIssue({ code: "custom", path: ["passports"], message: "The bounded release requires six reviewed proposition records." });
});
export const learningPathCatalogSchema = z.object({ version: text, paths: z.array(learningPathSchema).max(1) });
export const learningPathCatalog = learningPathCatalogSchema.parse(raw);
export type LearningPath = z.infer<typeof learningPathSchema>;
export const publishedLearningPaths = learningPathCatalog.paths.filter((path) => path.publicationStatus === "public-educational");
export function getLearningPath(slug: string) {
  return publishedLearningPaths.find((path) => path.slug === slug);
}
export function validateLearningPaths(catalog = learningPathCatalog) {
  const errors: string[] = [];
  for (const path of catalog.paths) {
    const references = [
      ["discipline", [path.primaryDiscipline, ...path.relatedDisciplines], content.disciplines.map((item) => item.slug)],
      ["claim", path.claimIds, content.claims.map((item) => item.id)],
      ["source", path.sourceIds, content.sources.map((item) => item.id)],
      ["research", [...path.researchIds, ...path.adjacentResearchIds], content.research.map((item) => item.id)],
    ] as const;
    for (const [kind, ids, available] of references) {
      if (new Set(ids).size !== ids.length) errors.push(`Duplicate learning path ${kind} reference`);
      for (const id of ids) if (!available.includes(id)) errors.push(`Missing learning path ${kind} ${id}`);
    }
    for (const blocks of [path.lesson, path.example]) {
      if (new Set(blocks.map((item) => item.id)).size !== blocks.length) errors.push("Duplicate learning path block ID");
    }
    if (path.selfCheck && new Set(path.selfCheck.options.map((item) => item.id)).size !== path.selfCheck.options.length) errors.push("Duplicate self-check option ID");
    for (const key of Object.keys(path.prompts)) if (!pathRecordFields.some((field) => field.key === key)) errors.push(`Unknown learning path prompt ${key}`);
    if (new Set(path.passports.map((item) => item.id)).size !== path.passports.length) errors.push("Duplicate proposition ID");
    for (const passport of path.passports) for (const id of [...passport.sourceIds, ...passport.qualificationSourceIds]) {
      if (!content.sources.some((source) => source.id === id)) errors.push(`Missing proposition source ${id}`);
    }
    for (const anchor of path.sourceContext.anchors) {
      const url = new URL(anchor.url);
      if (url.protocol !== "https:" || url.hostname !== "www.youtube.com" || url.searchParams.get("v") !== anchor.videoId) errors.push("Invalid authorial video identity");
    }
  }
  if (/docs\.google\.com|drive\.google\.com|private-reference|READABLE-THREAD/i.test(JSON.stringify(catalog))) errors.push("Private source context in learning path projection");
  return errors;
}
