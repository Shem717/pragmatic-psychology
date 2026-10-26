/** Attributed supporting exercises, separate from the seven selected video companions. */
export type SupportingPractice = {
  id: string;
  discipline: string;
  title: string;
  summary: string;
  attribution: string;
  sources: { label: string; url: string }[];
  safety: string;
  example: string;
  fields: { key: string; label: string; hint: string; placeholder?: string }[];
};

export const supportingPractices: SupportingPractice[] = [
  {
    id: "attention-return",
    discipline: "awareness",
    title: "Notice drift. Choose your return.",
    summary: "Choose an accessible point of attention, notice when attention moves elsewhere, and return without treating drift as failure.",
    attribution: "Source idea: Amishi Jha describes choosing an attention target, noticing where attention actually is, and redirecting it. This worksheet’s ordinary task or sound anchors, stop-or-modify choices and activity review are Sovereign Psychology editorial adaptations, not a validated intervention.",
    sources: [
      { label: "Amishi Jha · choose, notice, redirect · 1:02:20", url: "https://www.youtube.com/watch?v=QPk6c8MRyoc&t=3740" },
    ],
    safety: "Choose a low-risk setting, not driving or another safety-critical task. An external object, sound or task detail is enough; inward bodily attention is not required. Do not hold or manipulate your breath. Stop or change the exercise if it is uncomfortable. There is no required duration or drift score. This practice is separate from the website’s Focused display mode.",
    example: "While reading an ordinary work note, choose the current sentence as an anchor. Notice that attention has moved to a later meeting, acknowledge that without grading it, and return to the sentence. Afterwards, record whether you re-engaged, needed a break, or needed clearer instructions. An unhelpful or unclear result is valid.",
    fields: [
      { key: "activity", label: "The ordinary activity", hint: "What do you want to engage with? Choose something manageable and safe.", placeholder: "Read a short project note." },
      { key: "anchor", label: "An accessible anchor", hint: "Choose a task detail, external object or sound that suits you. You do not need to use breathing or bodily sensations.", placeholder: "The sentence I am currently reading." },
      { key: "drift", label: "What I noticed", hint: "Where was attention when you checked? Drift, mixed attention or not noticing are observations, not failures.", placeholder: "I was planning the next meeting rather than reading." },
      { key: "return", label: "My return or adjustment", hint: "Gently return to the chosen anchor, choose a more suitable one, pause, or stop. Record what you actually did.", placeholder: "I acknowledged the thought and reread the sentence." },
      { key: "result", label: "What happened next", hint: "Did you re-engage with the activity? Record an ordinary observation; unclear or unhelpful is allowed.", placeholder: "I could describe the next step in the note; I still wanted a break." },
      { key: "review", label: "What to keep or change", hint: "Would different instructions, surroundings, support or a break serve you better next time? No fixed practice dose is required.", placeholder: "Use a quieter place, or ask what the note is asking me to do." },
    ],
  },
  {
    id: "habit-payoff",
    discipline: "self-command",
    title: "Check the payoff before replacing the habit.",
    summary: "Compare what an ordinary behavior promises with what it actually delivers now and later. Then choose a feasible alternative that serves the legitimate need.",
    attribution: "Source idea: Judson Brewer describes mapping a cue, behavior and reward, examining current consequences, and comparing an alternative. This expected-versus-observed worksheet and its low-risk boundaries are Sovereign Psychology editorial adaptations. Attribution is not evidence that this worksheet reliably changes habits.",
    sources: [
      { label: "Judson Brewer · map cue, behavior and reward · 20:09", url: "https://www.youtube.com/watch?v=014p6d51HZc&t=1209" },
      { label: "Judson Brewer · notice actual consequences · 24:04", url: "https://www.youtube.com/watch?v=014p6d51HZc&t=1444" },
      { label: "Judson Brewer · compare an alternative · 31:17", url: "https://www.youtube.com/watch?v=014p6d51HZc&t=1877" },
    ],
    safety: "Use an ordinary, low-risk behavior already observed—not substance use, eating restriction, compulsions or trauma. Do not increase a risky behavior to test its payoff. Preserve safety updates and necessary preparation. Genuine benefits and inconclusive results count; the aim is not to make an activity feel bad or blame yourself for missing resources.",
    example: "Reopening a non-urgent project inbox promises certainty. On the next ordinary check, notice whether it brings useful information or simply repeats the search. Later, note whether work advanced. If the need is clarification, a specific question may help more than either repeated checking or forcing yourself not to check. Keep essential updates available.",
    fields: [
      { key: "cue", label: "Cue and ordinary behavior", hint: "What happened just before it, and what did you do? Use an existing observation rather than provoking the behavior.", placeholder: "Unclear task instructions; I reopened the project inbox." },
      { key: "expected", label: "Expected payoff", hint: "What benefit did you anticipate? Describe the expectation without judging it.", placeholder: "I expected a clearer answer and less uncertainty." },
      { key: "immediate", label: "Observed immediate result", hint: "What actually happened just afterwards? Include any real benefit, cost or uncertainty.", placeholder: "There was no new message; I briefly felt that I had checked." },
      { key: "later", label: "Observed later result", hint: "When you can reasonably look back, what followed? Leave this open until observed; do not invent a result.", placeholder: "The instructions were still unclear and the task had not moved forward." },
      { key: "need", label: "Need or constraint worth addressing", hint: "What legitimate need remains? Missing information, workload, access or skill may require changing conditions.", placeholder: "I need one decision clarified, not another inbox refresh." },
      { key: "alternative", label: "A feasible replacement or condition change", hint: "Choose a small alternative serving that need. Check that it is safe, ethical and within your authority.", placeholder: "Send one clear question and work on the part that is already defined." },
      { key: "support", label: "Cue and environmental support for the next attempt", hint: "Keep the existing small-replacement approach: name when you will try it and what makes it practical. Preserve important exceptions.", placeholder: "When I reach the unclear step, use my question template; keep urgent updates on." },
      { key: "review", label: "What the alternative actually delivered", hint: "After an ordinary attempt, compare its immediate and later results with your expectation. Record what to retain or revise.", placeholder: "Not tried yet. I will check whether the question produced a usable answer." },
    ],
  },
  {
    id: "emotion-specificity",
    discipline: "awareness",
    title: "Name more precisely. Check what is needed.",
    summary: "Move from a broad feeling label to two possible descriptions, then check a possible need or constraint before choosing an action or asking for support.",
    attribution: "Source idea: Susan David suggests alternatives to broad feeling labels and discusses how more specific descriptions can inform a support question. The sequence below is a Sovereign Psychology editorial adaptation, not an emotion assessment. A label does not establish a cause or reveal another person’s feelings.",
    sources: [
      { label: "Susan David · two alternatives to a broad label · 1:17:34", url: "https://www.youtube.com/watch?v=2rM_JwQ1O6w&t=4654" },
      { label: "Susan David · specificity and support · 23:28", url: "https://www.youtube.com/watch?v=y8bwEgCcOXs&t=1408" },
    ],
    safety: "Use your own experience in an ordinary situation. Mixed, unclear or hard-to-name feelings are valid; you do not have to produce two perfect words. Treat needs and explanations as possibilities to check. Ask others rather than assigning feelings to them. A boundary, changed conditions, support, pause or no immediate action may be appropriate.",
    example: "After a busy shift, ‘stressed’ might become ‘exhausted’ and ‘disappointed.’ ‘Nobody supports me’ is a separate interpretation, not an emotion established by those labels. Check the workload and handover arrangements, then ask for one feasible adjustment rather than requiring a more positive story.",
    fields: [
      { key: "event", label: "Event and broad label", hint: "Describe what happened and your initial shorthand. Keep the event separate from an explanation of why it happened.", placeholder: "The handover was rushed. My first label is ‘stressed.’" },
      { key: "alternativeOne", label: "First more specific possibility", hint: "What description might fit your own experience? ‘Unclear’ or ‘mixed’ is acceptable.", placeholder: "Exhausted." },
      { key: "alternativeTwo", label: "Second possible description", hint: "Try another possibility without insisting that it must be the hidden truth.", placeholder: "Disappointed." },
      { key: "interpretation", label: "The explanation I am adding", hint: "Separate a felt experience from a claim about motives, causes or other people. What remains unknown?", placeholder: "I am telling myself nobody supports me; I have not checked what happened at handover." },
      { key: "need", label: "Possible need or constraint", hint: "What support, resource, valued concern or practical condition might matter? Treat this as a hypothesis.", placeholder: "I may need clearer handover information and a realistic workload." },
      { key: "check", label: "A proportionate check", hint: "What can you observe or ask to test that possibility, without demanding agreement or disclosure?", placeholder: "Ask which tasks were assigned and whether handover time can be protected." },
      { key: "action", label: "A feasible action, support request or pause", hint: "Choose a step that respects your capacity and others’ boundaries. You need not feel differently before choosing it.", placeholder: "Request a short written handover; pause the non-urgent task until priorities are clear." },
      { key: "review", label: "What happened and what changed", hint: "Record the actual response, what remains uncertain and whether a different next step is needed.", placeholder: "Not yet checked. I will record the answer rather than assume the request was understood." },
    ],
  },
  {
    id: "listening-check",
    discipline: "integration",
    title: "Listen. Reflect. Invite correction.",
    summary: "Agree on a manageable conversation, listen before solving, reflect what you heard, and let the other person correct your understanding.",
    attribution: "Source ideas: Kelly McGonigal describes listening to understand and reflecting what was heard; Daniel Goleman suggests testing hunches about another person’s feelings by asking. Conversation agreement, correction prompts and preferred-help checks below are Sovereign Psychology editorial adaptations, not a validated relationship protocol.",
    sources: [
      { label: "Kelly McGonigal · listening before solving · 31:53", url: "https://www.youtube.com/watch?v=qtc1iWm_KCI&t=1913" },
      { label: "Kelly McGonigal · reflecting what was heard · 33:53", url: "https://www.youtube.com/watch?v=qtc1iWm_KCI&t=2033" },
      { label: "Daniel Goleman · check a hunch with the person · 1:21:36", url: "https://www.youtube.com/watch?v=kQnEvSU1Buc&t=4896" },
    ],
    safety: "Choose a mutually welcome topic and format. Eye contact, bodily awareness and personal disclosure are not required. Do not pressure someone to talk or reconnect with an unsafe person. Understanding does not require agreement or abandoning a boundary. Keep notes minimal and avoid identifying or sensitive details about others.",
    example: "A colleague agrees to discuss a confusing handover. Ask whether they want to be heard, clarify the process or plan a change. After their turn, reflect: ‘I heard that the late changes made planning difficult. What have I missed?’ They may correct you: the timing was manageable; the missing owner was the problem. Revise before proposing a solution.",
    fields: [
      { key: "agreement", label: "Purpose, topic and agreement", hint: "What is this conversation for, and is the person willing? Choose an accessible format and a manageable topic.", placeholder: "They are willing to discuss the handover by message; the purpose is to understand the confusion." },
      { key: "listen", label: "What I actually heard", hint: "Let them finish an agreed turn. Briefly record their meaning in language close to theirs, without diagnosing or adding motives.", placeholder: "They said the changes arrived without a named person responsible." },
      { key: "inference", label: "My inference—not their report", hint: "What did you assume? Mark it as uncertain rather than treating a facial expression or tone as proof.", placeholder: "I assumed they were annoyed about the timing; they did not say that." },
      { key: "reflection", label: "My brief reflection", hint: "Offer your understanding without immediately correcting, defending or solving.", placeholder: "I heard that the unclear responsibility made the handover difficult." },
      { key: "correction", label: "Their correction or understanding check", hint: "Ask what you missed or misunderstood. Record their actual answer; ‘not checked yet’ is more accurate than imagined agreement.", placeholder: "I asked, ‘What have I missed?’ They said the missing owner was the main issue." },
      { key: "revision", label: "My revised understanding", hint: "What changed after their answer? Keep any disagreement or remaining uncertainty visible.", placeholder: "The issue is responsibility, not necessarily timing or unwillingness to help." },
      { key: "next", label: "Preferred next step and boundaries", hint: "Ask whether listening, clarification or practical help is wanted. Agree only to what is feasible; no action may be needed.", placeholder: "They want a named owner. I can propose that change, but cannot promise another team’s agreement." },
    ],
  },
  {
    id: "digital-use-agreement",
    discipline: "stewardship",
    title: "Give a digital tool a clear job.",
    summary: "Choose a valued purpose, define the use that serves it, and set a realistic boundary with important exceptions and a review.",
    attribution: "Source idea: Cal Newport describes selecting digital tools strategically for important values rather than adopting every tool with a possible benefit. The purpose, intended-use, boundary, exception and review agreement below is a Sovereign Psychology editorial adaptation, not a prescribed detox or a promise of brain benefits.",
    sources: [
      { label: "Cal Newport · values-led digital-tool choices · 26:37", url: "https://www.youtube.com/watch?v=ROKQHRfh2mA&t=1597" },
    ],
    safety: "Preserve necessary work, accessibility, safety and connection needs. No abstinence or universal screen-time limit is required. Set boundaries only where you have authority, and discuss changes that affect others. If a tool is essential, adjust its use rather than assuming removal is possible or desirable.",
    example: "A community messaging app supports a valued volunteer role. The intended use is checking rota changes and answering direct questions. Choose a workable check-in point and leave unrelated browsing for another time. Keep urgent rota alerts and accessibility functions available. Review whether coordination still worked before tightening or relaxing the agreement.",
    fields: [
      { key: "purpose", label: "The value or purpose served", hint: "What matters here—connection, coordination, learning, accessible communication or another purpose? A legitimate benefit is worth preserving.", placeholder: "Keep my volunteer commitment without missing important rota changes." },
      { key: "tool", label: "Tool and intended use", hint: "Name the tool and the specific action that serves that purpose, rather than labeling the whole tool good or bad.", placeholder: "Use the community app for rota updates and direct coordination." },
      { key: "boundary", label: "A workable boundary", hint: "Choose a context, stopping point, notification setting or other limit that fits your actual responsibilities.", placeholder: "After responding to the rota message, close unrelated threads and return to the current task." },
      { key: "exceptions", label: "Important exceptions", hint: "What must remain available for safety, work, access or meaningful connection? Do not block essential communication to meet the rule.", placeholder: "Urgent rota changes, direct requests and accessibility functions remain available." },
      { key: "support", label: "Practical support and agreement", hint: "What setting, cue or conversation makes this feasible? Check authority and coordinate with anyone affected.", placeholder: "Keep urgent alerts on; ask the coordinator which channel carries time-sensitive changes." },
      { key: "reviewPoint", label: "When and what I will review", hint: "Choose a realistic review point, not a mandatory schedule. What observable result would show whether the agreement served its purpose?", placeholder: "After the next rota cycle, check whether I received and answered the important messages." },
      { key: "review", label: "Observed result and revision", hint: "What actually happened? Keep the agreement, loosen it, change the tool or revise the boundary as needed. Screen time alone is not a score of worth.", placeholder: "Not reviewed yet. If coordination suffered, I will change the boundary rather than call it a failure." },
    ],
  },
];
