import { content, validateRelationships } from "../lib/content";
import { publishedLearningPaths, validateLearningPaths } from "../lib/learning-paths";
const errors = [...validateRelationships(), ...validateLearningPaths()];
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `PASS: ${content.claims.length} claims, ${content.sources.length} sources, 6 scenarios / 24 frames, 8 disciplines, 35 research records, 38 corrections, ${content.videos.length} selected videos. Public projection only.`,
);
console.log(`PASS: ${publishedLearningPaths.length} published learning paths; references and publication gates valid.`);
