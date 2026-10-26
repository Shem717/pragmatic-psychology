/** Editorially reviewed companions, not additional evidence or paper-level validation. */
export type SourceCompanion = {
  title: string;
  speaker: string;
  relationship: 'Research explained' | 'Related context' | 'Practical application';
  publicUrl: string;
  playbackUrl?: string;
  passage: string;
  adds: string;
  limitation: string;
  verification: string;
};

export const sourceCompanions: Readonly<Record<string, SourceCompanion>> = {
  R12: {
    title: 'Constructing emotion',
    speaker: 'Lisa Feldman Barrett with Tom Bilyeu',
    relationship: 'Research explained',
    publicUrl: 'https://www.youtube.com/watch?v=Tv1kRqzg0AQ&t=534',
    playbackUrl: 'https://www.youtube.com/watch?v=Tv1kRqzg0AQ&t=534',
    passage: '08:54–09:10 · theory explanation',
    adds: 'The author explains emotion as making sense of bodily changes in context.',
    limitation: 'An explanation of the author’s theory, not validation of this site’s method. The selected passage does not name the 2017 paper.',
    verification: 'Reviewed caption passage, 08:54–09:10; not a title-only match.',
  },
  R17: {
    title: 'How to make stress your friend',
    speaker: 'Kelly McGonigal · TED',
    relationship: 'Research explained',
    publicUrl: 'https://www.youtube.com/watch?v=RcGyVTAoXEU&t=304',
    playbackUrl: 'https://www.youtube.com/watch?v=RcGyVTAoXEU&t=304',
    passage: '05:04–06:30 · stress-test passage',
    adds: 'Explains a matching stress-test reappraisal procedure and cardiovascular outcomes.',
    limitation: 'Paper identity is inferred from the matching procedure and outcomes, not named aloud. The small, short-term study does not establish a clinical cure or long-term protection; the talk’s mortality and oxytocin claims are separate.',
    verification: 'Official TED transcript reviewed around 05:04–06:30; exact-paper match is inferred.',
  },
  R03: {
    title: 'Memory Re-consolidation',
    speaker: 'Karim Nader · Cold Spring Harbor Laboratory',
    relationship: 'Related context',
    publicUrl: 'https://dnalc.cshl.edu/view/1235-Memory-Re-consolidation.html',
    passage: 'Short explanation · untimed',
    adds: 'Introduces reconsolidation as a possible restorage process after memory reactivation.',
    limitation: 'Mechanism vocabulary, not narration of the rat experiment or evidence for self-treatment, imagery-based erasure, or this site’s exercises.',
    verification: 'Official CSHL transcript reviewed; no passage timestamp verified. Opens the official player externally.',
  },
  R07: {
    title: 'What People Don’t Understand About OCD',
    speaker: 'Alok Kanojia · HealthyGamerGG',
    relationship: 'Related context',
    publicUrl: 'https://www.youtube.com/watch?v=Sz9bg3GMNGU',
    playbackUrl: 'https://www.youtube.com/watch?v=Sz9bg3GMNGU',
    passage: 'Full video · passage untimed',
    adds: 'Explains that compulsions can be invisible mental acts, not only visible rituals.',
    limitation: 'Context for mental compulsions, not an explanation of the NIMH page, an ERP tutorial, or evidence for custom mental rehearsal. Medication claims from the video are not adopted here.',
    verification: 'Transcript passage reviewed; the reviewed copy has no cue timestamps, so playback starts at the beginning.',
  },
  R31: {
    title: 'Depression Mental Health Minute',
    speaker: 'National Institute of Mental Health',
    relationship: 'Related context',
    publicUrl: 'https://www.nimh.nih.gov/news/media/2020/depression-mental-health-minute',
    playbackUrl: 'https://www.youtube.com/watch?v=lQhpetkwWnM',
    passage: 'One-minute overview · untimed',
    adds: 'Places medication alongside talk therapy and, sometimes, brain stimulation in depression care.',
    limitation: 'A 2020 educational overview, not coverage of every medication class or current drug-specific guidance. Use the current NIMH source above for medication information.',
    verification: 'Official NIMH transcript and embedded YouTube identity verified; no passage timestamp supplied.',
  },
};

export function getSourceCompanion(sourceId: string): SourceCompanion | undefined {
  return Object.hasOwn(sourceCompanions, sourceId) ? sourceCompanions[sourceId] : undefined;
}
