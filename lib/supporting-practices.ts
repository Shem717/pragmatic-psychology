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
  {
    id: "retrieve-check-revisit",
    discipline: "competence",
    title: "Retrieve. Check. Revisit.",
    summary: "Try a small learning question without looking, compare your answer with a relevant source, and revisit it later before testing an ordinary application.",
    attribution: "Source idea: Ali Abdaal describes trying to recall information rather than only consuming it, and returning to practice on separated occasions. This worksheet’s source check, correction, flexible revisit and application prompts are Sovereign Psychology editorial adaptations, not a validated learning protocol or a guarantee of competence.",
    sources: [
      { label: "Ali Abdaal · recall and separated practice · 49:28", url: "https://www.youtube.com/watch?v=Ck2yqXMofoc&t=2968" },
    ],
    safety: "Choose ordinary, low-stakes learning. Text, speech or another accessible format is welcome; note any aids you use without treating them as failure. There is no required spacing schedule or score. Matching a source checks recall, not whether the source’s claim is true; its evidence and limits still matter. Recall is not the same as understanding, safe application or demonstrated competence; do not use a memory exercise to qualify yourself for a safety-critical task.",
    example: "After reading the instructions for an ordinary spreadsheet task, ask how to sort a table without separating related cells. Explain it without looking, then compare with the instructions and correct a missed step. At a realistic later opportunity, try recalling it again. Test application on a disposable practice table, not a live record, and describe what actually happened.",
    fields: [
      { key: "question", label: "One small learning question", hint: "Choose a specific question and an accessible way to answer. What source will be appropriate for checking it?", placeholder: "How do I sort a practice table while keeping each row together? I can explain it aloud." },
      { key: "attempt", label: "My attempt before looking", hint: "Try recalling the answer before reopening the source. Capture what you can, including uncertainty or aids used; leave gaps visible.", placeholder: "I remember selecting the table and choosing a sort column. I am unsure about the header row." },
      { key: "source", label: "The source I checked", hint: "Now consult the relevant instructions or reference. Record its title or location and the part that answers the question.", placeholder: "The tool’s sorting instructions, including its header-row setting." },
      { key: "correction", label: "Specific gap and correction", hint: "Compare your attempt with the source. What was missing, wrong or still unclear? Explain the correction in your own words.", placeholder: "I missed checking that the tool recognises the header; I need to inspect that setting before sorting." },
      { key: "revisit", label: "A realistic later revisit", hint: "Choose an opportunity that fits your capacity. No fixed interval is required; plan to attempt recall before looking again.", placeholder: "When I next practise with a sample table, explain the steps before opening the instructions." },
      { key: "laterAttempt", label: "My later attempt", hint: "At that later opportunity, record what you recalled before checking. ‘Not revisited yet’ is more accurate than an imagined result.", placeholder: "Not revisited yet." },
      { key: "laterCheck", label: "What the later check showed", hint: "Compare the later attempt with the source. Record retained details, remaining gaps and any revision without turning them into a score.", placeholder: "I will check whether I remembered the header setting and whether another step still needs attention." },
      { key: "application", label: "Application in a different ordinary example", hint: "Try a safe practice example with a relevant difference. What did you actually do, what happened and what remains untested? Recall alone does not establish competence.", placeholder: "Use a disposable table with different column names; check whether whole rows stayed together. Not tried yet." },
    ],
  },
  {
    id: "capacity-aware-commitments",
    discipline: "stewardship",
    title: "Choose what fits. Name what must wait.",
    summary: "Start with real capacity and obligations, choose a feasible current commitment, and make the trade-off and deferred work explicit.",
    attribution: "Source idea: Oliver Burkeman discusses worthwhile commitments exceeding available time and allowing some projects to wait. This capacity, trade-off, communication and deferred-work worksheet is a Sovereign Psychology editorial adaptation, not his exact method or a rule that everyone can choose their workload freely.",
    sources: [
      { label: "Oliver Burkeman · worthwhile commitments and finite time · 34:40", url: "https://www.youtube.com/watch?v=ALV6ItXdUYI&t=2080" },
    ],
    safety: "Protect necessary care, work, recovery and access needs. This is not a rigid one-project limit or a measure of your worth. Do not abandon obligations or make unilateral changes that require agreement. Structural overload may need support or renegotiation; ‘there is no feasible choice under current conditions’ is a valid conclusion.",
    example: "You want to improve a community resource page and begin a separate newsletter, but your current work and care commitments leave capacity for only a small discretionary task. Choose a bounded page update, defer the newsletter idea, and tell anyone affected what is and is not promised. If an urgent obligation displaces the update, renegotiate rather than calling the plan a personal failure.",
    fields: [
      { key: "obligations", label: "Obligations and needs to protect", hint: "What care, work, recovery, access or other necessary commitments must be considered first?", placeholder: "Existing shifts, care arrangements and time to recover; the promised resource-page correction is due for discussion." },
      { key: "capacity", label: "Realistic available capacity", hint: "What time, energy, resources and uncertainty remain? A rough description or ‘none currently’ is enough.", placeholder: "A small task may fit, but a new recurring project does not. A shift change could reduce that capacity." },
      { key: "chosen", label: "One current commitment to examine", hint: "Choose a feasible discretionary commitment or a bounded part of one. This worksheet does not require limiting your whole life to one project.", placeholder: "Propose a small correction to the resource page rather than redesigning it." },
      { key: "deferred", label: "Worthwhile work explicitly deferred", hint: "What will wait, be declined or require negotiation? A ‘not now’ item can still matter; it is not a judgment of its worth.", placeholder: "The newsletter remains a worthwhile idea, but I am not committing to launch it now." },
      { key: "tradeoff", label: "What saying yes would displace", hint: "Name the actual trade-off. If the choice would displace something essential, revise the commitment or seek a different arrangement.", placeholder: "Launching the newsletter now would take the time reserved for the page correction or recovery." },
      { key: "communication", label: "Communication or agreement needed", hint: "Who is affected, what can you decide yourself, and what must be discussed before a promise or deadline changes?", placeholder: "Tell the coordinator the proposed scope and ask whether the correction can wait if my shift changes." },
      { key: "support", label: "Support, renegotiation or unavailable choice", hint: "What condition would make this feasible? Record a need for help or an unresolved constraint instead of forcing a commitment.", placeholder: "If the task becomes larger, ask for help or a revised deadline; I cannot absorb extra work automatically." },
      { key: "return", label: "When to reconsider the deferred work", hint: "Choose a realistic review condition, not an automatic promise. Later record what changed, whether capacity exists and what still needs agreement.", placeholder: "Reconsider the newsletter after the page decision and next rota are clear. No launch date is promised." },
    ],
  },
  {
    id: "story-versus-evidence",
    discipline: "discernment",
    title: "A compelling story is a starting point.",
    summary: "Separate a story’s claim from its vivid details, identify what the anecdote can establish, and look for the missing comparison before choosing a proportionate action.",
    attribution: "Source idea: Tali Sharot distinguishes using data to decide what is true from using stories to communicate. This claim, comparison and action audit is a Sovereign Psychology editorial adaptation, not a validated persuasion test or a technique for overriding another person’s judgment.",
    sources: [
      { label: "Tali Sharot · anecdotes, communication and evidence · 30:25", url: "https://www.youtube.com/watch?v=0DZK1nawEXQ&t=1825" },
    ],
    safety: "Choose a low-stakes everyday claim, not a medical, legal, financial or immediate-safety decision. A moving account can matter without establishing how common an outcome is or what caused it. Do not dismiss lived experience, pressure a storyteller to disclose more, or invent missing statistics. Uncertainty and postponing action are legitimate outcomes.",
    example: "A fictional colleague says a productivity app transformed their work. The story reports one person’s experience; it does not show whether the app caused the change or how other users fared. A quieter workload or another changed routine might matter. Seek relevant comparisons and practical limitations before making a low-cost, reversible choice—or decide that no change is needed.",
    fields: [
      { key: "claim", label: "The checkable claim", hint: "State the proposition separately from the story. Is it about one person, a typical outcome, or a causal effect?", placeholder: "The app usually helps people complete more work—not merely that one colleague liked it." },
      { key: "story", label: "What makes the story compelling", hint: "Name vivid details or your response without treating them as evidence of frequency or causation.", placeholder: "The colleague’s before-and-after account is memorable, and I would like a similar change." },
      { key: "establishes", label: "What the anecdote actually establishes", hint: "What was directly observed, what is only reported, and how narrow is the claim it can support?", placeholder: "One colleague reports an improvement after adopting the app; I do not know how the change was measured." },
      { key: "comparison", label: "Missing denominator or comparison", hint: "How many people were considered, what usually happens without the tool, and what outcomes were omitted? Record unknowns rather than inventing a base rate.", placeholder: "I do not know how many users saw no benefit, stopped using it, or improved without it." },
      { key: "alternatives", label: "Other plausible explanations", hint: "What else changed, or which selection or reporting effects could account for the story? These are possibilities, not accusations.", placeholder: "The colleague’s workload may have changed, or they may have adopted another useful routine." },
      { key: "evidence", label: "Stronger evidence to seek or inspect", hint: "Identify a relevant comparison, independent source or transparent observation. Note its scope and limits; more stories alone may not settle the claim.", placeholder: "Look for comparisons that describe the task, participants, outcomes and limitations, plus the tool’s actual features." },
      { key: "uncertainty", label: "What remains uncertain", hint: "What conclusion is justified now, and what would be too strong? You do not need to resolve the claim before recording uncertainty.", placeholder: "The tool may suit that colleague, but its typical effect and fit for my task remain unknown." },
      { key: "action", label: "Proportionate action and revision condition", hint: "Choose a low-risk, reversible step or no change. What specific evidence or observed result would justify revising it?", placeholder: "Inspect a sample workflow without moving private data or making a purchase; reconsider only if it meets an actual need with acceptable limits." },
    ],
  },
];
