export const sourceNoteRoutes = [
  {
    "id": "caffeine-and-adenosine",
    "label": "Caffeine and adenosine"
  },
  {
    "id": "age-groups-and-aging",
    "label": "Age groups and aging"
  },
  {
    "id": "sensory-kit-evidence",
    "label": "Sensory kit evidence"
  },
  {
    "id": "relationship-ratios",
    "label": "Relationship ratios"
  },
  {
    "id": "bereavement-cardiac-statistic",
    "label": "Bereavement cardiac statistic"
  },
  {
    "id": "alcohol-and-sleep",
    "label": "Alcohol and sleep"
  },
  {
    "id": "relaxation-related-anxiety",
    "label": "Relaxation-related anxiety"
  },
  {
    "id": "postpartum-screening-estimates",
    "label": "Postpartum screening estimates"
  },
  {
    "id": "mindfulness-comparators",
    "label": "Mindfulness comparators"
  },
  {
    "id": "choline-mrs-measurement",
    "label": "Choline MRS measurement"
  },
  {
    "id": "breathing-hrv-measures",
    "label": "Breathing and HRV measures"
  },
  {
    "id": "mindfulness-mri",
    "label": "Mindfulness structural MRI"
  },
  {
    "id": "writing-and-sleep-onset",
    "label": "Writing and sleep onset"
  },
  {
    "id": "trauma-and-inheritance",
    "label": "Trauma and inheritance"
  },
  {
    "id": "nonresistance-and-immobility",
    "label": "Nonresistance and immobility"
  },
  {
    "id": "panic-and-medical-exclusion",
    "label": "Panic and medical exclusion"
  },
  {
    "id": "sleep-and-depression-outcomes",
    "label": "Sleep and depression outcomes"
  },
  {
    "id": "behavioral-activation-comparisons",
    "label": "Behavioral activation comparisons"
  },
  {
    "id": "adhd-diagnostic-context",
    "label": "ADHD: persistence and context"
  },
  {
    "id": "light-treatment-study",
    "label": "Light treatment: one selected trial"
  },
  {
    "id": "resilience-training-measures",
    "label": "Resilience training: what changed?"
  },
  {
    "id": "movement-integrated-learning",
    "label": "Movement and classroom learning"
  },
  {
    "id": "prt-package-and-video",
    "label": "PRT package versus a video exercise"
  },
  {
    "id": "space-and-child-cbt",
    "label": "SPACE and child CBT"
  },
{
  "id": "plant-diversity-category-not-threshold",
  "label": "A study category is not a proven dietary threshold"
},
{
  "id": "ace-obesity-odds-not-risk",
  "label": "Higher odds are not the same as higher probability"
},
{
  "id": "intrusive-thought-statistic-sample-window",
  "label": "A prevalence figure needs its sample and time window"
}
] as const;

export function sourceNoteHref(id: string) {
  return `/evidence/source-qualifications/${id}/`;
}

export function findSourceNoteRoute(id: string) {
  return sourceNoteRoutes.find(note => note.id === id);
}
