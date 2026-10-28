# Perspective-fit provenance ledger

This additive ledger records the basis of the existing perspective-fit lesson. It is not a new scientific appraisal, independent human review, efficacy assessment, participant count or rank system.

## Boundaries

- Existing canonical content, assertions, learning copy, IDs and routes are unchanged.
- The ledger contains the current flexibility claim and six proposition snapshots. Earlier revision snapshots are unavailable; dated history notes are not reconstructed versions.
- Reports, study/sample records, publication notices, source locators, review decisions and learning dependencies are distinct entities. Their IDs are references, never evidence votes.
- The R16 / R60 Study 3 connection is a shared Denver project, not established participant independence. The exact participant intersection remains unknown. Separate controllability raters are not added to the primary participant sample.
- R32’s methodological comment and reply remain an unresolved dispute. Neither is a retraction or independent replication.
- R16’s corrected scores and changed secondary significance results remain linked to the original report, not counted as a new study.
- Source locators retain their actual precision and access limits. A recorded page range or abstract is not a character-exact span. Missing precise spans stay unknown. No raw transcripts, private documents or private review receipts are published.
- Source-locator mappings describe the current recorded source map, not a reconstruction of historical read receipts. Report metadata snapshots are not original document-byte snapshots; retrieved edition identity remains unspecified. Study/sample entities cover only the explicit shared-project question, not all studies in every cited report.
- Recorded historical AI reviews are distinguished from the current transcription. Independent human scientific review remains pending. No source-check assurance is promoted.

## Contracts and updates

`content/pilot-provenance.json` is the bounded data sidecar. `lib/pilot-provenance.ts` validates typed relationships, reciprocal decisions, current snapshots and dependency coverage. `scripts/validate-content.ts` additionally verifies SHA-256 snapshot hashes with recursively key-sorted canonical JSON. Validation is part of the normal build.

The versioned scientific mapping digest covers report wrappers, inspected source URLs, locator identities/precision/text/basis, study/sample metadata, lineage, decision relationships and assertion bindings. Each learning dependency pins that mapping version and digest. Replacing a DOI landing page, author-hosted PDF URL or passage locator under the saved mapping invalidates the mapping and dependent lesson checks. Updating only the mapping digest does not update those pinned dependencies. Metadata integrity does not verify original paper bytes, DNS/public routability or scientific truth. A deliberate update of all pins remains a version-controlled editorial change requiring independent review; hashes are not signatures or tamper-proof storage.

Scientific assertion bindings and lineage must use scientific-source locators; an assertion locator also needs a recorded decision relationship. Caption attribution is not interchangeable with these records. A study record requires at least one primary report, not merely corrections, comments, replies or reviews; this requirement does not establish sample independence. URL syntax guards reject credentials, IP literals and local hostnames; they perform no DNS resolution or network request and do not certify a destination’s public routability.

A future content change must introduce an explicitly reviewed revision/dependency update. It must not edit a historical snapshot merely to make a hash pass. The current first-ledger contract intentionally refuses fabricated predecessor snapshots. A future historical-revision extension requires its own reviewed schema change. The present ledger is version-controlled, not an append-only database or cryptographically signed audit service.

Decision restrictions apply to the stated scope: an unresolved methods dispute can coexist with qualified educational publication, while unsupported universal rankings and independent-cohort counting remain held. A decision marked `held`, missing dependency, changed snapshot or hash mismatch blocks content validation. Source or passport updates must not silently rewrite learner work.

## Interface

“Trace this conclusion” is collapsed by default. Source locations and decision details are further optional disclosures. Existing imperial/celestial styling and accessible native disclosure controls are retained.

Relationship labels distinguish legacy reading aids, reviewed scoped assertions, and reviewed assertions with version-linked provenance. These describe traceability, not evidence strength. A missing structured edge does not disprove a claim.

The complete 0–4 educational definitions are shown as optional profile guidance. Existing stored ratings remain unchanged and unverified; no milestone is awarded. The five existing provisional milestones remain requirements, not ranks assigned by the application.

## Verification

Run `npm run check`. The pilot tests include current/hash integrity, unresolved methods conflict, shared-project uncertainty, corrections and dependent lessons, unknown locators, no invented historical versions or human review, legacy labels, optional public-safe markup and unchanged self-rating behavior.

No persistence schema, notebook import/export, account, network endpoint, dependency, production setting or recurring process is added.
