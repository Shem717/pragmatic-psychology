/** Editorially reviewed companions, not additional evidence or paper-level validation. */
export type SourceCompanion = {
  sharedGroup?: string;
  requiredLinks?: readonly { title: string; url: string }[];
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

const additionalCompanions: Readonly<Record<string, SourceCompanion>> = {
  "R04": {
    "title": "Erasing fear memories",
    "speaker": "Daniela Schiller and Elizabeth Phelps",
    "relationship": "Research explained",
    "publicUrl": "https://www.youtube.com/watch?v=P42DyPRdTEA",
    "passage": "Untimed transcript; closing clinical caveat verified, exact playback time unknown.",
    "adds": "The original investigators explain the experiment behind R04 and its proposed mechanism.",
    "limitation": "Historical account predates the 2018 exclusion-criteria addendum and R11’s 2020 registered failure. Do not treat permanent-erasure language as established clinical efficacy.",
    "verification": "Published transcript verified; no precise timestamp.",
    "playbackUrl": "https://www.youtube.com/watch?v=P42DyPRdTEA",
    "requiredLinks": [
      {
        "title": "2018 addendum",
        "url": "https://www.nature.com/articles/s41586-018-0405-7"
      },
      {
        "title": "Registered replication: no benefit over ordinary extinction",
        "url": "https://pubmed.ncbi.nlm.nih.gov/32580869/"
      }
    ]
  },
  "R05": {
    "title": "PTSD Treatment: Know Your Options",
    "speaker": "VA National Center for PTSD; narrator not individually named",
    "relationship": "Research explained",
    "publicUrl": "https://www.ptsd.va.gov/appvid/video/index.asp#Know_Your_Options",
    "passage": "01:16–02:18; 03:37–03:46",
    "adds": "Explains the treatment options named in R05 and frames choice as a clinician–patient decision.",
    "limitation": "Patient education, not an individualized recommendation or instructions for self-administered trauma processing. It does not validate a custom protocol.",
    "verification": "Official captions verified at 01:16–02:18 and 03:37–03:46."
  },
  "R13": {
    "title": "Self esteem, self efficacy, and locus of control",
    "speaker": "Shreena Desai / Khan Academy Medicine",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=xcLKlPTG97k",
    "passage": "Untimed; no precise timestamp verified",
    "adds": "Accessible distinction between general self-worth and belief in capability for a particular task.",
    "limitation": "Secondary educational explanation, not the 1977 study or a direct reading of the theory paper; confidence does not establish competence. Broad locus-of-control claims are not endorsed here. Shared video is not independent corroboration. Does not validate this site’s equation.",
    "verification": "Official Khan Academy lesson transcript read; matching title, credited creator and official khanacademymedicine YouTube result verified.",
    "playbackUrl": "https://www.youtube.com/watch?v=xcLKlPTG97k"
  },
  "R14": {
    "title": "Self esteem, self efficacy, and locus of control",
    "speaker": "Shreena Desai / Khan Academy Medicine",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=xcLKlPTG97k",
    "passage": "Untimed; no precise timestamp verified",
    "adds": "Accessible distinction between general self-worth and belief in capability for a particular task.",
    "limitation": "Secondary educational explanation, not the 1977 study or a direct reading of the theory paper; confidence does not establish competence. Broad locus-of-control claims are not endorsed here. Shared video is not independent corroboration. Does not validate this site’s equation.",
    "verification": "Official Khan Academy lesson transcript read; matching title, credited creator and official khanacademymedicine YouTube result verified.",
    "playbackUrl": "https://www.youtube.com/watch?v=xcLKlPTG97k"
  },
  "R15": {
    "title": "How much does our trauma shape us?",
    "speaker": "George Bonanno",
    "relationship": "Research explained",
    "publicUrl": "https://bigthinkmedia.substack.com/p/how-much-does-our-trauma-shape-us",
    "passage": "31:27 chapter: The flexibility sequence; 37:00 chapter: Why flexibility matters for healing",
    "adds": "Author explains flexible strategy selection rather than one universally best response.",
    "limitation": "Framework explanation, not a trial of the site tool. Wider trauma/history claims in the long interview are outside this recommendation. Same recording reused is not independent corroboration.",
    "verification": "Publisher video transcript reviewed. 31:27 and 37:00 are chapter starts, not exact sentence timestamps. Audiovisual playback not tested."
  },
  "R16": {
    "title": "How much does our trauma shape us?",
    "speaker": "George Bonanno",
    "relationship": "Related context",
    "publicUrl": "https://bigthinkmedia.substack.com/p/how-much-does-our-trauma-shape-us",
    "passage": "31:27 chapter: The flexibility sequence; 37:00 chapter: Why flexibility matters for healing",
    "adds": "Author explains flexible strategy selection rather than one universally best response.",
    "limitation": "General contextual explanation only, not Troy et al. study results. 2016 correction did not overturn substantive original conclusions. Same recording reused is not independent corroboration.",
    "verification": "Publisher video transcript reviewed. 31:27 and 37:00 are chapter starts, not exact sentence timestamps. Audiovisual playback not tested."
  },
  "R18": {
    "title": "Memory Re-consolidation",
    "speaker": "Karim Nader",
    "relationship": "Related context",
    "publicUrl": "https://dnalc.cshl.edu/view/1235-Memory-Re-consolidation.html",
    "passage": "Untimed official transcript; no exact timestamp.",
    "adds": "A brief definition of reconsolidation to make the meta-analysis easier to read.",
    "limitation": "Does not explain R18’s methods, effect sizes or moderators. Same clip as R03, not another independent confirmation; the meta-analysis predates R11.",
    "verification": "Official untimed transcript verified; background only."
  },
  "R19": {
    "title": "Disrupting Reconsolidation of Fear Memory in Humans by a Noradrenergic β-Blocker",
    "speaker": "Merel Kindt, Marieke Soeter and Dieuwke Sevenster (authors; narrator identity unconfirmed)",
    "relationship": "Related context",
    "publicUrl": "https://www.jove.com/v/52151/disrupting-reconsolidation-fear-memory-humans-noradrenergic",
    "passage": "07:25–08:05",
    "adds": "Shows why expectancy and defensive responses are different laboratory outcomes.",
    "limitation": "Clinical research, not DIY treatment. Narration makes strong permanent-reduction claims; retain study limits and replication cautions. Does not establish a distress target or prove imagery engages reconsolidation. R19 concerns prediction error in a specific pharmacological paradigm. Shared laboratory protocol, not an additional independent confirmation or self-help medication/exposure instructions.",
    "verification": "Official captions verified at 07:25–08:05; related protocol, not the exact study.",
    "requiredLinks": [
      {
        "title": "2022 unsuccessful near-direct replication of R20",
        "url": "https://www.nature.com/articles/s41598-022-06119-5"
      }
    ]
  },
  "R20": {
    "title": "Disrupting Reconsolidation of Fear Memory in Humans by a Noradrenergic β-Blocker",
    "speaker": "Merel Kindt, Marieke Soeter and Dieuwke Sevenster (authors; narrator identity unconfirmed)",
    "relationship": "Related context",
    "publicUrl": "https://www.jove.com/v/52151/disrupting-reconsolidation-fear-memory-humans-noradrenergic",
    "passage": "07:25–08:05",
    "adds": "Shows why expectancy and defensive responses are different laboratory outcomes.",
    "limitation": "Clinical research, not DIY treatment. Narration makes strong permanent-reduction claims; retain study limits and replication cautions. Does not establish a distress target or prove imagery engages reconsolidation. R20’s boundary result also has a 2022 unsuccessful near-direct replication. Shared laboratory protocol, not an additional independent confirmation or self-help medication/exposure instructions.",
    "verification": "Official captions verified at 07:25–08:05; related protocol, not the exact study.",
    "requiredLinks": [
      {
        "title": "2022 unsuccessful near-direct replication of R20",
        "url": "https://www.nature.com/articles/s41598-022-06119-5"
      }
    ]
  },
  "R24": {
    "title": "Structural plasticity: historical research context",
    "speaker": "Andrew Huberman",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=eIxVfln02Ss&t=5771",
    "passage": "01:36:11 official chapter start; exact spoken line time unavailable",
    "adds": "Introduces animal structural-plasticity research discussed in 2023.",
    "limitation": "Predates the October 2026 Baker experiment and does not explain its receptor manipulation or validate its cell-type-specific claim. Animal neuronal changes and behavioral proxies are not human clinical benefit. Dosing and practical material elsewhere in the episode are not recommended or reproduced here.",
    "verification": "Transcript passage reviewed; official episode dated May 8, 2023 and chapter 01:36:11 verified. This is a chapter start, not an exact spoken-line timestamp.",
    "playbackUrl": "https://www.youtube.com/watch?v=eIxVfln02Ss&t=5771"
  },
  "R25": {
    "title": "Shared historical gut–brain background",
    "speaker": "Emeran Mayer with Tom Bilyeu",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=filqDSbSOAA&t=785",
    "passage": "Two reviewed passages in one shared recording",
    "adds": "The 2018 interview predates this 2026 adjunctive trial. Use the primary paper—not the interview—for remission, symptom scores and comparator findings.",
    "limitation": "This 2018 interview is historical background, not an explanation or independent confirmation of the later papers or current FDA guidance. Do not infer psychiatric approval, transfer of beliefs, or a reason to attempt FMT.",
    "verification": "Automatic-caption passages reviewed at 13:05–14:04 and 22:23–23:13.",
    "sharedGroup": "shared-gut-brain-background"
  },
  "R26": {
    "title": "Shared historical gut–brain background",
    "speaker": "Emeran Mayer with Tom Bilyeu",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=filqDSbSOAA&t=785",
    "passage": "Two reviewed passages in one shared recording",
    "adds": "The 2018 interview predates this 2026 mixed-design review. It does not explain pooled effects, study quality or heterogeneity.",
    "limitation": "This 2018 interview is historical background, not an explanation or independent confirmation of the later papers or current FDA guidance. Do not infer psychiatric approval, transfer of beliefs, or a reason to attempt FMT.",
    "verification": "Automatic-caption passages reviewed at 13:05–14:04 and 22:23–23:13.",
    "sharedGroup": "shared-gut-brain-background"
  },
  "R27": {
    "title": "Shared historical gut–brain background",
    "speaker": "Emeran Mayer with Tom Bilyeu",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=filqDSbSOAA&t=785",
    "passage": "Two reviewed passages in one shared recording",
    "adds": "The 2018 interview does not resolve the review’s null result or internally inconsistent numerical summaries. Keep the null finding and unresolved discrepancy visible.",
    "limitation": "This 2018 interview is historical background, not an explanation or independent confirmation of the later papers or current FDA guidance. Do not infer psychiatric approval, transfer of beliefs, or a reason to attempt FMT.",
    "verification": "Automatic-caption passages reviewed at 13:05–14:04 and 22:23–23:13.",
    "sharedGroup": "shared-gut-brain-background"
  },
  "R28": {
    "title": "Shared historical gut–brain background",
    "speaker": "Emeran Mayer with Tom Bilyeu",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=filqDSbSOAA&t=785",
    "passage": "Two reviewed passages in one shared recording",
    "adds": "The 2018 interview predates this 2025 review. It does not establish its findings or resolve overlap with the other reviews.",
    "limitation": "This 2018 interview is historical background, not an explanation or independent confirmation of the later papers or current FDA guidance. Do not infer psychiatric approval, transfer of beliefs, or a reason to attempt FMT.",
    "verification": "Automatic-caption passages reviewed at 13:05–14:04 and 22:23–23:13.",
    "sharedGroup": "shared-gut-brain-background"
  },
  "R29": {
    "title": "Shared historical gut–brain background",
    "speaker": "Emeran Mayer with Tom Bilyeu",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=filqDSbSOAA&t=785",
    "passage": "Two reviewed passages in one shared recording",
    "adds": "The interview predates this 2019 stressed-donor mouse study. A proposed feedback loop is not demonstration of this experiment or human efficacy.",
    "limitation": "This 2018 interview is historical background, not an explanation or independent confirmation of the later papers or current FDA guidance. Do not infer psychiatric approval, transfer of beliefs, or a reason to attempt FMT.",
    "verification": "Automatic-caption passages reviewed at 13:05–14:04 and 22:23–23:13.",
    "sharedGroup": "shared-gut-brain-background"
  },
  "R30": {
    "title": "Shared historical gut–brain background",
    "speaker": "Emeran Mayer with Tom Bilyeu",
    "relationship": "Related context",
    "publicUrl": "https://www.youtube.com/watch?v=filqDSbSOAA&t=785",
    "passage": "Two reviewed passages in one shared recording",
    "adds": "Historical discussion of differing treatment contexts, not current FDA approval or safety guidance. The current FDA source remains authoritative for product information.",
    "limitation": "This 2018 interview is historical background, not an explanation or independent confirmation of the later papers or current FDA guidance. Do not infer psychiatric approval, transfer of beliefs, or a reason to attempt FMT.",
    "verification": "Automatic-caption passages reviewed at 13:05–14:04 and 22:23–23:13.",
    "sharedGroup": "shared-gut-brain-background"
  }
};

export const sourceCompanions: Readonly<Record<string, SourceCompanion>> = {
  ...additionalCompanions,
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
