import { searchWords, singular } from './search-words';
import { sourceNoteHref, type sourceNoteRoutes } from './source-note-routes';

export const concernGroups = [
  { id: 'feelings', title: 'Worry and emotions' },
  { id: 'habits', title: 'Attention and habits' },
  { id: 'relationships', title: 'Relationships and loss' },
  { id: 'conditions', title: 'Named conditions' },
] as const;

type Group = (typeof concernGroups)[number]['id'];
type ResourceKind = 'Volume' | 'Worksheet' | 'Guided lesson' | 'Evidence note' | 'Source guide';
type Resource = { kind: ResourceKind; title: string; href: string };
export type Concern = { id: string; group: Group; title: string; aliases: string; description: string; resources: [Resource, ...Resource[]] };

function volume(id: string, anchor: string, title: string): Resource {
  return { kind: 'Volume', title, href: '/library/videos/' + id + '/#' + anchor };
}
function worksheet(discipline: string, id: string, title: string): Resource {
  return { kind: 'Worksheet', title, href: '/learn/curriculum/' + discipline + '/#practice-' + id };
}
function note(id: (typeof sourceNoteRoutes)[number]['id'], title: string): Resource {
  return { kind: 'Evidence note', title, href: sourceNoteHref(id) };
}
function claim(slug: string, title: string): Resource {
  return { kind: 'Evidence note', title, href: '/evidence/claims/' + slug + '/' };
}

export const concerns: Concern[] = [
  {
    id: 'worry', group: 'feelings', title: 'I keep expecting something to go wrong',
    aliases: 'worry worries worried anxious anxiety nervous apprehension overthinking worst case catastrophizing',
    description: 'Use an ordinary conversation to put a prediction into words and compare it with what actually happens.',
    resources: [volume('TOTW_bsKkbE', 'example', 'A worry before sending an email'), volume('TOTW_bsKkbE', 'takeaway-1', 'Separate the two questions')],
  },
  {
    id: 'criticism', group: 'feelings', title: 'I keep replaying criticism',
    aliases: 'rejection ruminating rumination replaying feedback taking things personally self doubt sensitive criticism',
    description: 'Follow a worked example about asking for specific feedback, then try choosing a response when new facts arrive.',
    resources: [volume('EB5E24TSBuk', 'example', 'When routine feedback feels like rejection'),
      { kind: 'Guided lesson', title: 'Choose a response that fits the facts', href: '/learn/paths/perspective-fit/#worked-example' }],
  },
  {
    id: 'naming-feelings', group: 'feelings', title: 'I struggle to name what I’m feeling',
    aliases: 'feelings emotions upset irritable sad frustrated anger angry mixed emotions',
    description: 'Try a more specific word for an emotion and check what the situation calls for.',
    resources: [worksheet('awareness', 'emotion-specificity', 'Name the feeling and check what you need')],
  },
  {
    id: 'overwhelmed', group: 'feelings', title: 'I feel overwhelmed by commitments',
    aliases: 'overwhelm overloaded workload stress burnout burned out too much on my plate exhausted pressure',
    description: 'List the demands on your time and decide which commitment fits your present capacity.',
    resources: [worksheet('stewardship', 'capacity-aware-commitments', 'Choose what fits and what can wait'),
      claim('worktime-stress-boundaries', 'Working hours and perceived stress')],
  },
  {
    id: 'procrastination', group: 'habits', title: 'I keep putting things off',
    aliases: 'procrastination procrastinating procrastinate delaying getting started stuck motivation follow through sticking to routines task avoidance',
    description: 'Turn a delayed task into one observable behavior. The companion worksheet helps you examine what keeps the old habit going.',
    resources: [volume('CorAKleaql4', 'takeaway-1', 'Name one concrete behavior'),
      worksheet('self-command', 'habit-payoff', 'Check the habit payoff')],
  },
  {
    id: 'focus', group: 'habits', title: 'I can’t focus',
    aliases: 'cannot concentrate concentrating concentration distracted distraction inattentive focus mind wanders trouble paying attention losing focus',
    description: 'Choose a detail in the task, notice when attention moves, and practice returning to it.',
    resources: [worksheet('awareness', 'attention-return', 'Notice drift. Choose your return.')],
  },
  {
    id: 'phone-checking', group: 'habits', title: 'I keep reaching for my phone',
    aliases: 'screen time digital distraction scrolling checking notifications phone habit doomscrolling social media',
    description: 'Start with a writing example that changes where the phone sits, then set a purpose for using a digital tool.',
    resources: [volume('CorAKleaql4', 'example', 'Change the cue at your desk'),
      worksheet('stewardship', 'digital-use-agreement', 'Give a digital tool a clear job')],
  },
  {
    id: 'loneliness', group: 'relationships', title: 'I feel disconnected',
    aliases: 'lonely loneliness isolation isolated alone disconnected friendship left out belonging making friends connection',
    description: 'Work through an example of inviting someone to connect. The practice pairs that invitation with a small commitment of your own.',
    resources: [volume('nqWsMb06W0I', 'practice', 'Practice reaching out'),
      claim('loneliness-isolation', 'Loneliness and being alone')],
  },
  {
    id: 'conflict', group: 'relationships', title: 'Our disagreements get personal',
    aliases: 'conflict arguing argument defensive relationship problems partner misunderstanding communication listening',
    description: 'Practice reflecting back what you heard and inviting the other person to correct your understanding.',
    resources: [worksheet('integration', 'listening-check', 'Listen, reflect, and invite correction')],
  },
  {
    id: 'boundaries', group: 'relationships', title: 'I say yes when I need to say no',
    aliases: 'people pleasing saying no setting boundaries assertive assertiveness overcommitting',
    description: 'Check what you can realistically agree to and make the limit explicit.',
    resources: [worksheet('stewardship', 'capacity-aware-commitments', 'Size a commitment to your capacity'),
      claim('assertiveness-training-boundaries', 'What assertiveness studies measured')],
  },
  {
    id: 'grief', group: 'relationships', title: 'I’m grieving a loss',
    aliases: 'grief grieving loss bereaved bereavement mourning sadness stages of grief',
    description: 'Read what studies of bereavement can tell us about group patterns and how much individual experiences vary.',
    resources: [claim('grief-pattern-sequence-boundaries', 'Grief patterns and individual experiences')],
  },
  {
    id: 'adhd', group: 'conditions', title: 'ADHD',
    aliases: 'attention deficit hyperactivity disorder attention deficit disorder ADHD ADD',
    description: 'Read how persistence, context, and changes over time figure in the published discussion of ADHD.',
    resources: [note('adhd-diagnostic-context', 'Persistence and diagnostic context')],
  },
  {
    id: 'depression', group: 'conditions', title: 'Depression',
    aliases: 'depressed major depressive disorder MDD clinical depression behavioral activation',
    description: 'Explore which treatments, populations, and outcomes the behavioral activation studies compared.',
    resources: [note('behavioral-activation-comparisons', 'Behavioral activation comparisons'),
      note('sleep-and-depression-outcomes', 'Sleep and depression outcomes')],
  },
  {
    id: 'insomnia', group: 'conditions', title: 'Insomnia',
    aliases: 'insomnia sleeplessness cannot sleep trouble sleeping difficulty falling asleep sleep problems',
    description: 'Examine the populations and outcome measures in studies covering insomnia and depression.',
    resources: [note('sleep-and-depression-outcomes', 'Understanding the sleep study outcomes')],
  },
  {
    id: 'panic', group: 'conditions', title: 'Panic attacks and panic disorder',
    aliases: 'panic attacks panic disorder panicking panicked panic symptoms',
    description: 'Read why identifying the cause of an unexplained episode requires more than a change in symptoms during a walk.',
    resources: [note('panic-and-medical-exclusion', 'Panic symptoms and medical assessment')],
  },
  {
    id: 'childhood-anxiety', group: 'conditions', title: 'Childhood anxiety disorders',
    aliases: 'child children kids childhood pediatric anxiety anxious child family parent parenting SPACE CBT',
    description: 'Look at the children, families, and outcomes included in a comparison of parent-based SPACE and child CBT.',
    resources: [note('space-and-child-cbt', 'Parent-based SPACE and child CBT')],
  },
  {
    id: 'ocd', group: 'conditions', title: 'Obsessive-compulsive disorder (OCD)',
    aliases: 'obsessive compulsive disorder OCD obsessions compulsions',
    description: 'Open the source record for the National Institute of Mental Health guide to OCD, including its discussion of treatment.',
    resources: [{ kind: 'Source guide', title: 'NIMH guide to obsessive-compulsive disorder', href: '/evidence/sources/#source-R07' }],
  },
  {
    id: 'ptsd', group: 'conditions', title: 'Post-traumatic stress disorder (PTSD)',
    aliases: 'post traumatic stress disorder posttraumatic stress disorder PTSD trauma',
    description: 'Open the National Center for PTSD source record for its overview of research on specific psychotherapies.',
    resources: [{ kind: 'Source guide', title: 'VA overview of psychotherapy for PTSD', href: '/evidence/sources/#source-R05' }],
  },
];

const filler = new Set(['i', 'im', 'my', 'me', 'we', 'a', 'an', 'the', 'to', 'of', 'for', 'with', 'is', 'am', 'and', 'do', 'has', 'have', 'can', 'cant', 'cannot', 'feel', 'keep']);
const directory = concerns.map(concern => {
  const group = concernGroups.find(item => item.id === concern.group)!;
  const names = searchWords(concern.title + ' ' + concern.aliases).map(singular);
  const context = [group.title, concern.description, ...concern.resources.map(item => item.title)].join(' ');
  return { concern, names: new Set(names), words: new Set(names.concat(searchWords(context).map(singular))) };
});

export function findConcerns(query: string): Concern[] {
  if (!query.trim()) return concerns;
  const terms = searchWords(query).filter(term => !filler.has(term)).map(singular);
  if (!terms.length) return [];
  return directory.filter(item => terms.every(term => item.words.has(term)))
    .map(item => ({ concern: item.concern, nameHits: terms.filter(term => item.names.has(term)).length }))
    .sort((a, b) => b.nameHits - a.nameHits)
    .map(item => item.concern);
}
