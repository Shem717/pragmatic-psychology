import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/explore",
    "/explore/perspectives",
    "/explore/identity",
    "/evidence",
    "/evidence/models",
    "/evidence/sources",
    "/research",
    "/learn",
    "/learn/method",
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
    lastModified: "2026-10-25",
  }));
}
