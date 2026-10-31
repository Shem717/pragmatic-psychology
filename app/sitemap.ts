import { sourceNoteRoutes, sourceNoteHref } from "@/lib/source-note-routes";
import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { publishedLearningPaths } from "@/lib/learning-paths";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/explore",
    "/explore/perspectives",
    "/explore/identity",
    "/evidence",
    "/evidence/source-qualifications/",
    ...sourceNoteRoutes.map(note => sourceNoteHref(note.id)),
    "/evidence/models",
    "/evidence/sources",
    "/research",
    "/learn",
    "/learn/method",
    "/learn/profile",
    ...publishedLearningPaths.map((path) => "/learn/paths/" + path.slug),
    "/library",
    "/library/resources/field-guide",
    "/about",
    "/about/philosophical-foundations",
    "/privacy",
    "/accessibility",
    "/start",
    ...content.claims.map((c) => "/evidence/claims/" + c.slug),
    ...content.research.map((r) => "/research/" + r.id),
    ...content.disciplines.map((d) => "/learn/curriculum/" + d.slug),
    ...content.videos.map((v) => "/library/videos/" + v.youtubeId),
  ];
  return paths.map((path) => ({
    url: "https://pragmatic-psychology.vercel.app" + path,
    lastModified: path.startsWith("/learn/paths/") || path === "/learn/profile" ? "2026-10-26" : "2026-10-25",
  }));
}
