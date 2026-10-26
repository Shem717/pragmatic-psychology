/** One historical recording, six source-specific associations; never six confirmations. */
export const sharedSourceBackground = {
  "id": "shared-gut-brain-background",
  "title": "Gut–brain research: one shared background conversation",
  "speaker": "Emeran Mayer with Tom Bilyeu",
  "passages": [
    {
      "timestamp": "13:05–14:04",
      "url": "https://www.youtube.com/watch?v=filqDSbSOAA&t=785",
      "topic": "Why a treatment result in one condition cannot simply transfer to another"
    },
    {
      "timestamp": "22:23–23:13",
      "url": "https://www.youtube.com/watch?v=filqDSbSOAA&t=1343",
      "topic": "A proposed brain–gut feedback loop, explicitly presented as a hypothesis"
    }
  ],
  "relationship": "Related context",
  "limitation": "This 2018 interview is historical background, not an explanation or independent confirmation of the later papers or current FDA guidance. Do not infer psychiatric approval, transfer of beliefs, or a reason to attempt FMT.",
  "connections": [
    {
      "source_id": "R25",
      "source_title": "Li et al. — Adjunctive fecal microbiota transplantation for major depressive disorder",
      "source_url": "https://pubmed.ncbi.nlm.nih.gov/42309058/",
      "context": "The 2018 interview predates this 2026 adjunctive trial. Use the primary paper—not the interview—for remission, symptom scores and comparator findings."
    },
    {
      "source_id": "R26",
      "source_title": "Li et al. — Efficacy and safety of fecal microbiota transplantation on depressive and anxiety symptoms",
      "source_url": "https://pubmed.ncbi.nlm.nih.gov/41921871/",
      "context": "The 2018 interview predates this 2026 mixed-design review. It does not explain pooled effects, study quality or heterogeneity."
    },
    {
      "source_id": "R27",
      "source_title": "Fu et al. — Efficacy effects of fecal microbiota transplantation on depressive symptoms",
      "source_url": "https://pubmed.ncbi.nlm.nih.gov/41694125/",
      "context": "The 2018 interview does not resolve the review’s null result or internally inconsistent numerical summaries. Keep the null finding and unresolved discrepancy visible."
    },
    {
      "source_id": "R28",
      "source_title": "Zhang et al. — Clinical efficacy of fecal microbiota transplantation in alleviating depressive symptoms",
      "source_url": "https://pubmed.ncbi.nlm.nih.gov/41122746/",
      "context": "The 2018 interview predates this 2025 review. It does not establish its findings or resolve overlap with the other reviews."
    },
    {
      "source_id": "R29",
      "source_title": "Nannan Li et al. — stressed-donor microbiota transfer in mice",
      "source_url": "https://pubmed.ncbi.nlm.nih.gov/31124390/",
      "context": "The interview predates this 2019 stressed-donor mouse study. A proposed feedback loop is not demonstration of this experiment or human efficacy."
    },
    {
      "source_id": "R30",
      "source_title": "FDA — Fecal Microbiota Products",
      "source_url": "https://www.fda.gov/vaccines-blood-biologics/fecal-microbiota-products",
      "context": "Historical discussion of differing treatment contexts, not current FDA approval or safety guidance. The current FDA source remains authoritative for product information."
    }
  ]
} as const;
