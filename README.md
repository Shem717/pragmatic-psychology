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
