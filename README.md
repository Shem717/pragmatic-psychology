# Sovereign Psychology

Research-informed education by Samuel Raymond Clow, with AI-assisted interface, educational examples and editorial synthesis. The integrated Sovereignty Method is a working framework, not a validated standalone clinical treatment.

## Run and verify

Use Node 24 LTS. `npm ci --ignore-scripts`, then `npm run check`. `npm run dev` starts development; `npm run preview:local` serves the exported production build with the generated security policy on port 8791.

The application uses Next.js 16 static generation. All public routes are rendered at build time; instruments and the notebook run in the browser. No personal reflection endpoint, account, analytics, email provider or runtime AI service is included. All seven selected video IDs are included; the four original IDs remain intact and connect to YouTube only after activation.

## Content boundary

`content/public.json` contains the deliberate public educational projection. Original private documents and source transcripts are outside this repository and must never be copied into it. Content validation rejects unreviewed status and private source markers. Public scientific summaries retain scope, limitations, access depth and explicit unknowns. Research IDs remain questions or status records, rather than completed findings. Detailed personal cases are withheld.

## Notebook

Unsaved work lives in memory. Explicit Save uses IndexedDB, with subsequent transactional autosave only for that opted-in record. Imports are bounded and validated before writes. JSON and readable Markdown exports are available. Exported notes may contain personal text and should be kept private. The app does not encrypt device storage or promise cloud backup.

## Deployment

`npm run build` validates content, exports the app to `out/`, generates a CSP from the actual inline script hashes, and audits local links and privacy markers. The build also prepares `.vercel/output/` using Vercel Build Output API v3, including route rewrites and matching response headers. Deploy that exact artifact with `vercel deploy --prebuilt` for a review preview; production release requires separate approval. The root Vercel configuration runs the same build for future source deployments. Do not mix a rebuilt HTML artifact with another build's CSP. `out/vercel.json` also supports standalone static hosting.

Full screen-reader, physical-device and field Core Web Vitals acceptance are separate from automated checks. Email features remain disabled. Original scientific/source documents and videos are not modified by this application.

## Sovereign revision

Start Here introduces a five-minute practice. Focus removes decorative motion and prioritizes the exercise; operating-system reduced-motion remains respected. The seven video companions contain timestamped takeaways and clearly marked low-risk editorial adaptations, not claims that the original videos were amended. Published research amendments are integrated into source cards. The retired corrections route redirects to Evidence. Notebook schema and storage keys are unchanged.

## Transcript evidence reviews — November 2026

`/evidence/research/` is a separate public research queue for six reviewed transcript sources. `content/research-review.json` contains concise public paraphrases, explicit assessed/pending/anecdotal categories, linked research and limits. It does not modify canonical claims, scientific acceptance, source completion counts, or notebook storage. No private transcript or Drive link is published. Filters support topic search, category and video; each claim has an addressable disclosure.

Scope for the November 5 update: R-TR-01 makes the current six-source queue reachable from Evidence and Research; R-TR-02 distinguishes evidence assessments, pending work and anecdotal/proposed content; R-TR-03 preserves public source provenance, limits and independent-review qualifications; R-TR-04 preserves all existing content and notebook behavior. Release verification uses `npm run check`, browser checks of search/category/video/reset/deep links at desktop and mobile widths, and inspection of the deployed route. These are editorial research records, not a clinical acceptance gate.

## Visual refinement — November 2026

The visual review preserves the navy, brass, serif typography and observatory artwork. R-UI-01 gives transcript reviews a distinct compact masthead, derived category-count controls and readable claim disclosures; all 149 records, their wording and evidence boundaries remain unchanged. R-UI-02 groups the canonical evidence catalogue's five advanced filters under one accessible control while preserving primary search, topic selection, active-filter feedback, URL state and comparisons. R-UI-03 presents the existing room artwork during observatory loading while preserving entry, bypass and fallback behavior. R-UI-04 preserves Focused mode, reduced-motion behavior, keyboard access and mobile layouts.

Acceptance combines before/after visual review, `npm run check`, actual desktop/mobile viewport measurements, category/search/video/reset/deep-link checks, advanced-filter and URL-state checks, and observatory loading/bypass checks. Publication uses the exact verified production artifact. This pass does not change research data, scientific status, notebook storage, access settings or the immersive homepage and library artwork.
