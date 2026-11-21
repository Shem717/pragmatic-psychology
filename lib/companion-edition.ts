import { content } from './content';

type VideoRecord = (typeof content.videos)[number];

function passage(id: string, label: string, title: string, text = '') {
  return { id, label, title, text };
}
export type CompanionPassage = ReturnType<typeof passage>;

export const takeawayGuidance = 'Practical companion guidance adapted from the linked discussion and framed by current evidence. Source moments identify the topic, not a verbatim instruction.';
export const editionGuidance = 'This is an interactive edition of the existing video companion—not a transcript or a published book by the speaker. The written practices are editorial adaptations guided by current evidence.';
export const practiceHelp = 'Use the existing workspaces to write and deliberately save your own notes. This reader does not record activity or assign a score.';
export const watchGuidance = 'The original video remains distinct from this written companion. YouTube is contacted only when you choose Load video.';
export const readerTakeawayGuidance = 'Source moments identify the discussion topic. These written steps are editorial adaptations, not verbatim instructions or proof of effectiveness.';
export const methodScope = 'The integrated Sovereignty Method is an educational framework, not a validated standalone clinical treatment.';

export function makeCompanionEdition(video: VideoRecord, shortTitle: string, wing: string) {
  const worksheet = video.episode === 7 ? {
    ...passage('habit-payoff', 'Supporting worksheet', 'Before choosing a replacement, examine the payoff.',
      'Keep the cue, small replacement and environmental support above. Add an expected-versus-observed payoff check, including immediate and later consequences. This separate worksheet draws on a Judson Brewer interview; it is not an additional video in the selected collection.'),
    href: '/learn/curriculum/self-command/#practice-habit-payoff',
  } : null;
  return {
    overview: passage('overview', 'Volume overview', video.title, video.summary),
    shelf: passage('shelf', 'Library shelf', shortTitle, wing),
    takeawayIntro: passage('takeaways', 'Takeaways', 'Key actionable takeaways', takeawayGuidance),
    takeaways: (video.takeaways ?? []).map((item, i) => ({
      ...passage('takeaway-' + (i + 1), item.timestamp ? 'Takeaway · ' + item.timestamp : 'Takeaway', item.title, item.text),
      timestamp: item.timestamp, seconds: item.seconds ?? 0,
    })),
    practice: passage('practice', 'Practice', 'One situation. A small next step.'),
    exercises: [
      passage('example', 'Worked example', 'Example', video.example),
      passage('action', 'Practice', 'Try this', video.action),
      passage('reflection', 'Reflection', 'Reflect', video.reflection),
    ].filter(item => item.text),
    practiceTools: passage('practice-tools', 'Practice tools', 'Using the workspaces', practiceHelp),
    practiceLinks: [
      { ...passage('plan-a-response', 'Practice link', 'Plan a response'), href: '/explore/perspectives/' },
      { ...passage('build-a-capability', 'Practice link', 'Build and test a capability'), href: '/explore/identity/' },
      { ...passage('my-notes', 'Practice link', 'My notes'), href: '/notebook/' },
    ],
    worksheet,
    worksheetLink: worksheet ? passage('worksheet-link', 'Worksheet link', 'Open the habit payoff worksheet') : null,
    watch: passage('watch', 'Watch', 'Watch the original video', watchGuidance),
    takeawayNote: passage('takeaway-scope', 'Source note', 'Reading source moments', readerTakeawayGuidance),
    evidence: passage('evidence-note', 'Evidence note', 'Scope and evidence', video.evidenceNote),
    original: passage('original-title', 'Original video title', video.platformTitle,
      video.youtubeId === 'TOTW_bsKkbE' ? 'This title is the creator’s description of the video. It should not be taken as a claim that the video or this companion provides a proven fix for anxiety. This companion offers educational reflection prompts; it does not diagnose or treat an anxiety disorder.' : ''),
    context: passage('source-context', 'Source note', 'Source context and evidence', video.sourceNote || video.transcriptStatus),
    rights: passage('editorial-rights', 'Source note', 'Rights and adaptation', video.rights + ' The written takeaways are editorial adaptations, not a redistributed transcript or a claim that the original video has been changed.'),
    editionNote: passage('edition-note', 'Source note', 'How to read this volume', editionGuidance),
    methodNote: passage('method-scope', 'Source note', 'Scope of the method', methodScope),
    references: (video.evidenceUrls ?? []).map((url, i) => ({
      ...passage('reference-' + (i + 1), 'Supporting source', new URL(url).hostname.replace(/^www\./, ''), 'Supporting reference ' + (i + 1)),
      href: url,
    })),
    claims: (video.relatedClaimSlugs ?? []).map(slug => ({
      ...passage('claim-' + slug, 'Related claim', content.claims.find(claim => claim.slug === slug)?.shortTitle ?? slug),
      href: '/evidence/claims/' + slug + '/',
    })),
  };
}

export type CompanionEdition = ReturnType<typeof makeCompanionEdition>;

export function editionPassages(edition: CompanionEdition): CompanionPassage[] {
  return [
    edition.overview, edition.shelf, ...edition.takeaways, ...edition.exercises,
    ...(edition.worksheet ? [edition.worksheet] : []), ...(edition.worksheetLink ? [edition.worksheetLink] : []),
    edition.evidence, edition.original, edition.watch, edition.practiceTools, ...edition.practiceLinks, edition.takeawayNote,
    edition.takeawayIntro, edition.practice, edition.context, edition.rights, edition.editionNote,
    edition.methodNote, ...edition.references, ...edition.claims,
  ];
}
