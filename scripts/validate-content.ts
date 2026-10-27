import { content, validateRelationships } from "../lib/content";
import { publishedLearningPaths, validateLearningPaths } from "../lib/learning-paths";
import { evidenceTaxonomy, validateEvidenceTaxonomy } from "../lib/evidence-taxonomy";
import { evidenceAssertions, validateEvidenceAssertions } from "../lib/evidence-assertions";
const errors = [...validateRelationships(), ...validateLearningPaths(), ...validateEvidenceTaxonomy(content), ...validateEvidenceAssertions(content)];
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `PASS: ${content.claims.length} claims, ${content.sources.length} sources, 6 scenarios / 24 frames, 8 disciplines, 35 research records, 38 corrections, ${content.videos.length} selected videos. Public projection only.`,
);
console.log(`PASS: ${publishedLearningPaths.length} published learning paths; references and publication gates valid.`);

console.log(`PASS: ${evidenceTaxonomy.domains.length} editorial topic domains; canonical claim, model and discipline references valid.`);

console.log(`PASS: ${evidenceAssertions.edges.length} explicit scoped source assertions; endpoints and unique assertion keys valid.`);
