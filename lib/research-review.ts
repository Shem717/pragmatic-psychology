import { z } from "zod";
import raw from "@/content/research-review.json";

const publicUrl = z.string().url().refine((url) => {
  const parsed = new URL(url);
  return parsed.protocol === "https:" && !/(^|\.)(drive|docs)\.google\.com$/.test(parsed.hostname);
}, "Use a public HTTPS source, not a private document link");
const claimSchema = z.object({
  id: z.string().min(1),
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  claim: z.string().min(1),
  timestamps: z.string().min(1),
  category: z.enum(["assessed", "pending", "anecdote"]),
  independentReview: z.enum(["reviewed_bounded", "pending"]),
  verdict: z.enum(["supported_with_limits", "partly_supported", "contradicted", "insufficient_evidence", "anecdote_or_proposal", "pending"]),
  summary: z.string().min(1),
  evidenceType: z.string().min(1),
  reviewScope: z.string().optional(),
  limits: z.array(z.string()).min(1),
  sources: z.array(z.object({ title: z.string().min(1), url: publicUrl, design: z.string().optional(), limits: z.string().optional() })),
});
const reviewSchema = z.object({
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewNote: z.string().min(1),
  videos: z.array(z.object({ id: z.string(), title: z.string().min(1) })),
  claims: z.array(claimSchema),
});
export type ResearchClaim = z.infer<typeof claimSchema>;
export type ResearchCategory = ResearchClaim["category"];
export const verdictLabels: Record<ResearchClaim["verdict"], string> = {
  supported_with_limits: "Supported within limits",
  partly_supported: "Partly supported",
  contradicted: "Contradicted as stated",
  insufficient_evidence: "Insufficient evidence found",
  anecdote_or_proposal: "Anecdote or proposal",
  pending: "Evidence review pending",
};
export const researchReview = reviewSchema.parse(raw);
export function validateResearchReview(review = researchReview) {
  const errors: string[] = [];
  if (/drive\.google\.com|docs\.google\.com|samuelrclow@|\/workspace\/|\/Users\/|compact.chain|finalizer|source39|durable299/i.test(JSON.stringify(review))) errors.push("Private provenance or recovery internals in public research data");
  const ids = new Set<string>();
  const videos = new Set(review.videos.map((video) => video.id));
  for (const claim of review.claims) {
    if (ids.has(claim.id)) errors.push(`Duplicate research claim ${claim.id}`);
    ids.add(claim.id);
    if (!videos.has(claim.videoId)) errors.push(`Unknown research video ${claim.videoId}`);
    if (claim.category === "pending" && claim.verdict !== "pending") errors.push(`Pending claim carries a conclusion: ${claim.id}`);
    if (claim.category === "anecdote" && claim.verdict !== "anecdote_or_proposal") errors.push(`Anecdote carries an empirical verdict: ${claim.id}`);
    if (claim.category === "assessed" && ["pending", "anecdote_or_proposal"].includes(claim.verdict)) errors.push(`Assessment lacks a verdict: ${claim.id}`);
    if (claim.category === "assessed" && claim.independentReview !== "reviewed_bounded") errors.push(`Assessment awaits independent editorial review: ${claim.id}`);
    if (claim.category === "assessed" && !claim.sources.length && (claim.verdict !== "insufficient_evidence" || !claim.reviewScope?.trim())) errors.push(`Assessment lacks public evidence or a bounded search account: ${claim.id}`);
  }
  return errors;
}
export function researchVideoHref(videoId: string, timestamps: string) {
  const first = timestamps.match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)(?=\s|[–—-]|$)/)?.[1];
  const parts = first?.split(":").map(Number);
  const seconds = parts && parts.every((value, index) => index === 0 || value < 60)
    ? parts.reduce((total, value) => total * 60 + value, 0) : null;
  return `https://www.youtube.com/watch?v=${videoId}${seconds !== null ? `&t=${seconds}s` : ""}`;
}
export function selectResearchClaims(claims: ResearchClaim[], search: string, category: string, video: string) {
  const query = search.trim().toLowerCase();
  return claims.filter((claim) => (category === "all" || claim.category === category)
    && (video === "all" || claim.videoId === video)
    && (!query || [claim.claim, claim.summary, claim.evidenceType, ...claim.limits, ...claim.sources.map((source) => source.title)].join(" ").toLowerCase().includes(query)));
}
