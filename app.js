const STORAGE_KEY = "questdex-profile";
const SESSION_CAPTURE_STORAGE_KEY = "questdex-session-capture";
const SOUL_CAPSULE_VERSION = 1;
const ENCRYPTED_SOUL_VERSION = 1;
const SOUL_ANCHOR_VERSION = 1;
const SESSION_CAPTURE_VERSION = 1;
const SOUL_KDF_ITERATIONS = 150000;
const NUDGE_CHECK_INTERVAL_MS = 60000;
const SESSION_CAPTURE_TEXT_LIMIT = 1200;

const priorityOptions = ["Career", "Study", "Health", "Social", "Money", "Creativity", "Startup", "Recovery"];
const buildGoalOptions = [
  "Wealth",
  "Freedom",
  "Mastery",
  "Power",
  "Love",
  "Adventure",
  "Peace",
  "Service",
  "Status",
  "Creativity",
];
const travelNeedOptions = [
  "Food",
  "Culture",
  "Nature",
  "Events",
  "Quiet",
  "Social",
  "Budget",
  "Accessibility",
  "Proof",
  "Learning",
  "Outreach",
  "Recovery",
  "Admin",
  "Creative",
];
const sideQuestModes = ["Off", "Travel", "Project", "Career", "Learning", "Wellness", "Social", "Creative"];
const lifeStageOptions = [
  "Student",
  "Early-career builder",
  "Founder",
  "Career transition",
  "Recovery and reset",
  "Explorer",
];
const defaultNudgeConfig = {
  enabled: false,
  time: "09:00",
  tone: "Warm and direct",
  channel: "browser",
  lastSentDate: "",
};
const defaultSessionCaptureSettings = {
  durationMinutes: 30,
  mode: "standard",
  storeFullUrl: false,
  enableSelectedTextCapture: true,
  enablePageSummary: false,
};

const state = {
  selectedPriorities: new Set(["Career", "Health"]),
  selectedBuildGoals: new Set(["Freedom", "Mastery"]),
  selectedTravelNeeds: new Set(["Food", "Culture", "Events"]),
  nudgeConfig: { ...defaultNudgeConfig },
  sessionCapture: {
    activeSession: null,
    lastAnalysis: null,
  },
  uploadedSeed: "",
  profile: null,
  quests: [],
  sideQuests: [],
  chat: [],
};

const statColors = {
  Energy: "#008c76",
  Focus: "#2457d6",
  Confidence: "#d95d39",
  Consistency: "#b58105",
  Creativity: "#6f4bc1",
  Social: "#0f766e",
  Strength: "#008c76",
  Intelligence: "#2457d6",
  Charisma: "#d95d39",
  Wisdom: "#6f4bc1",
  Dexterity: "#0f766e",
  Constitution: "#b58105",
  Luck: "#667085",
  Reputation: "#d95d39",
  Resources: "#008c76",
};

const questBank = {
  Career: [
    {
      title: "Proof of work sprint",
      body: "Spend 30 minutes improving one public artifact: portfolio, resume, case study, demo, or application.",
      reward: "+4 Focus, +2 Confidence",
    },
    {
      title: "One clear ask",
      body: "Message one person with a specific request for advice, feedback, or an introduction.",
      reward: "+3 Social, +3 Confidence",
    },
  ],
  Study: [
    {
      title: "Recall drill",
      body: "Pick one topic and explain it from memory in 12 lines. Check gaps only after the first attempt.",
      reward: "+4 Focus, +2 Wisdom",
    },
    {
      title: "Exam map",
      body: "List the three concepts most likely to matter, then create one practice question for each.",
      reward: "+3 Focus, +2 Consistency",
    },
  ],
  Health: [
    {
      title: "Energy floor",
      body: "Do one stabilizing action before adding pressure: water, food, walk, shower, or sleep planning.",
      reward: "+4 Energy",
    },
    {
      title: "Ten-minute movement",
      body: "Move for 10 minutes at a low enough intensity that you could repeat it tomorrow.",
      reward: "+3 Energy, +2 Consistency",
    },
  ],
  Social: [
    {
      title: "Warm reconnect",
      body: "Send one sincere check-in to someone you like but have not spoken to recently.",
      reward: "+3 Social, +2 Confidence",
    },
    {
      title: "Conversation rep",
      body: "Ask one better question today and listen long enough to learn something specific.",
      reward: "+4 Social",
    },
  ],
  Money: [
    {
      title: "Money snapshot",
      body: "Open your balances and write the one financial truth you need to stop avoiding.",
      reward: "+3 Clarity, +2 Consistency",
    },
    {
      title: "Friction audit",
      body: "Find one subscription, recurring expense, or impulse trigger that can be reduced.",
      reward: "+3 Discipline",
    },
  ],
  Creativity: [
    {
      title: "Bad first draft",
      body: "Make the smallest ugly version of an idea in 25 minutes. Judge it tomorrow.",
      reward: "+4 Creativity, +2 Confidence",
    },
    {
      title: "Reference capture",
      body: "Collect three references and write what you want to borrow from each.",
      reward: "+3 Creativity, +2 Focus",
    },
  ],
  Startup: [
    {
      title: "User signal",
      body: "Talk to one target user or write the exact question you will ask them today.",
      reward: "+4 Confidence, +3 Focus",
    },
    {
      title: "Assumption duel",
      body: "Name the riskiest assumption in your idea and design one tiny test for it.",
      reward: "+4 Strategy",
    },
  ],
  Recovery: [
    {
      title: "Minimum viable day",
      body: "Choose one task that would make today count even if everything else is paused.",
      reward: "+3 Energy, +2 Consistency",
    },
    {
      title: "Pressure release",
      body: "Write the worry in one sentence, then write the next physical action in one sentence.",
      reward: "+3 Clarity",
    },
  ],
};

const fallbackQuests = [
  {
    title: "Starter move",
    body: "Open the task, name the first action, and work for 10 minutes. You can stop after the timer.",
    reward: "+2 Focus, +2 Consistency",
  },
  {
    title: "Route check",
    body: "Write what you want, what is blocking it, and what can be done before the day ends.",
    reward: "+3 Clarity",
  },
  {
    title: "Win capture",
    body: "Record one win from the last 24 hours and the condition that made it possible.",
    reward: "+2 Confidence",
  },
];

const travelQuestTemplates = {
  Food: {
    type: "Need",
    title: "Taste map",
    body: "Find one reliable meal, one local specialty, and one backup cafe near your route so hunger does not hijack the day.",
    reward: "+3 Energy, +2 Culture",
  },
  Culture: {
    type: "Want",
    title: "Context before attraction",
    body: "Before visiting a famous place, learn one local story behind it and one behavior visitors should respect.",
    reward: "+3 Wisdom, +2 Respect",
  },
  Nature: {
    type: "Want",
    title: "Green reset",
    body: "Anchor the day with a park, waterfront, hill, garden, or quiet outdoor view within easy transit range.",
    reward: "+3 Energy, +2 Presence",
  },
  Events: {
    type: "Serendipity",
    title: "Live event radar",
    body: "Check one current listing source or paste today's events into the seed, then pick the lowest-friction event nearby.",
    reward: "+4 Serendipity",
  },
  Quiet: {
    type: "Need",
    title: "Low-noise refuge",
    body: "Identify a library, museum corner, bookstore, garden, or calm cafe where you can recover without leaving the area.",
    reward: "+3 Recovery",
  },
  Social: {
    type: "Whimsy",
    title: "Local hello",
    body: "Ask one local person a small, respectful question: what they would do with two free hours nearby.",
    reward: "+3 Social, +2 Discovery",
  },
  Budget: {
    type: "Need",
    title: "Free-first route",
    body: "Build a two-stop route using free public spaces, markets, viewpoints, or neighborhood walks before paid attractions.",
    reward: "+3 Resourcefulness",
  },
  Accessibility: {
    type: "Need",
    title: "Friction check",
    body: "Confirm walking distance, stairs, transit exits, restroom access, and backup transport before committing to the route.",
    reward: "+3 Safety, +2 Energy",
  },
};

const fallbackSideQuests = [
  {
    type: "Need",
    title: "Arrival anchor",
    body: "Pick one neighborhood base, one food option, one transit route, and one retreat point before chasing novelty.",
    reward: "+3 Safety, +2 Focus",
  },
  {
    type: "Want",
    title: "One true curiosity",
    body: "Choose a place because it matches your actual curiosity, not because it is the most recommended result.",
    reward: "+3 Joy",
  },
  {
    type: "Whimsy",
    title: "Serendipity lane",
    body: "Walk or ride one stop away from the obvious zone and follow one tasteful clue: music, crowd, smell, light, or view.",
    reward: "+4 Serendipity",
  },
];

const sideQuestModePrompts = {
  Off: {
    badge: "Off by default",
    title: "Side quest pack",
    focus: "Focus area",
    pace: "Quest pace",
    whimsy: "Novelty appetite",
    needs: "What should this side quest handle?",
    wants: "What would make it worthwhile?",
    prompt: "Prompt or live context",
    focusPlaceholder: "QuestDex launch; interview prep; writing habit",
    needsPlaceholder: "Constraints, needs, friction, resources, or non-negotiables.",
    wantsPlaceholder: "Curiosities, outcomes, people, artifacts, or wins.",
    promptPlaceholder: "Paste mode-specific clues: issue notes, links, learning gaps, recovery constraints, or social openings.",
  },
  Travel: {
    badge: "Destination-aware",
    title: "Travel quest radar",
    focus: "Destination",
    pace: "Trip mode",
    whimsy: "Whimsy appetite",
    needs: "What do you need this trip to handle?",
    wants: "What do you want or feel curious about?",
    prompt: "Daily events or local clues",
    focusPlaceholder: "Seoul, South Korea",
    needsPlaceholder: "Vegetarian food, safe late-night transit, cafes to work from, low walking days.",
    wantsPlaceholder: "Street markets, indie bookstores, waterfront walks, live jazz, architecture.",
    promptPlaceholder: "Paste today's events, festival notes, neighborhood tips, weather notes, or recommendations.",
  },
  Project: {
    badge: "Build-aware",
    title: "Project side quests",
    focus: "Project or repo",
    pace: "Sprint mode",
    whimsy: "Experiment appetite",
    needs: "What does this project need to handle?",
    wants: "What would make the project feel alive?",
    prompt: "Open issues, user clues, or demo constraints",
    focusPlaceholder: "QuestDex Coach, onboarding flow, Notion integration",
    needsPlaceholder: "Bug risk, missing proof, user confusion, demo deadline, unclear scope.",
    wantsPlaceholder: "Aha moment, sharper README, prettier dashboard, one user conversation.",
    promptPlaceholder: "Paste issues, TODOs, PR notes, feedback, or the next uncomfortable question.",
  },
  Career: {
    badge: "Option-aware",
    title: "Career side quests",
    focus: "Role, company, or transition",
    pace: "Search mode",
    whimsy: "Serendipity appetite",
    needs: "What does this career move need to handle?",
    wants: "What would make the path worthwhile?",
    prompt: "Roles, contacts, interview loops, or market clues",
    focusPlaceholder: "AI product role, founder path, developer relations",
    needsPlaceholder: "Portfolio gap, referral need, interview prep, confidence, salary target.",
    wantsPlaceholder: "Better team, more autonomy, stronger learning curve, meaningful product.",
    promptPlaceholder: "Paste job links, people to message, interview notes, or open questions.",
  },
  Learning: {
    badge: "Skill-aware",
    title: "Learning side quests",
    focus: "Skill or topic",
    pace: "Study mode",
    whimsy: "Curiosity appetite",
    needs: "What is blocking the learning loop?",
    wants: "What would make this topic stick?",
    prompt: "Docs, concepts, gaps, or practice clues",
    focusPlaceholder: "Manifest V3, OAuth, Solidity testing, product analytics",
    needsPlaceholder: "Confusing docs, missing examples, weak recall, no practice problem.",
    wantsPlaceholder: "A useful mental model, small demo, teach-back, reusable notes.",
    promptPlaceholder: "Paste docs, snippets, errors, concepts, or a practice target.",
  },
  Wellness: {
    badge: "Recovery-aware",
    title: "Wellness side quests",
    focus: "Energy or recovery area",
    pace: "Care mode",
    whimsy: "Gentleness appetite",
    needs: "What does your body or mind need handled?",
    wants: "What would make today feel steadier?",
    prompt: "Energy clues, schedule pressure, or recovery constraints",
    focusPlaceholder: "Sleep reset, low-energy day, post-travel recovery",
    needsPlaceholder: "Food, rest, movement, low-noise time, fewer decisions, medical caution.",
    wantsPlaceholder: "Calmer evening, walkable routine, earlier shutdown, reduced pressure.",
    promptPlaceholder: "Paste schedule constraints, energy notes, or recovery cues.",
  },
  Social: {
    badge: "Connection-aware",
    title: "Social side quests",
    focus: "Person, group, or network",
    pace: "Connection mode",
    whimsy: "Warmth appetite",
    needs: "What does this connection need to handle?",
    wants: "What would make the interaction meaningful?",
    prompt: "People, context, or conversation openings",
    focusPlaceholder: "Mentors, old friends, potential users, local community",
    needsPlaceholder: "Awkward re-entry, clear ask, low-pressure check-in, intro request.",
    wantsPlaceholder: "Trust, useful feedback, shared curiosity, a clean next step.",
    promptPlaceholder: "Paste names, social contexts, or a message draft.",
  },
  Creative: {
    badge: "Taste-aware",
    title: "Creative side quests",
    focus: "Medium or artifact",
    pace: "Making mode",
    whimsy: "Play appetite",
    needs: "What does this creative loop need to handle?",
    wants: "What would make the artifact interesting?",
    prompt: "References, constraints, or inspiration",
    focusPlaceholder: "Landing copy, visual system, demo story, music sketch",
    needsPlaceholder: "Blank page, too many references, weak taste, no deadline.",
    wantsPlaceholder: "A memorable phrase, visual direction, one weird but useful angle.",
    promptPlaceholder: "Paste references, constraints, audience notes, or scraps.",
  },
};

const sideQuestModeTemplates = {
  Project: [
    {
      type: "Proof",
      title: "Proof shard",
      body: "Ship one visible slice of {focus}: a commit, screenshot, demo note, issue, or user-facing improvement.",
      reward: "+3 Reputation, +2 Focus",
    },
    {
      type: "User",
      title: "One sharp question",
      body: "Turn the current project uncertainty into one question you can ask a real user or reviewer today.",
      reward: "+3 Clarity, +2 Social",
    },
  ],
  Career: [
    {
      type: "Option",
      title: "Opportunity scout",
      body: "Find one live option for {focus}, then write why it is attractive and what proof it would require.",
      reward: "+3 Strategy",
    },
    {
      type: "Reach",
      title: "Warm path",
      body: "Identify one person, community, or artifact that could make the next career step less abstract.",
      reward: "+3 Social, +2 Luck",
    },
  ],
  Learning: [
    {
      type: "Skill",
      title: "Teach-back node",
      body: "Explain one part of {focus} in 10 lines from memory, then patch only the most important gap.",
      reward: "+4 Intelligence",
    },
    {
      type: "Practice",
      title: "Tiny lab",
      body: "Create the smallest runnable example or note that proves you understand the current concept.",
      reward: "+3 Focus, +2 Mastery",
    },
  ],
  Wellness: [
    {
      type: "Recovery",
      title: "Energy floor",
      body: "Choose the lowest-friction stabilizer for {focus}: water, food, walk, shower, stretch, or an earlier shutdown.",
      reward: "+4 Constitution",
    },
    {
      type: "Boundary",
      title: "Pressure release",
      body: "Remove one optional pressure source from the day so recovery has room to work.",
      reward: "+3 Peace",
    },
  ],
  Social: [
    {
      type: "Connection",
      title: "Warm opening",
      body: "Send one short message related to {focus} with a clear, low-pressure reason for reaching out.",
      reward: "+3 Charisma",
    },
    {
      type: "Listen",
      title: "Better question",
      body: "Prepare one question that helps the other person tell you something specific, not generic.",
      reward: "+3 Wisdom, +2 Social",
    },
  ],
  Creative: [
    {
      type: "Draft",
      title: "Ugly first artifact",
      body: "Make the smallest imperfect version of {focus}. No polishing until something exists.",
      reward: "+4 Creativity",
    },
    {
      type: "Taste",
      title: "Reference triad",
      body: "Collect three references and write one thing to borrow from each.",
      reward: "+3 Taste, +2 Focus",
    },
  ],
};

const demoSeed = `goals:
- ship a web MVP for a hackathon
- talk to 5 potential users
- build a weekly creative habit

habits:
- works best late morning
- loses momentum after lunch
- does better with short sprints

blockers:
- overplanning
- avoiding outreach
- inconsistent sleep

deadlines:
- demo day this weekend`;

const demoTravelEvents = `sample local clues:
- evening food market near the waterfront
- small design pop-up in an arts district
- rainy afternoon window
- late-night transit is easier from central stations`;

const chatGptSeedPrompt = `Create a QuestDex profile seed for me from what you know in this conversation.
Return JSON only, with this shape:
{
  "displayName": "string",
  "lifeStage": "Student | Early-career builder | Founder | Career transition | Recovery and reset | Explorer",
  "desiredEvolution": "one sentence",
  "buildGoals": ["Freedom", "Mastery"],
  "priorities": ["Career", "Health"],
  "blockers": ["short blocker"],
  "worldContext": {
    "location": "current arena",
    "industry": "domain or guild",
    "culture": "terrain rules",
    "constraints": ["debuff"],
    "opportunities": ["buff"]
  },
  "party": ["mentor, ally, collaborator, community"],
  "inventory": ["skills, tools, credentials, assets"],
  "evolutionConditions": ["specific condition to evolve"],
  "travel": {
    "destination": "",
    "needs": ["Food", "Quiet"],
    "wants": ["curiosities"],
    "events": ["local clues"]
  },
  "notes": ["important context"]
}`;

const demoChatGptSeed = JSON.stringify(
  {
    displayName: "Mira",
    lifeStage: "Founder",
    desiredEvolution:
      "Become a trusted AI travel builder who ships useful tools, talks to real users, and protects recovery time.",
    buildGoals: ["Freedom", "Mastery", "Adventure", "Service"],
    priorities: ["Startup", "Career", "Creativity", "Health"],
    blockers: ["Overplanning", "Avoiding outreach", "Energy dips after travel"],
    worldContext: {
      location: "Singapore hackathon floor with Seoul as a travel test map",
      industry: "AI travel tools and personal operating systems",
      culture: "Fast demos, public proof, mentor feedback, and user interviews",
      constraints: ["Weekend deadline", "Limited backend", "Low energy after lunch"],
      opportunities: ["GitHub Pages demo", "Mentor access", "Travel side-quest data", "AI automation"],
    },
    party: ["Hackathon teammates", "Potential travelers", "Mentors", "Online builders"],
    inventory: ["QuestDex prototype", "GitHub repo", "Static deploy", "Soul Capsule export", "Product narrative"],
    evolutionConditions: ["Interview two travelers", "Ship a public demo", "Write a sharper README"],
    travel: {
      destination: "Seoul, South Korea",
      needs: ["Food", "Quiet", "Events"],
      wants: ["indie bookstores", "street markets", "riverside walks", "live music"],
      events: ["rain after 5pm", "small jazz set", "evening market near transit"],
    },
    notes: ["Prefers short sprints", "Needs recovery-aware routing", "Gets momentum from visible demos"],
  },
  null,
  2,
);

const form = document.querySelector("#intakeForm");
const seedFile = document.querySelector("#seedFile");
const seedPreview = document.querySelector("#seedPreview");
const githubUsernameInput = document.querySelector("#githubUsername");
const analyzeGithubButton = document.querySelector("#analyzeGithub");
const githubImportStatus = document.querySelector("#githubImportStatus");
const githubRepoHighlights = document.querySelector("#githubRepoHighlights");
const sourceSignalBoard = document.querySelector("#sourceSignalBoard");
const sideQuestModeSelect = document.querySelector("#sideQuestMode");
const sideQuestConfig = document.querySelector("#sideQuestConfig");
const sideQuestModeBadge = document.querySelector("#sideQuestModeBadge");
const sideQuestSetupTitle = document.querySelector("#sideQuestSetupTitle");
const sideQuestFocusLabel = document.querySelector("#sideQuestFocusLabel");
const sideQuestPaceLabel = document.querySelector("#sideQuestPaceLabel");
const sideQuestWhimsyLabel = document.querySelector("#sideQuestWhimsyLabel");
const sideQuestNeedsLabel = document.querySelector("#sideQuestNeedsLabel");
const sideQuestWantsLabel = document.querySelector("#sideQuestWantsLabel");
const sideQuestPromptLabel = document.querySelector("#sideQuestPromptLabel");
const captureDurationSelect = document.querySelector("#captureDuration");
const captureModeSelect = document.querySelector("#captureMode");
const captureStoreUrlCheckbox = document.querySelector("#captureStoreUrl");
const captureEnableSelectedTextCheckbox = document.querySelector("#captureEnableSelectedText");
const captureEnablePageSummaryCheckbox = document.querySelector("#captureEnablePageSummary");
const startCaptureSessionButton = document.querySelector("#startCaptureSession");
const pauseCaptureSessionButton = document.querySelector("#pauseCaptureSession");
const endCaptureSessionButton = document.querySelector("#endCaptureSession");
const loadCaptureDemoButton = document.querySelector("#loadCaptureDemo");
const deleteCaptureSessionButton = document.querySelector("#deleteCaptureSession");
const captureCurrentPageButton = document.querySelector("#captureCurrentPage");
const captureSelectedTextButton = document.querySelector("#captureSelectedText");
const applySessionCaptureSeedButton = document.querySelector("#applySessionCaptureSeed");
const exportSessionCaptureJsonButton = document.querySelector("#exportSessionCaptureJson");
const exportSessionCaptureMarkdownButton = document.querySelector("#exportSessionCaptureMarkdown");
const sessionCaptureStatus = document.querySelector("#sessionCaptureStatus");
const sessionCaptureTimer = document.querySelector("#sessionCaptureTimer");
const sessionCaptureWarning = document.querySelector("#sessionCaptureWarning");
const sessionCaptureItems = document.querySelector("#sessionCaptureItems");
const sessionCaptureAnalysis = document.querySelector("#sessionCaptureAnalysis");
const capturePageTitleInput = document.querySelector("#capturePageTitle");
const capturePageUrlInput = document.querySelector("#capturePageUrl");
const captureSelectedTextValueInput = document.querySelector("#captureSelectedTextValue");
const captureManualNoteInput = document.querySelector("#captureManualNote");
const nudgeTimeInput = document.querySelector("#nudgeTime");
const nudgeToneSelect = document.querySelector("#nudgeTone");
const nudgeChannelSelect = document.querySelector("#nudgeChannel");
const refreshNudgeButton = document.querySelector("#refreshNudge");
const enableBrowserNudgeButton = document.querySelector("#enableBrowserNudge");
const copyChatGptTaskButton = document.querySelector("#copyChatGptTask");
const copyNotionNudgeButton = document.querySelector("#copyNotionNudge");
const copyTelegramNudgeButton = document.querySelector("#copyTelegramNudge");
const nudgeStatus = document.querySelector("#nudgeStatus");
const nudgePayloadPreview = document.querySelector("#nudgePayloadPreview");
const loadDemoDataButton = document.querySelector("#loadDemoData");
const generateQuestDexButton = document.querySelector("#generateQuestDex");
const dashboard = document.querySelector("#dashboard");
const coachForm = document.querySelector("#coachForm");
const coachPrompt = document.querySelector("#coachPrompt");
const resetProfileButton = document.querySelector("#resetProfile");
const rerollQuestsButton = document.querySelector("#rerollQuests");
const rerollSideQuestsButton = document.querySelector("#rerollSideQuests");
const exportSoulButton = document.querySelector("#exportSoul");
const importSoulFile = document.querySelector("#importSoulFile");
const soulPassphrase = document.querySelector("#soulPassphrase");
const soulRecoveryHint = document.querySelector("#soulRecoveryHint");
const exportEncryptedSoulButton = document.querySelector("#exportEncryptedSoul");
const exportSoulAnchorButton = document.querySelector("#exportSoulAnchor");
const importEncryptedSoulFile = document.querySelector("#importEncryptedSoulFile");
const soulAnchorPreview = document.querySelector("#soulAnchorPreview");
const soulStatus = document.querySelector("#soulStatus");

init();

function init() {
  setupRangeOutputs();
  restoreSavedProfile();
  setupChips();

  seedFile.addEventListener("change", handleSeedFile);
  analyzeGithubButton.addEventListener("click", analyzeGithubSource);
  sideQuestModeSelect.addEventListener("change", updateSideQuestModeUi);
  startCaptureSessionButton.addEventListener("click", startCaptureSessionFromUi);
  pauseCaptureSessionButton.addEventListener("click", toggleCaptureSessionPaused);
  endCaptureSessionButton.addEventListener("click", endCaptureSessionFromUi);
  loadCaptureDemoButton.addEventListener("click", loadSessionCaptureDemo);
  deleteCaptureSessionButton.addEventListener("click", deleteSessionCapture);
  captureCurrentPageButton.addEventListener("click", () => captureDraftItem("page_metadata"));
  captureSelectedTextButton.addEventListener("click", () => captureDraftItem("selected_text"));
  applySessionCaptureSeedButton.addEventListener("click", applySessionCaptureSeed);
  exportSessionCaptureJsonButton.addEventListener("click", exportSessionCaptureJson);
  exportSessionCaptureMarkdownButton.addEventListener("click", exportSessionCaptureMarkdown);
  sessionCaptureAnalysis.addEventListener("click", handleSessionSuggestionAction);
  refreshNudgeButton.addEventListener("click", refreshDailyNudge);
  enableBrowserNudgeButton.addEventListener("click", enableBrowserNudge);
  copyChatGptTaskButton.addEventListener("click", copyChatGptTaskPrompt);
  copyNotionNudgeButton.addEventListener("click", copyNotionNudgePayload);
  copyTelegramNudgeButton.addEventListener("click", copyTelegramNudgePayload);
  nudgeTimeInput.addEventListener("change", updateNudgeConfigFromControls);
  nudgeToneSelect.addEventListener("change", updateNudgeConfigFromControls);
  nudgeChannelSelect.addEventListener("change", updateNudgeConfigFromControls);
  loadDemoDataButton.addEventListener("click", loadDemoSeed);
  generateQuestDexButton.addEventListener("click", handleGenerateClick);
  form.addEventListener("submit", handleIntakeSubmit);
  coachForm.addEventListener("submit", handleCoachSubmit);
  resetProfileButton.addEventListener("click", resetProfile);
  rerollQuestsButton.addEventListener("click", rerollQuests);
  rerollSideQuestsButton.addEventListener("click", rerollSideQuests);
  exportSoulButton.addEventListener("click", exportSoulCapsule);
  importSoulFile.addEventListener("change", importSoulCapsule);
  exportEncryptedSoulButton.addEventListener("click", exportEncryptedSoulCapsule);
  exportSoulAnchorButton.addEventListener("click", exportSoulAnchor);
  importEncryptedSoulFile.addEventListener("change", importEncryptedSoulCapsule);
  updateSideQuestModeUi();
  restoreSessionCapture();
  renderSessionCapturePanel();
  hydrateNudgeControls();
  startNudgeTimer();
}

function setupRangeOutputs() {
  document.querySelectorAll('input[type="range"]').forEach((range) => {
    const output = document.querySelector(`[data-output-for="${range.name}"]`);
    if (!output) return;

    const update = () => {
      output.value = range.value;
      output.textContent = range.value;
    };

    range.addEventListener("input", update);
    update();
  });
}

function setupChips() {
  const chipStores = {
    priorities: state.selectedPriorities,
    buildGoals: state.selectedBuildGoals,
    travelNeeds: state.selectedTravelNeeds,
  };

  document.querySelectorAll("[data-chip-group] button").forEach((chip) => {
    const group = chip.closest("[data-chip-group]")?.dataset.chipGroup;
    const store = chipStores[group];
    if (!store) return;

    const value = chip.dataset.value;
    chip.classList.toggle("is-selected", store.has(value));

    chip.addEventListener("click", () => {
      if (store.has(value)) {
        store.delete(value);
      } else {
        store.add(value);
      }

      chip.classList.toggle("is-selected", store.has(value));
    });
  });
}

function handleSeedFile(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    state.uploadedSeed = String(reader.result || "");
    renderSeedPreview(state.uploadedSeed, file.name);
  };
  reader.readAsText(file);
}

function loadDemoSeed() {
  form.elements.seedText.value = demoSeed;
  form.elements.worldLocation.value = "Singapore, hackathon floor, AI tools market";
  form.elements.worldIndustry.value = "AI products and personal operating systems";
  form.elements.worldCulture.value = "Fast-moving, demo-driven, social proof matters";
  form.elements.worldConstraints.value = "Weekend deadline, limited backend, noisy environment, energy dips after lunch.";
  form.elements.worldOpportunities.value = "Public GitHub repo, Pages deploy, live demo, access to AI APIs, curious early users.";
  form.elements.evolutionConditions.value = "Needs user conversations, a clearer memory model, a testnet anchor, and one polished demo story.";
  form.elements.partyText.value = "Hackathon teammates, potential users, mentors, online builders, future recovery partners.";
  form.elements.inventoryText.value = "Static web app, GitHub repo, Pages deployment, tests, Soul Capsule export, product narrative.";
  form.elements.sideQuestMode.value = "Travel";
  form.elements.travelDestination.value = "Singapore";
  form.elements.travelNeedsText.value = "Reliable meals, easy transit, a calm place to reset, and low-friction evening options.";
  form.elements.travelWantsText.value = "Hawker food, design shops, waterfront walks, and one unexpected neighborhood.";
  form.elements.travelEventsSeed.value = demoTravelEvents;
  form.elements.whimsy.value = 72;
  document.querySelector('[data-output-for="whimsy"]').textContent = "72";
  document.querySelector('[data-output-for="whimsy"]').value = "72";
  state.uploadedSeed = "";
  updateSideQuestModeUi();
  renderSeedPreview(demoSeed, "Demo seed");
}

function renderSeedPreview(seed, label) {
  const insights = summarizeSeed(seed);
  seedPreview.hidden = false;
  seedPreview.innerHTML = `
    <strong>${escapeHtml(label)} loaded.</strong>
    <span>${seed.length.toLocaleString()} characters analyzed.</span>
    <span>${escapeHtml(insights.slice(0, 2).join(" "))}</span>
  `;
}

async function copyChatGptPrompt() {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      throw new Error("Clipboard is not available in this browser.");
    }
    await navigator.clipboard.writeText(chatGptSeedPrompt);
    setSourceStatus(chatGptSeedStatus, "Prompt copied. Paste the JSON result back here.");
  } catch (error) {
    setSourceStatus(chatGptSeedStatus, error.message || "Unable to copy prompt.", true);
  }
}

function loadChatGptExample() {
  chatGptSeedInput.value = demoChatGptSeed;
  const sourceSeed = buildChatGptSourceSeed(demoChatGptSeed);
  renderSourceSignalBoard(sourceSeed);
  setSourceStatus(chatGptSeedStatus, "Example seed loaded. Apply it to populate the build.");
}

function applyChatGptSeed() {
  try {
    const sourceSeed = buildChatGptSourceSeed(chatGptSeedInput.value);
    applySourceSeedToForm(sourceSeed);
    setSourceStatus(
      chatGptSeedStatus,
      `Applied ${sourceSeed.signals.length} ChatGPT signals at ${Math.round(sourceSeed.confidence * 100)}% confidence.`,
    );
  } catch (error) {
    setSourceStatus(chatGptSeedStatus, error.message || "Unable to read this ChatGPT seed.", true);
  }
}

async function analyzeGithubSource() {
  const username = sanitizeGithubUsername(githubUsernameInput.value);
  if (!username) {
    setSourceStatus(githubImportStatus, "Enter a GitHub username.", true);
    return;
  }
  if (typeof fetch === "undefined") {
    setSourceStatus(githubImportStatus, "This browser cannot fetch GitHub data.", true);
    return;
  }

  setSourceStatus(githubImportStatus, "Scanning recent public activity and starred repos...");
  analyzeGithubButton.disabled = true;

  try {
    const [user, repos, starredRepos, events] = await Promise.all([
      fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}`),
      fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=50&sort=pushed`),
      fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}/starred?per_page=50`),
      fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100`),
    ]);
    const sourceSeed = buildGithubSourceSeed(user, { repos, starredRepos, events });
    applySourceSeedToForm(sourceSeed);
    renderGithubHighlights(sourceSeed);
    setSourceStatus(
      githubImportStatus,
      `Analyzed ${sourceSeed.meta.recentRepoCount} recent work repo${sourceSeed.meta.recentRepoCount === 1 ? "" : "s"} and ${sourceSeed.meta.starredRepoCount} starred repo${sourceSeed.meta.starredRepoCount === 1 ? "" : "s"}.`,
    );
  } catch (error) {
    setSourceStatus(githubImportStatus, error.message || "Unable to analyze this GitHub profile.", true);
  } finally {
    analyzeGithubButton.disabled = false;
  }
}

async function fetchGithubJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error("GitHub user was not found.");
    if (response.status === 403) throw new Error("GitHub rate limit reached. Try again later or use OAuth in the next build.");
    throw new Error(`GitHub returned ${response.status}.`);
  }

  return response.json();
}

function buildChatGptSourceSeed(rawInput) {
  const rawText = String(rawInput || "").trim();
  if (!rawText) throw new Error("Paste a ChatGPT seed first.");

  const payload = parseSourceJson(rawText);
  const fields = {};
  const sourceText = payload ? JSON.stringify(payload, null, 2) : rawText;

  if (payload) {
    fields.displayName = firstString(payload, ["displayName", "name", "profile.name", "user.name"]);
    fields.lifeStage = normalizeLifeStage(firstString(payload, ["lifeStage", "stage", "profile.lifeStage"]));
    fields.desiredEvolution =
      firstString(payload, ["desiredEvolution", "evolution", "futureSelf", "profile.desiredEvolution"]) ||
      sentenceFromList(firstList(payload, ["goals", "mainQuest", "quests.main"]));
    fields.blockers = listText(firstList(payload, ["blockers", "constraints", "debuffs", "weaknesses"]));
    fields.worldLocation = firstString(payload, ["worldLocation", "world.location", "worldContext.location"]);
    fields.worldIndustry = firstString(payload, ["worldIndustry", "world.industry", "worldContext.industry"]);
    fields.worldCulture = firstString(payload, ["worldCulture", "world.culture", "worldContext.culture"]);
    fields.worldConstraints = listText(firstList(payload, ["worldConstraints", "world.constraints", "worldContext.constraints"]));
    fields.worldOpportunities = listText(
      firstList(payload, ["worldOpportunities", "world.opportunities", "worldContext.opportunities"]),
    );
    fields.partyText = listText(firstList(payload, ["party", "relationships", "network", "team"]));
    fields.inventoryText = listText(firstList(payload, ["inventory", "skills", "tools", "assets", "credentials"]));
    fields.evolutionConditions = listText(
      firstList(payload, ["evolutionConditions", "conditions", "evolution.triggers"]),
    );
    fields.travelDestination = firstString(payload, ["travel.destination", "destination"]);
    fields.travelNeedsText = listText(firstList(payload, ["travel.needs", "travelNeeds"]));
    fields.travelWantsText = listText(firstList(payload, ["travel.wants", "travel.curiosities", "travelWants"]));
    fields.travelEventsSeed = listText(firstList(payload, ["travel.events", "events", "localClues"]));
  } else {
    fields.desiredEvolution = firstLabeledText(rawText, ["desired evolution", "future self", "goal"]);
    fields.blockers = firstLabeledText(rawText, ["blockers", "constraints", "debuffs"]);
    fields.worldOpportunities = firstLabeledText(rawText, ["opportunities", "buffs"]);
    fields.inventoryText = firstLabeledText(rawText, ["inventory", "skills", "tools"]);
    fields.partyText = firstLabeledText(rawText, ["party", "network", "relationships"]);
  }

  const textForInference = `${sourceText} ${Object.values(fields).join(" ")}`.toLowerCase();
  const priorities = sanitizeOptionList(
    payload ? firstList(payload, ["priorities", "questDomains", "domains"]) : inferPriorities(textForInference),
    priorityOptions,
  );
  const buildGoals = sanitizeOptionList(
    payload ? firstList(payload, ["buildGoals", "values", "optimizingFor"]) : inferBuildGoals(textForInference),
    buildGoalOptions,
  );
  const travelNeeds = sanitizeOptionList(
    payload ? firstList(payload, ["travel.needs", "travelNeeds"]) : inferTravelNeeds(textForInference),
    travelNeedOptions,
  );

  return {
    source: "chatgpt",
    label: "ChatGPT memory seed",
    confidence: payload ? 0.86 : 0.62,
    fields: compactObject(fields),
    priorities,
    buildGoals,
    travelNeeds,
    seedText: sourceSeedText("ChatGPT", sourceText),
    signals: buildSourceSignals("ChatGPT", compactObject(fields), priorities, buildGoals, travelNeeds),
  };
}

function buildGithubSourceSeed(user, githubData, now = new Date()) {
  const repos = Array.isArray(githubData) ? githubData : githubData?.repos;
  if (!Array.isArray(repos)) throw new Error("GitHub repos response was not readable.");

  const starredRepos = Array.isArray(githubData?.starredRepos) ? githubData.starredRepos : [];
  const events = Array.isArray(githubData?.events) ? githubData.events : [];
  const usableRepos = repos.filter((repo) => repo && !repo.archived).slice(0, 50);
  const usableStarredRepos = starredRepos.filter((repo) => repo && !repo.archived).slice(0, 50);
  const recentEventRepoNames = recentGithubEventRepoNames(events, now);
  const recentRepos = usableRepos.filter((repo) => {
    const name = repo.full_name || `${user?.login || ""}/${repo.name || ""}`;
    return recentEventRepoNames.has(name) || daysBetween(now, repo.pushed_at || repo.updated_at) <= 30;
  });
  const signalRepos = uniqueRepos([...recentRepos, ...usableStarredRepos]).slice(0, 60);
  const reposForInference = signalRepos.length ? signalRepos : usableRepos.slice(0, 12);
  const languages = topCounts(reposForInference.map((repo) => repo.language).filter(Boolean), 6);
  const topics = topCounts(reposForInference.flatMap((repo) => repo.topics || []), 8);
  const totalStars = reposForInference.reduce((sum, repo) => sum + Number(repo.stargazers_count || 0), 0);
  const totalForks = reposForInference.reduce((sum, repo) => sum + Number(repo.forks_count || 0), 0);
  const recentRepoNames = recentRepos.map((repo) => repo.name).filter(Boolean);
  const starredRepoNames = usableStarredRepos.map((repo) => repo.name).filter(Boolean);
  const repoNames = uniqueTextItems([...recentRepoNames, ...starredRepoNames]).slice(0, 8);
  const repoDescriptions = reposForInference
    .map((repo) => [repo.name, repo.description, repo.language, ...(repo.topics || [])].filter(Boolean).join(" "))
    .join("\n");
  const repoText = `${user?.bio || ""} ${repoDescriptions}`.toLowerCase();
  const languageNames = languages.map(([language]) => language);
  const topicNames = topics.map(([topic]) => topic);
  const productSignals = uniqueTextItems([...topicNames, ...languageNames, ...repoNames]).slice(0, 10);
  const priorities = unique([
    "Career",
    recentRepos.length || repoText.includes("mvp") || repoText.includes("startup") ? "Startup" : "",
    repoText.includes("design") || repoText.includes("creative") ? "Creativity" : "",
    repoText.includes("learn") || repoText.includes("docs") || repoText.includes("research") ? "Study" : "",
  ]).slice(0, 4);
  const buildGoals = unique([
    "Mastery",
    recentRepos.length ? "Status" : "",
    usableStarredRepos.length || totalStars > 0 || totalForks > 0 ? "Service" : "",
    repoText.includes("travel") || repoText.includes("map") ? "Adventure" : "",
    repoText.includes("art") || repoText.includes("design") ? "Creativity" : "",
  ]).slice(0, 5);
  const fields = compactObject({
    displayName: user?.name || user?.login || "",
    worldLocation: user?.location || "",
    worldIndustry: inferGithubIndustry(productSignals, repoText),
    worldCulture: "Recent GitHub motion, public proof-of-work, starred-tool taste, asynchronous builder network",
    worldOpportunities: listText(
      uniqueTextItems([
        `${recentRepos.length} repos worked on in the last 30 days`,
        `${usableStarredRepos.length} starred repos analyzed`,
        recentRepoNames.length ? `Recent work: ${recentRepoNames.slice(0, 4).join(", ")}` : "",
        starredRepoNames.length ? `Starred taste: ${starredRepoNames.slice(0, 4).join(", ")}` : "",
        languageNames.length ? `${languageNames.slice(0, 3).join(", ")} current signal` : "",
      ]),
    ),
    inventoryText: listText(
      uniqueTextItems([
        "GitHub activity graph",
        ...languageNames.map((language) => `${language} signal`),
        ...repoNames.map((name) => `${name} repo`),
      ]).slice(0, 9),
    ),
    partyText: listText(uniqueTextItems(["Open-source users", "repo collaborators", "technical reviewers"])),
    evolutionConditions: listText(
      uniqueTextItems([
        recentRepos.length ? "Turn this month's most active repo into a demo story" : "",
        usableStarredRepos.length ? "Borrow one pattern from a recently starred repo" : "",
        "Ask two users what the active repo should do next",
      ]),
    ),
  });
  const meta = {
    recentRepoCount: recentRepos.length,
    starredRepoCount: usableStarredRepos.length,
    eventRepoCount: recentEventRepoNames.size,
    signalRepoCount: reposForInference.length,
    highlightRepos: repoNames.slice(0, 5),
  };

  return {
    source: "github",
    label: `${user?.login || "GitHub"} recent GitHub signal`,
    confidence: clamp(36 + Math.min(recentRepos.length, 8) * 7 + Math.min(usableStarredRepos.length, 12) * 2 + Math.min(totalStars, 20), 32, 94) / 100,
    fields,
    priorities,
    buildGoals,
    travelNeeds: [],
    seedText: sourceSeedText(
      "GitHub",
      githubSeedSummary(user, reposForInference, languages, topics, recentRepos, usableStarredRepos, totalStars),
    ),
    signals: [
      { title: "Recent work", value: `${recentRepos.length} repo${recentRepos.length === 1 ? "" : "s"}`, detail: "Last 30 days" },
      { title: "Starred taste", value: `${usableStarredRepos.length} repo${usableStarredRepos.length === 1 ? "" : "s"}`, detail: "Public starred repos" },
      { title: "Current languages", value: languageNames.slice(0, 3).join(", ") || "Unspecified", detail: "From recent + starred" },
      { title: "Momentum", value: repoNames.slice(0, 2).join(", ") || "Low public activity", detail: "Most relevant repos" },
      { title: "Build hint", value: buildGoals.join(", "), detail: priorities.join(", ") },
    ],
    meta,
  };
}

function applySourceSeedToForm(sourceSeed) {
  Object.entries(sourceSeed.fields || {}).forEach(([name, value]) => {
    applyFieldValue(name, value);
  });
  sourceSeed.priorities?.forEach((priority) => state.selectedPriorities.add(priority));
  sourceSeed.buildGoals?.forEach((goal) => state.selectedBuildGoals.add(goal));
  sourceSeed.travelNeeds?.forEach((need) => state.selectedTravelNeeds.add(need));
  appendSeedText(sourceSeed.seedText);
  syncChipSelections();
  renderSourceSignalBoard(sourceSeed);
  renderSeedPreview(form.elements.seedText.value, sourceSeed.label);
}

function applyFieldValue(name, value) {
  const field = form.elements[name];
  const cleanValue = String(value || "").trim();
  if (!field || !cleanValue) return;

  if (field.tagName === "SELECT") {
    const optionValues = Array.from(field.options || []).map((option) => option.value);
    if (optionValues.includes(cleanValue)) field.value = cleanValue;
    return;
  }

  const appendFields = new Set([
    "blockers",
    "worldConstraints",
    "worldOpportunities",
    "partyText",
    "inventoryText",
    "evolutionConditions",
    "travelNeedsText",
    "travelWantsText",
    "travelEventsSeed",
  ]);
  if (appendFields.has(name)) {
    field.value = mergeTextBlock(field.value, cleanValue);
    return;
  }

  if (!field.value.trim()) field.value = cleanValue;
}

function appendSeedText(seedText) {
  if (!seedText) return;
  const seedField = form.elements.seedText;
  seedField.value = mergeTextBlock(seedField.value, seedText);
}

function syncChipSelections() {
  const chipStores = {
    priorities: state.selectedPriorities,
    buildGoals: state.selectedBuildGoals,
    travelNeeds: state.selectedTravelNeeds,
  };

  document.querySelectorAll("[data-chip-group] button").forEach((chip) => {
    const group = chip.closest("[data-chip-group]")?.dataset.chipGroup;
    const store = chipStores[group];
    if (!store) return;
    chip.classList.toggle("is-selected", store.has(chip.dataset.value));
  });
}

function renderSourceSignalBoard(sourceSeed) {
  if (!sourceSignalBoard) return;
  sourceSignalBoard.hidden = false;
  sourceSignalBoard.innerHTML = `
    <div class="source-board-heading">
      <div>
        <p class="eyebrow">Imported signals</p>
        <h4>${escapeHtml(sourceSeed.label)}</h4>
      </div>
      <span class="source-badge">${Math.round(sourceSeed.confidence * 100)}% confidence</span>
    </div>
    <div class="source-signal-grid">
      ${sourceSeed.signals
        .map(
          (signal) => `
            <article class="source-signal">
              <span>${escapeHtml(signal.title)}</span>
              <strong>${escapeHtml(signal.value || "Mapped")}</strong>
              <small>${escapeHtml(signal.detail || "")}</small>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderGithubHighlights(sourceSeed, repos = []) {
  if (!githubRepoHighlights) return;
  const repoNames = sourceSeed.meta?.highlightRepos?.length
    ? sourceSeed.meta.highlightRepos
    : repos.slice(0, 4).map((repo) => repo.name);
  githubRepoHighlights.hidden = false;
  githubRepoHighlights.innerHTML = repoNames
    .map((name) => `<span>${escapeHtml(name)}</span>`)
    .concat([`<span>${Math.round(sourceSeed.confidence * 100)}% match</span>`])
    .join("");
}

function setSourceStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("is-error", isError);
}

function updateSideQuestModeUi() {
  const mode = normalizeSideQuestMode(sideQuestModeSelect?.value);
  const copy = sideQuestModePrompts[mode] || sideQuestModePrompts.Off;
  if (sideQuestConfig) sideQuestConfig.hidden = mode === "Off";
  if (sideQuestModeBadge) sideQuestModeBadge.textContent = copy.badge;
  if (sideQuestSetupTitle) sideQuestSetupTitle.textContent = copy.title;
  setText(sideQuestFocusLabel, copy.focus);
  setText(sideQuestPaceLabel, copy.pace);
  setText(sideQuestWhimsyLabel, copy.whimsy);
  setText(sideQuestNeedsLabel, copy.needs);
  setText(sideQuestWantsLabel, copy.wants);
  setText(sideQuestPromptLabel, copy.prompt);
  setPlaceholder(form.elements.travelDestination, copy.focusPlaceholder);
  setPlaceholder(form.elements.travelNeedsText, copy.needsPlaceholder);
  setPlaceholder(form.elements.travelWantsText, copy.wantsPlaceholder);
  setPlaceholder(form.elements.travelEventsSeed, copy.promptPlaceholder);
}

function normalizeSideQuestMode(value) {
  const mode = String(value || "Off");
  return sideQuestModes.includes(mode) ? mode : "Off";
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function setPlaceholder(element, value) {
  if (element) element.placeholder = value;
}

function startCaptureSessionFromUi() {
  state.sessionCapture.activeSession = createCaptureSession(readSessionCaptureSettingsFromUi());
  state.sessionCapture.lastAnalysis = null;
  clearSessionCaptureDraft();
  persistSessionCapture();
  renderSessionCapturePanel();
  setSourceStatus(sessionCaptureStatus, "Session active. Capture only pages you want the coach to use.");
}

function readSessionCaptureSettingsFromUi() {
  return {
    durationMinutes: Number(captureDurationSelect?.value || defaultSessionCaptureSettings.durationMinutes),
    mode: captureModeSelect?.value || defaultSessionCaptureSettings.mode,
    storeFullUrl: Boolean(captureStoreUrlCheckbox?.checked),
    enableSelectedTextCapture: captureEnableSelectedTextCheckbox?.checked !== false,
    enablePageSummary: Boolean(captureEnablePageSummaryCheckbox?.checked),
  };
}

function createCaptureSession(settings = {}, now = new Date()) {
  const merged = {
    ...defaultSessionCaptureSettings,
    ...settings,
    mode: normalizeCaptureMode(settings.mode || defaultSessionCaptureSettings.mode),
    durationMinutes: normalizeCaptureDuration(settings.durationMinutes),
  };
  const startedAt = new Date(now);
  const expiresAt = new Date(startedAt.getTime() + merged.durationMinutes * 60000);

  return {
    schemaVersion: SESSION_CAPTURE_VERSION,
    id: createId("session"),
    status: "active",
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    mode: merged.mode,
    settings: merged,
    items: [],
    privacyFlags: [],
    analysis: null,
  };
}

function normalizeCaptureDuration(value) {
  const duration = Number(value || defaultSessionCaptureSettings.durationMinutes);
  return [5, 15, 30, 60].includes(duration) ? duration : defaultSessionCaptureSettings.durationMinutes;
}

function normalizeCaptureMode(value) {
  const mode = String(value || "");
  return ["domain_only", "standard", "selected_text", "page_summary"].includes(mode) ? mode : "standard";
}

function toggleCaptureSessionPaused() {
  const session = state.sessionCapture.activeSession;
  if (!session) {
    setSourceStatus(sessionCaptureStatus, "Start a session before pausing capture.", true);
    return;
  }
  if (session.status === "paused") {
    session.status = "active";
    setSourceStatus(sessionCaptureStatus, "Session resumed.");
  } else if (session.status === "active") {
    session.status = "paused";
    setSourceStatus(sessionCaptureStatus, "Session paused. No capture will be accepted until resumed.");
  } else {
    setSourceStatus(sessionCaptureStatus, "This session is no longer active.", true);
  }
  persistSessionCapture();
  renderSessionCapturePanel();
}

function endCaptureSessionFromUi() {
  const session = state.sessionCapture.activeSession;
  if (!session) {
    setSourceStatus(sessionCaptureStatus, "Start or load a session before analysis.", true);
    return;
  }

  expireCaptureSessionIfNeeded(session);
  session.status = session.status === "deleted" ? "deleted" : "ended";
  session.endedAt = new Date().toISOString();
  const analysis = analyzeCaptureSession(session, state.profile);
  session.analysis = analysis;
  state.sessionCapture.lastAnalysis = analysis;
  persistSessionCapture();
  renderSessionCapturePanel();
  setSourceStatus(sessionCaptureStatus, "Session analyzed. Review the suggested profile updates before applying them.");
}

function loadSessionCaptureDemo() {
  const session = createCaptureSession({
    durationMinutes: 30,
    mode: "standard",
    storeFullUrl: false,
    enableSelectedTextCapture: true,
    enablePageSummary: true,
  }, new Date("2026-05-09T06:30:00.000Z"));
  const demoItems = [
    {
      type: "page_metadata",
      title: "Chrome extensions activeTab documentation",
      url: "https://developer.chrome.com/docs/extensions/develop/concepts/activeTab",
      manualNote: "Researching temporary user-invoked browser access for privacy-first session capture.",
    },
    {
      type: "page_metadata",
      title: "Manifest V3 service worker migration",
      url: "https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers",
      manualNote: "Need a small extension popup and local storage path, not passive browsing monitoring.",
    },
    {
      type: "selected_text",
      title: "Human RPG session capture notes",
      url: "https://questdex.local/session-capture-prd",
      selectedText: "Turn this research session into active interests, quests, skill-tree nodes, and next actions.",
      manualNote: "This maps browsing attention into a reviewable Human RPG quest log.",
    },
  ];

  demoItems.forEach((item) => captureItemIntoSession(session, item, item.type, new Date("2026-05-09T06:35:00.000Z")));
  session.status = "ended";
  session.endedAt = new Date("2026-05-09T06:45:00.000Z").toISOString();
  session.analysis = analyzeCaptureSession(session, state.profile, new Date("2026-05-09T06:45:00.000Z"));
  state.sessionCapture.activeSession = session;
  state.sessionCapture.lastAnalysis = session.analysis;
  persistSessionCapture();
  renderSessionCapturePanel();
  setSourceStatus(sessionCaptureStatus, "Demo session loaded and analyzed.");
}

function deleteSessionCapture() {
  state.sessionCapture.activeSession = null;
  state.sessionCapture.lastAnalysis = null;
  localStorage.removeItem(SESSION_CAPTURE_STORAGE_KEY);
  renderSessionCapturePanel();
  setSourceStatus(sessionCaptureStatus, "Capture session deleted locally.");
}

function captureDraftItem(type) {
  const session = writableCaptureSession();
  if (!session) return;

  const draft = {
    title: capturePageTitleInput?.value || "",
    url: capturePageUrlInput?.value || "",
    selectedText: captureSelectedTextValueInput?.value || "",
    manualNote: captureManualNoteInput?.value || "",
  };
  const result = captureItemIntoSession(session, draft, type);
  let statusMessage = "";
  let isError = false;

  if (result.blocked) {
    showSessionCaptureWarning(result.flag.reason);
    statusMessage = "Capture blocked by privacy guard.";
    isError = true;
  } else if (result.duplicate) {
    hideSessionCaptureWarning();
    statusMessage = "Repeated page folded into the existing capture.";
  } else {
    hideSessionCaptureWarning();
    statusMessage = `Captured ${result.item.domain || "session item"}.`;
  }

  persistSessionCapture();
  renderSessionCapturePanel();
  setSourceStatus(sessionCaptureStatus, statusMessage, isError);
}

function writableCaptureSession() {
  const session = state.sessionCapture.activeSession;
  if (!session) {
    setSourceStatus(sessionCaptureStatus, "Start a capture session first.", true);
    return null;
  }
  expireCaptureSessionIfNeeded(session);
  if (session.status === "expired") {
    persistSessionCapture();
    renderSessionCapturePanel();
    setSourceStatus(sessionCaptureStatus, "This session expired. Analyze it or start a new one.", true);
    return null;
  }
  if (session.status === "paused") {
    setSourceStatus(sessionCaptureStatus, "Session is paused.", true);
    return null;
  }
  if (session.status !== "active") {
    setSourceStatus(sessionCaptureStatus, "Start a new session before capturing more pages.", true);
    return null;
  }
  return session;
}

function expireCaptureSessionIfNeeded(session, now = new Date()) {
  if (!session || session.status !== "active") return false;
  if (new Date(session.expiresAt).getTime() > new Date(now).getTime()) return false;
  session.status = "expired";
  return true;
}

function captureItemIntoSession(session, draft, type = "page_metadata", now = new Date()) {
  const processed = processCaptureItem(session, draft, type, now);
  if (processed.blocked) {
    session.privacyFlags.push(processed.flag);
    return processed;
  }

  const duplicate = findDuplicateCapture(session.items, processed.item);
  if (duplicate) {
    duplicate.repeatCount = Number(duplicate.repeatCount || 1) + 1;
    duplicate.capturedAt = processed.item.capturedAt;
    return { item: duplicate, duplicate: true };
  }

  session.items.push(processed.item);
  return { item: processed.item, duplicate: false };
}

function processCaptureItem(session, draft, type = "page_metadata", now = new Date()) {
  const page = normalizeCapturePage(draft.url || "");
  const title = cleanCaptureText(draft.title || page.title || "Untitled page", 140);
  const selectedText = cleanCaptureText(draft.selectedText || "", SESSION_CAPTURE_TEXT_LIMIT);
  const manualNote = cleanCaptureText(draft.manualNote || "", SESSION_CAPTURE_TEXT_LIMIT);
  const detection = detectSensitiveCapture({
    title,
    domain: page.domain,
    url: page.cleanUrl || draft.url || "",
    selectedText,
    manualNote,
    hasPasswordField: Boolean(draft.hasPasswordField),
  });

  if (detection.sensitive) {
    return {
      blocked: true,
      flag: {
        id: createId("privacy"),
        severity: "blocked",
        reason: detection.reason,
      },
    };
  }

  const mode = type === "selected_text" ? "selected_text" : normalizeCaptureMode(session.mode);
  const storeUrl = Boolean(session.settings?.storeFullUrl && mode !== "domain_only");
  const includeSelectedText =
    Boolean(selectedText) && (mode === "selected_text" || session.settings?.enableSelectedTextCapture);
  const includePageSummary = Boolean(manualNote) && (mode === "page_summary" || session.settings?.enablePageSummary);

  return {
    blocked: false,
    item: {
      id: createId("capture"),
      sessionId: session.id,
      type: mode === "selected_text" ? "selected_text" : includePageSummary ? "page_summary" : type,
      capturedAt: new Date(now).toISOString(),
      title: mode === "domain_only" ? "" : title,
      domain: page.domain,
      url: storeUrl ? page.cleanUrl : "",
      urlWasStored: Boolean(storeUrl && page.cleanUrl),
      selectedText: includeSelectedText ? selectedText : "",
      pageSummary: includePageSummary ? manualNote : "",
      manualNote: includePageSummary ? "" : manualNote,
      sensitive: false,
      source: type === "selected_text" ? "manual_selection" : "manual",
      rawContentStored: Boolean(includeSelectedText || includePageSummary || manualNote),
      repeatCount: 1,
    },
  };
}

function normalizeCapturePage(value) {
  const raw = String(value || "").trim();
  if (!raw) return { domain: "", cleanUrl: "" };

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    const domain = url.hostname.replace(/^www\./, "");
    const cleanUrl = `${url.protocol}//${url.host}${url.pathname.replace(/\/$/, "")}`;
    return { domain, cleanUrl, protocol: url.protocol };
  } catch (error) {
    return {
      domain: raw
        .replace(/^https?:\/\//i, "")
        .split(/[/?#]/)[0]
        .replace(/^www\./, ""),
      cleanUrl: "",
    };
  }
}

function detectSensitiveCapture({ title = "", domain = "", url = "", selectedText = "", manualNote = "", hasPasswordField = false }) {
  const haystack = `${title} ${domain} ${url}`.toLowerCase();
  const text = `${selectedText} ${manualNote}`.toLowerCase();
  const blockedKeywords = [
    "bank",
    "brokerage",
    "clinic",
    "exchange",
    "government",
    "hospital",
    "immigration",
    "inbox",
    "insurance",
    "login",
    "medical",
    "messages",
    "password",
    "payroll",
    "signin",
    "tax",
    "wallet",
  ];
  const blockedDomains = [
    "accounts.google.com",
    "mail.google.com",
    "web.whatsapp.com",
    "icloud.com",
    "dropbox.com",
    "drive.google.com",
  ];

  if (hasPasswordField) {
    return { sensitive: true, reason: "Password fields are never captured." };
  }
  if (/^(chrome|about|file|data):/i.test(String(url || ""))) {
    return { sensitive: true, reason: "Browser-internal and local pages are blocked by default." };
  }
  if (blockedDomains.some((blockedDomain) => domain.endsWith(blockedDomain))) {
    return { sensitive: true, reason: `${domain} is on the never-capture list.` };
  }
  const keyword = blockedKeywords.find((word) => haystack.includes(word));
  if (keyword) {
    return { sensitive: true, reason: `This page looks sensitive because it matched "${keyword}".` };
  }
  if (/password|one-time code|otp|access token|secret key|private key/i.test(text)) {
    return { sensitive: true, reason: "Selected text appears to contain secrets or authentication material." };
  }

  return { sensitive: false, reason: "" };
}

function cleanCaptureText(value, limit) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  const truncated = normalized.length > limit ? `${normalized.slice(0, limit - 3).trim()}...` : normalized;
  return redactSensitivePatterns(truncated);
}

function redactSensitivePatterns(value) {
  return String(value || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
    .replace(/\b(?:\+?\d[\s-]?){9,}\b/g, "[redacted phone]")
    .replace(/\b(?:sk|ghp|gho|github_pat)_[A-Za-z0-9_]{12,}\b/g, "[redacted token]")
    .replace(/\b[A-Fa-f0-9]{32,}\b/g, "[redacted secret]");
}

function findDuplicateCapture(items, item) {
  return items.find((existing) => {
    const existingKey = [existing.type, existing.domain, existing.url, existing.title].join("|").toLowerCase();
    const itemKey = [item.type, item.domain, item.url, item.title].join("|").toLowerCase();
    return existingKey === itemKey;
  });
}

function analyzeCaptureSession(session, existingProfile = null, now = new Date()) {
  const items = Array.isArray(session?.items) ? session.items.filter((item) => !item.sensitive) : [];
  const topics = detectSessionTopics(items);
  const archetypeActivity = buildSessionArchetypeActivity(topics, items);
  const suggestedQuests = buildSessionSuggestedQuests(topics, items);
  const suggestedSkillNodes = buildSessionSkillNodes(topics, items);
  const interestSignals = buildSessionInterestSignals(topics, items);
  const suggestedProfileUpdates = buildSessionProfileUpdates(topics, archetypeActivity, suggestedQuests, items);
  const topTopic = topics[0]?.label || "current research";
  const domainText = uniqueTextItems(items.map((item) => item.domain)).slice(0, 4).join(", ");
  const confidence = clamp(44 + Math.min(items.length, 8) * 6 + Math.min(topics.length, 5) * 5, 35, 92) / 100;
  const existingName = existingProfile?.displayName ? `${existingProfile.displayName}, ` : "";

  return {
    id: createId("analysis"),
    sessionId: session?.id || "",
    generatedAt: new Date(now).toISOString(),
    summary: items.length
      ? `${existingName}this session points toward ${topTopic}${domainText ? ` across ${domainText}` : ""}. The useful move is to turn that attention into one visible quest and one skill node.`
      : "No pages were captured. Add a page, selected text, or manual note before using this as a coaching signal.",
    detectedTopics: topics,
    interestSignals,
    archetypeActivity,
    suggestedQuests,
    suggestedSkillNodes,
    nextAction: suggestedQuests[0]?.suggestedNextStep || "Capture one research page, then write the next physical action.",
    confidence,
    suggestedProfileUpdates,
    privacyFlags: session?.privacyFlags || [],
  };
}

function detectSessionTopics(items) {
  const topicMap = [
    {
      label: "Chrome extension development",
      keywords: ["chrome", "extension", "manifest", "mv3", "activetab", "scripting", "service worker"],
      archetypes: ["Builder", "Scholar"],
      skill: "Chrome Extension Manifest V3",
      priority: "Startup",
    },
    {
      label: "Privacy-first product design",
      keywords: ["privacy", "consent", "local", "redact", "sensitive", "permission", "storage"],
      archetypes: ["Strategist", "Scholar"],
      skill: "Consent and data minimization",
      priority: "Startup",
    },
    {
      label: "Human RPG product design",
      keywords: ["quest", "rpg", "coach", "profile", "skill tree", "archetype", "human"],
      archetypes: ["Builder", "Artist"],
      skill: "Game-like product framing",
      priority: "Creativity",
    },
    {
      label: "AI tools and agents",
      keywords: ["ai", "llm", "agent", "chatgpt", "automation", "prompt"],
      archetypes: ["Builder", "Scholar"],
      skill: "AI workflow design",
      priority: "Startup",
    },
    {
      label: "Travel discovery",
      keywords: ["travel", "country", "itinerary", "hotel", "flight", "restaurant", "events", "map"],
      archetypes: ["Explorer", "Strategist"],
      skill: "Local discovery routing",
      priority: "Creativity",
      travelNeed: "Events",
    },
    {
      label: "Career exploration",
      keywords: ["career", "job", "interview", "resume", "salary", "role", "hiring"],
      archetypes: ["Strategist", "Diplomat"],
      skill: "Career option mapping",
      priority: "Career",
    },
    {
      label: "Health and recovery",
      keywords: ["sleep", "fitness", "health", "energy", "recovery", "habit", "stress"],
      archetypes: ["Warrior", "Healer"],
      skill: "Energy floor design",
      priority: "Health",
    },
    {
      label: "Open-source proof-of-work",
      keywords: ["github", "repo", "readme", "pull request", "issue", "commit", "deploy"],
      archetypes: ["Builder", "Strategist"],
      skill: "Public proof loop",
      priority: "Startup",
    },
  ];
  const scored = topicMap
    .map((topic) => {
      const evidence = items.filter((item) => {
        const text = captureItemText(item).toLowerCase();
        return topic.keywords.some((keyword) => text.includes(keyword));
      });
      return {
        ...topic,
        evidenceItemIds: evidence.map((item) => item.id),
        confidence: clamp(50 + evidence.length * 12, 0, 94) / 100,
      };
    })
    .filter((topic) => topic.evidenceItemIds.length)
    .sort((a, b) => b.confidence - a.confidence || b.evidenceItemIds.length - a.evidenceItemIds.length);

  if (scored.length) {
    return scored.slice(0, 5).map(({ keywords, archetypes, skill, priority, travelNeed, ...topic }) => topic);
  }

  const domains = topCounts(items.map((item) => item.domain).filter(Boolean), 3);
  return domains.map(([domain, count]) => ({
    label: `${domain} research`,
    evidenceItemIds: items.filter((item) => item.domain === domain).map((item) => item.id),
    confidence: clamp(45 + count * 10, 45, 82) / 100,
  }));
}

function buildSessionArchetypeActivity(topics, items) {
  const topicText = topics.map((topic) => topic.label).join(" ").toLowerCase();
  const scores = {
    Builder: items.length ? 2 : 0,
    Scholar: topics.length ? 2 : 0,
    Strategist: 0,
    Explorer: 0,
    Artist: 0,
    Healer: 0,
    Warrior: 0,
    Diplomat: 0,
  };

  if (topicText.includes("extension") || topicText.includes("open-source") || topicText.includes("ai")) scores.Builder += 4;
  if (topicText.includes("privacy") || topicText.includes("career")) scores.Strategist += 4;
  if (topicText.includes("travel")) scores.Explorer += 4;
  if (topicText.includes("rpg") || topicText.includes("design")) scores.Artist += 3;
  if (topicText.includes("health") || topicText.includes("recovery")) {
    scores.Healer += 4;
    scores.Warrior += 2;
  }
  if (topicText.includes("career")) scores.Diplomat += 2;

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([archetype, score]) => ({
      archetype,
      rationale: `Session evidence suggests ${archetype.toLowerCase()} activity across ${topics.length || items.length} signal${topics.length === 1 || items.length === 1 ? "" : "s"}.`,
      confidence: clamp(48 + score * 8, 50, 90) / 100,
    }));
}

function buildSessionSuggestedQuests(topics, items) {
  const leadTopic = topics[0]?.label || "Captured research";
  const quests = [
    {
      id: createId("quest"),
      title: `Turn ${leadTopic} into a quest log`,
      questType: "main",
      description: "Convert this browsing session into one concrete artifact, decision, or next user-facing step.",
      suggestedNextStep: "Write one implementation task, one open question, and one visible proof-of-work action.",
      linkedArchetypes: ["Builder", "Scholar", "Strategist"],
      linkedTopics: topics.slice(0, 3).map((topic) => topic.label),
      confidence: topics[0]?.confidence || 0.62,
    },
  ];

  if (topics.some((topic) => topic.label.includes("Privacy"))) {
    quests.push({
      id: createId("quest"),
      title: "Privacy review checkpoint",
      questType: "side",
      description: "List what was captured, what was refused, and what the user can delete before saving anything permanent.",
      suggestedNextStep: "Verify the capture stores title, domain, timestamp, and user-approved text only.",
      linkedArchetypes: ["Strategist", "Scholar"],
      linkedTopics: ["Privacy-first product design"],
      confidence: 0.84,
    });
  }

  if (items.some((item) => item.selectedText)) {
    quests.push({
      id: createId("quest"),
      title: "Extract the chosen sentence",
      questType: "daily",
      description: "Use the selected text as a focused clue instead of letting the whole session sprawl.",
      suggestedNextStep: "Rewrite the selected text as a single next action.",
      linkedArchetypes: ["Scholar"],
      linkedTopics: topics.slice(0, 2).map((topic) => topic.label),
      confidence: 0.78,
    });
  }

  return quests.slice(0, 4);
}

function buildSessionSkillNodes(topics, items) {
  const skillByTopic = {
    "Chrome extension development": "Chrome Extension Manifest V3",
    "Privacy-first product design": "Consent and data minimization",
    "Human RPG product design": "Game-like product framing",
    "AI tools and agents": "AI workflow design",
    "Travel discovery": "Local discovery routing",
    "Career exploration": "Career option mapping",
    "Health and recovery": "Energy floor design",
    "Open-source proof-of-work": "Public proof loop",
  };

  const nodes = topics.map((topic) => ({
    id: createId("skill"),
    title: skillByTopic[topic.label] || topic.label,
    category: topic.label.includes("Privacy") ? "Product Skill" : "Research Skill",
    description: `Unlocked by ${topic.evidenceItemIds.length} captured item${topic.evidenceItemIds.length === 1 ? "" : "s"} in this session.`,
    evidenceItemIds: topic.evidenceItemIds,
    confidence: topic.confidence,
  }));

  if (!nodes.length && items.length) {
    nodes.push({
      id: createId("skill"),
      title: "Session synthesis",
      category: "Meta Skill",
      description: "Turn scattered browsing into a concise quest, skill node, and next action.",
      evidenceItemIds: items.map((item) => item.id),
      confidence: 0.58,
    });
  }

  return nodes.slice(0, 5);
}

function buildSessionInterestSignals(topics, items) {
  const domainCounts = topCounts(items.map((item) => item.domain).filter(Boolean), 5);
  const signals = topics.slice(0, 3).map((topic) => ({
    label: topic.label,
    signalType: topic.evidenceItemIds.length > 1 ? "repeated_topic" : "learning",
    evidenceItemIds: topic.evidenceItemIds,
    confidence: topic.confidence,
  }));

  domainCounts
    .filter(([, count]) => count > 1)
    .forEach(([domain, count]) => {
      signals.push({
        label: `Repeated ${domain} research`,
        signalType: "deep_reading",
        evidenceItemIds: items.filter((item) => item.domain === domain).map((item) => item.id),
        confidence: clamp(50 + count * 10, 50, 86) / 100,
      });
    });

  if (items.some((item) => item.selectedText)) {
    signals.push({
      label: "User-selected evidence",
      signalType: "selected_text",
      evidenceItemIds: items.filter((item) => item.selectedText).map((item) => item.id),
      confidence: 0.82,
    });
  }

  return signals.slice(0, 6);
}

function buildSessionProfileUpdates(topics, archetypeActivity, quests, items) {
  const updates = [];
  topics.slice(0, 3).forEach((topic) => {
    updates.push({
      id: createId("suggestion"),
      type: "interest",
      label: topic.label,
      value: `${topic.label} appears in this captured research session.`,
      evidenceItemIds: topic.evidenceItemIds,
      confidence: topic.confidence,
      status: "pending",
    });
  });
  archetypeActivity.slice(0, 2).forEach((activity) => {
    updates.push({
      id: createId("suggestion"),
      type: "archetype_signal",
      label: `${activity.archetype} activity`,
      value: activity.rationale,
      evidenceItemIds: items.map((item) => item.id),
      confidence: activity.confidence,
      status: "pending",
    });
  });
  quests.slice(0, 1).forEach((quest) => {
    updates.push({
      id: createId("suggestion"),
      type: "quest",
      label: quest.title,
      value: quest.suggestedNextStep,
      evidenceItemIds: items.map((item) => item.id),
      confidence: quest.confidence,
      status: "pending",
    });
  });
  return updates.slice(0, 6);
}

function buildSessionCaptureSourceSeed(session, analysis) {
  const usableUpdates = (analysis.suggestedProfileUpdates || []).filter((update) => update.status !== "rejected");
  const topicLabels = analysis.detectedTopics?.map((topic) => topic.label) || [];
  const items = session.items || [];
  const domains = uniqueTextItems(items.map((item) => item.domain)).slice(0, 6);
  const topicText = topicLabels.join(" ").toLowerCase();
  const priorities = unique(
    [
      topicText.includes("travel") ? "Creativity" : "",
      topicText.includes("career") ? "Career" : "",
      topicText.includes("health") ? "Health" : "",
      topicText.includes("extension") || topicText.includes("ai") || topicText.includes("open-source") ? "Startup" : "",
      "Study",
    ].filter(Boolean),
  ).slice(0, 5);
  const buildGoals = unique(["Mastery", "Status", topicText.includes("privacy") ? "Service" : "", topicText.includes("travel") ? "Adventure" : ""]).slice(0, 5);
  const travelNeeds = topicText.includes("travel") ? ["Events", "Culture"] : [];
  const fields = compactObject({
    worldIndustry: topicLabels.slice(0, 2).join(" / "),
    worldCulture: "User-consented research loop, local-first capture, review before memory",
    worldOpportunities: listText(["Fresh browsing session", ...domains.map((domain) => `${domain} signal`)]),
    inventoryText: listText(["Captured research session", ...topicLabels.map((topic) => `${topic} notes`)]),
    evolutionConditions: listText([analysis.nextAction, ...usableUpdates.slice(0, 2).map((update) => update.label)]),
    blockers: analysis.interestSignals?.some((signal) => signal.signalType === "repeated_topic") ? "Open research loop" : "",
    travelEventsSeed: topicText.includes("travel") ? analysis.summary : "",
  });

  return {
    source: "session-capture",
    label: "Browser session capture",
    confidence: analysis.confidence || 0.62,
    fields,
    priorities,
    buildGoals,
    travelNeeds,
    seedText: sourceSeedText("Session Capture", sessionCaptureSeedSummary(session, analysis)),
    signals: [
      { title: "Captures", value: `${items.length} item${items.length === 1 ? "" : "s"}`, detail: `${domains.length} domain${domains.length === 1 ? "" : "s"}` },
      { title: "Topics", value: topicLabels.slice(0, 2).join(", ") || "Research", detail: `${Math.round((analysis.confidence || 0.62) * 100)}% confidence` },
      { title: "Archetype", value: analysis.archetypeActivity?.[0]?.archetype || "Scholar", detail: "Staged, not auto-saved" },
      { title: "Next action", value: shorten(analysis.nextAction || "Review session", 44), detail: "Quest candidate" },
      { title: "Privacy", value: session.privacyFlags?.length ? `${session.privacyFlags.length} flag${session.privacyFlags.length === 1 ? "" : "s"}` : "No flags", detail: "Local-only export" },
    ],
  };
}

function sessionCaptureSeedSummary(session, analysis) {
  const captureLines = (session.items || [])
    .slice(0, 8)
    .map((item) => `- ${item.title || item.domain || "Untitled"} (${item.domain || "unknown"}): ${shorten(captureItemText(item), 140)}`)
    .join("\n");

  return [
    `session id: ${session.id}`,
    `status: ${session.status}`,
    `mode: ${session.mode}`,
    `summary: ${analysis.summary}`,
    `topics: ${(analysis.detectedTopics || []).map((topic) => topic.label).join(", ") || "none"}`,
    `next action: ${analysis.nextAction}`,
    "captures:",
    captureLines,
  ]
    .filter(Boolean)
    .join("\n");
}

function applySessionCaptureSeed() {
  const session = state.sessionCapture.activeSession;
  const analysis = session?.analysis || state.sessionCapture.lastAnalysis;
  if (!session || !analysis) {
    setSourceStatus(sessionCaptureStatus, "Analyze a capture session before applying it.", true);
    return;
  }

  const sourceSeed = buildSessionCaptureSourceSeed(session, analysis);
  applySourceSeedToForm(sourceSeed);
  setSourceStatus(
    sessionCaptureStatus,
    `Applied ${sourceSeed.signals.length} session signals at ${Math.round(sourceSeed.confidence * 100)}% confidence.`,
  );
}

function exportSessionCaptureJson() {
  const session = state.sessionCapture.activeSession;
  if (!session) {
    setSourceStatus(sessionCaptureStatus, "No capture session to export.", true);
    return null;
  }
  const payload = buildSessionCaptureExport(session);
  const filename = `questdex-session-${slugify(session.id)}.json`;
  const serialized = downloadJson(payload, filename);
  setSourceStatus(sessionCaptureStatus, `Exported ${filename}.`);
  return serialized;
}

function exportSessionCaptureMarkdown() {
  const session = state.sessionCapture.activeSession;
  if (!session) {
    setSourceStatus(sessionCaptureStatus, "No capture session to export.", true);
    return null;
  }
  const markdown = exportSessionCaptureMarkdownText(session);
  const filename = `questdex-session-${slugify(session.id)}.md`;
  downloadText(markdown, filename, "text/markdown");
  setSourceStatus(sessionCaptureStatus, `Exported ${filename}.`);
  return markdown;
}

function buildSessionCaptureExport(session) {
  return {
    schemaVersion: SESSION_CAPTURE_VERSION,
    app: "QuestDex Coach",
    type: "SessionCapture",
    exportedAt: new Date().toISOString(),
    privacyNote: "User-approved capture export. No cookies, tokens, browser secrets, localStorage, sessionStorage, screenshots, or passive history are included.",
    session,
  };
}

function exportSessionCaptureMarkdownText(session) {
  const analysis = session.analysis || analyzeCaptureSession(session, state.profile);
  const topicLines = (analysis.detectedTopics || []).map((topic) => `- ${topic.label} (${Math.round(topic.confidence * 100)}%)`).join("\n");
  const questLines = (analysis.suggestedQuests || []).map((quest) => `- ${quest.title}: ${quest.suggestedNextStep}`).join("\n");
  const itemLines = (session.items || [])
    .map((item) => `- ${item.title || item.domain || "Untitled"} | ${item.domain || "unknown"} | ${item.urlWasStored ? item.url : "URL not stored"}`)
    .join("\n");

  return `# QuestDex Session Capture

${analysis.summary}

## Topics
${topicLines || "- No topics detected"}

## Suggested Quests
${questLines || "- Add more captures before generating quests"}

## Next Action
${analysis.nextAction}

## Captured Items
${itemLines || "- No captured items"}

## Privacy
Local-only export. No cookies, tokens, browser secrets, localStorage, sessionStorage, screenshots, or passive history are included.
`;
}

function handleSessionSuggestionAction(event) {
  const button = event.target?.closest?.("[data-suggestion-action]");
  if (!button) return;
  const session = state.sessionCapture.activeSession;
  const suggestion = session?.analysis?.suggestedProfileUpdates?.find((update) => update.id === button.dataset.suggestionId);
  if (!suggestion) return;

  suggestion.status = button.dataset.suggestionAction;
  state.sessionCapture.lastAnalysis = session.analysis;
  persistSessionCapture();
  renderSessionCapturePanel();
}

function renderSessionCapturePanel() {
  if (!sessionCaptureStatus) return;
  const session = state.sessionCapture.activeSession;
  if (session) expireCaptureSessionIfNeeded(session);
  const analysis = session?.analysis || state.sessionCapture.lastAnalysis;

  renderSessionCaptureStatus(session);
  renderSessionCaptureItems(session);
  renderSessionCaptureAnalysis(analysis, session);
  const hasActive = Boolean(session && session.status === "active");
  const canPause = Boolean(session && ["active", "paused"].includes(session.status));
  startCaptureSessionButton.disabled = hasActive;
  pauseCaptureSessionButton.disabled = !canPause;
  pauseCaptureSessionButton.textContent = session?.status === "paused" ? "Resume" : "Pause";
  endCaptureSessionButton.disabled = !session || session.status === "deleted";
  captureCurrentPageButton.disabled = !hasActive;
  captureSelectedTextButton.disabled = !hasActive;
  applySessionCaptureSeedButton.disabled = !analysis;
  exportSessionCaptureJsonButton.disabled = !session;
  exportSessionCaptureMarkdownButton.disabled = !session;
}

function renderSessionCaptureStatus(session) {
  if (!session) {
    sessionCaptureStatus.textContent = "No active capture session.";
    sessionCaptureTimer.textContent = "Idle";
    hideSessionCaptureWarning();
    return;
  }
  const itemCount = session.items?.length || 0;
  const flagCount = session.privacyFlags?.length || 0;
  const label = session.status === "active" ? "Active" : session.status.charAt(0).toUpperCase() + session.status.slice(1);
  sessionCaptureStatus.textContent = `${label} session with ${itemCount} captured item${itemCount === 1 ? "" : "s"}${flagCount ? ` and ${flagCount} privacy flag${flagCount === 1 ? "" : "s"}` : ""}.`;
  sessionCaptureTimer.textContent =
    session.status === "active" ? `${minutesRemaining(session.expiresAt)} min left` : session.status;
}

function renderSessionCaptureItems(session) {
  if (!sessionCaptureItems) return;
  const items = session?.items || [];
  sessionCaptureItems.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="capture-item">
              <span>${escapeHtml(item.type.replace("_", " "))}</span>
              <strong>${escapeHtml(item.title || item.domain || "Untitled")}</strong>
              <p>${escapeHtml(item.domain || "No domain")} ${item.repeatCount > 1 ? `| repeated ${item.repeatCount}x` : ""}</p>
              <small>${escapeHtml(item.urlWasStored ? item.url : "URL not stored")}</small>
            </article>
          `,
        )
        .join("")
    : `<div class="capture-empty">No pages captured yet.</div>`;
}

function renderSessionCaptureAnalysis(analysis, session) {
  if (!sessionCaptureAnalysis) return;
  if (!analysis) {
    sessionCaptureAnalysis.hidden = true;
    sessionCaptureAnalysis.innerHTML = "";
    return;
  }

  sessionCaptureAnalysis.hidden = false;
  const topics = analysis.detectedTopics || [];
  const quests = analysis.suggestedQuests || [];
  const skills = analysis.suggestedSkillNodes || [];
  const updates = analysis.suggestedProfileUpdates || [];

  sessionCaptureAnalysis.innerHTML = `
    <div class="session-analysis-top">
      <div>
        <p class="eyebrow">Analysis</p>
        <h4>${escapeHtml(Math.round((analysis.confidence || 0.62) * 100))}% confidence route</h4>
      </div>
      <span class="source-badge">${escapeHtml(session?.status || "ready")}</span>
    </div>
    <p class="analysis-summary">${escapeHtml(analysis.summary)}</p>
    <div class="session-analysis-grid">
      <div>
        <h5>Topics</h5>
        ${renderMiniList(topics.map((topic) => `${topic.label} (${Math.round(topic.confidence * 100)}%)`))}
      </div>
      <div>
        <h5>Skill nodes</h5>
        ${renderMiniList(skills.map((skill) => skill.title))}
      </div>
      <div>
        <h5>Next action</h5>
        <p>${escapeHtml(analysis.nextAction)}</p>
      </div>
    </div>
    <div class="session-review-list">
      ${updates
        .map(
          (update) => `
            <article class="session-review-card is-${escapeHtml(update.status)}">
              <span>${escapeHtml(update.type.replace("_", " "))}</span>
              <strong>${escapeHtml(update.label)}</strong>
              <p>${escapeHtml(update.value)}</p>
              <div class="source-actions">
                <button class="secondary-button compact-button" type="button" data-suggestion-action="accepted" data-suggestion-id="${escapeHtml(update.id)}">
                  Accept
                </button>
                <button class="secondary-button compact-button" type="button" data-suggestion-action="rejected" data-suggestion-id="${escapeHtml(update.id)}">
                  Not about me
                </button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="session-analysis-quests">
      ${quests
        .map(
          (quest) => `
            <article>
              <span>${escapeHtml(quest.questType)}</span>
              <strong>${escapeHtml(quest.title)}</strong>
              <p>${escapeHtml(quest.suggestedNextStep)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderMiniList(items) {
  return `<ul>${(items.length ? items : ["No signal yet"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function showSessionCaptureWarning(message) {
  if (!sessionCaptureWarning) return;
  sessionCaptureWarning.hidden = false;
  sessionCaptureWarning.textContent = message;
}

function hideSessionCaptureWarning() {
  if (!sessionCaptureWarning) return;
  sessionCaptureWarning.hidden = true;
  sessionCaptureWarning.textContent = "";
}

function clearSessionCaptureDraft() {
  [capturePageTitleInput, capturePageUrlInput, captureSelectedTextValueInput, captureManualNoteInput].forEach((field) => {
    if (field) field.value = "";
  });
}

function persistSessionCapture() {
  localStorage.setItem(SESSION_CAPTURE_STORAGE_KEY, JSON.stringify(state.sessionCapture));
}

function restoreSessionCapture() {
  const saved = localStorage.getItem(SESSION_CAPTURE_STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    state.sessionCapture = {
      activeSession: parsed.activeSession || null,
      lastAnalysis: parsed.lastAnalysis || parsed.activeSession?.analysis || null,
    };
  } catch (error) {
    console.warn("Unable to restore session capture state", error);
  }
}

function captureItemText(item) {
  return [item.title, item.domain, item.url, item.selectedText, item.pageSummary, item.manualNote]
    .filter(Boolean)
    .join(" ");
}

function minutesRemaining(expiresAt, now = new Date()) {
  const remaining = Math.ceil((new Date(expiresAt).getTime() - new Date(now).getTime()) / 60000);
  return Math.max(0, remaining);
}

function handleIntakeSubmit(event) {
  event.preventDefault();
  generateQuestDex();
}

function handleGenerateClick(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  generateQuestDex();
}

function generateQuestDex() {
  const data = Object.fromEntries(new FormData(form).entries());
  const seed = [data.seedText || "", state.uploadedSeed || ""].filter(Boolean).join("\n\n");
  const profile = buildProfile(data, seed);
  const quests = buildQuests(profile);
  const sideQuests = buildSideQuests(profile);

  state.profile = profile;
  state.quests = quests;
  state.sideQuests = sideQuests;
  state.chat = [
    {
      role: "coach",
      content: buildCoachGreeting(profile, quests, sideQuests),
    },
  ];

  persistProfile();
  renderDashboard();
  dashboard.hidden = false;
  dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
  updateNav("dashboard");
}

function buildProfile(data, seed) {
  const priorities = Array.from(state.selectedPriorities);
  const lowerSeed = seed.toLowerCase();
  const lowerGoals = [
    data.desiredEvolution || "",
    data.blockers || "",
    data.worldLocation || "",
    data.worldIndustry || "",
    data.worldCulture || "",
    data.worldConstraints || "",
    data.worldOpportunities || "",
    data.evolutionConditions || "",
    data.partyText || "",
    data.inventoryText || "",
    data.sideQuestMode || "",
    data.travelDestination || "",
    data.travelNeedsText || "",
    data.travelWantsText || "",
    data.travelEventsSeed || "",
  ]
    .join(" ")
    .toLowerCase();
  const combined = `${lowerSeed} ${lowerGoals}`;
  const inferredPriorities = inferPriorities(combined);
  const mergedPriorities = unique([...priorities, ...inferredPriorities]).slice(0, 5);
  const buildGoals = inferBuildGoals(combined);
  const mergedBuildGoals = unique([...Array.from(state.selectedBuildGoals), ...buildGoals]).slice(0, 5);
  const archetypes = inferHumanTypes(data.lifeStage, mergedPriorities, mergedBuildGoals, combined);
  const primaryType = archetypes[0];
  const secondaryType = archetypes[1] || "Strategist";
  const blockers = extractBlockers(data.blockers, seed);
  const insights = summarizeSeed(seed, data.desiredEvolution);
  const stats = buildStats(data, combined, mergedPriorities);
  const humanStats = buildHumanStats(data, combined, mergedPriorities, mergedBuildGoals);
  const worldContext = buildWorldContext(data, seed);
  const party = buildParty(data, combined);
  const inventory = buildInventory(data, combined);
  const skillTree = buildSkillTree(archetypes, mergedPriorities, inventory, humanStats);
  const evolutionPath = buildEvolutionPath(data, archetypes, worldContext, blockers, skillTree);
  const travelContext = buildTravelContext(data);

  return {
    displayName: data.displayName?.trim() || "New trainer",
    lifeStage: data.lifeStage,
    desiredEvolution: data.desiredEvolution.trim(),
    coachTone: data.coachTone,
    priorities: mergedPriorities.length ? mergedPriorities : ["Career", "Health"],
    buildGoals: mergedBuildGoals.length ? mergedBuildGoals : ["Freedom", "Mastery"],
    archetypes,
    primaryType,
    secondaryType,
    blockers,
    insights,
    stats,
    humanStats,
    worldContext,
    party,
    inventory,
    skillTree,
    evolutionPath,
    travelContext,
    seedWordCount: countWords(seed),
    createdAt: new Date().toISOString(),
  };
}

function inferPriorities(text) {
  const checks = [
    ["Startup", ["startup", "founder", "mvp", "users", "pitch", "customer"]],
    ["Career", ["career", "job", "resume", "portfolio", "promotion", "interview"]],
    ["Study", ["study", "exam", "school", "university", "class", "learn"]],
    ["Health", ["health", "sleep", "fitness", "run", "exercise", "energy"]],
    ["Social", ["social", "friend", "relationship", "network", "outreach", "conversation"]],
    ["Money", ["money", "budget", "finance", "salary", "spend", "income"]],
    ["Creativity", ["creative", "write", "design", "art", "music", "build"]],
    ["Recovery", ["burnout", "recovery", "reset", "tired", "stress", "anxious"]],
  ];

  return checks.filter(([, keywords]) => keywords.some((word) => text.includes(word))).map(([name]) => name);
}

function inferPrimaryType(lifeStage, priorities, text) {
  if (priorities.includes("Startup") || lifeStage === "Founder") return "Venture Builder";
  if (priorities.includes("Study") || lifeStage === "Student") return "Knowledge Seeker";
  if (priorities.includes("Recovery") || lifeStage === "Recovery and reset") return "Resilient Restarter";
  if (priorities.includes("Creativity")) return "Creative Maker";
  if (text.includes("lead") || text.includes("manager")) return "Strategic Leader";
  if (priorities.includes("Health")) return "Energy Trainer";
  return "Adaptive Explorer";
}

function inferSecondaryType(text, priorities) {
  if (text.includes("avoid") || text.includes("confidence") || text.includes("outreach")) return "Courage Trainee";
  if (text.includes("inconsistent") || text.includes("habit") || text.includes("discipline")) return "Consistency Builder";
  if (priorities.includes("Social")) return "Connection Scout";
  if (priorities.includes("Money")) return "Resource Planner";
  return "Curious Strategist";
}

function inferBuildGoals(text) {
  const checks = [
    ["Wealth", ["wealth", "money", "income", "financial", "capital", "runway"]],
    ["Freedom", ["freedom", "optional", "independent", "remote", "autonomy"]],
    ["Mastery", ["mastery", "skill", "learn", "craft", "world-class"]],
    ["Power", ["power", "lead", "influence", "control", "authority"]],
    ["Love", ["love", "family", "relationship", "trust", "belong"]],
    ["Adventure", ["adventure", "travel", "explore", "novel", "unknown"]],
    ["Peace", ["peace", "calm", "rest", "stability", "recovery"]],
    ["Service", ["service", "help", "impact", "community", "care"]],
    ["Status", ["status", "reputation", "prestige", "credible", "proof"]],
    ["Creativity", ["creative", "art", "design", "taste", "write"]],
  ];

  return checks.filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword))).map(([name]) => name);
}

function inferHumanTypes(lifeStage, priorities, buildGoals, text) {
  const scores = {
    Builder: 0,
    Scholar: 0,
    Warrior: 0,
    Merchant: 0,
    Diplomat: 0,
    Artist: 0,
    Explorer: 0,
    Healer: 0,
    Strategist: 0,
    Trickster: 0,
  };

  const add = (type, amount) => {
    scores[type] += amount;
  };

  if (lifeStage === "Founder" || priorities.includes("Startup")) add("Builder", 5);
  if (lifeStage === "Student" || priorities.includes("Study")) add("Scholar", 4);
  if (lifeStage === "Recovery and reset" || priorities.includes("Recovery")) add("Healer", 4);
  if (lifeStage === "Explorer") add("Explorer", 5);
  if (buildGoals.includes("Adventure")) add("Explorer", 4);
  if (priorities.includes("Career")) add("Strategist", 2);
  if (priorities.includes("Money") || buildGoals.includes("Wealth")) add("Merchant", 4);
  if (priorities.includes("Social") || buildGoals.includes("Love")) add("Diplomat", 4);
  if (priorities.includes("Health")) add("Warrior", 3);
  if (priorities.includes("Creativity") || buildGoals.includes("Creativity")) add("Artist", 4);
  if (buildGoals.includes("Mastery")) add("Scholar", 2);
  if (buildGoals.includes("Power") || buildGoals.includes("Status")) add("Strategist", 3);
  if (buildGoals.includes("Service") || buildGoals.includes("Peace")) add("Healer", 2);

  if (text.includes("hack") || text.includes("shortcut") || text.includes("exploit")) add("Trickster", 4);
  if (text.includes("system") || text.includes("product") || text.includes("build")) add("Builder", 3);
  if (text.includes("research") || text.includes("analy")) add("Scholar", 3);
  if (text.includes("sales") || text.includes("customer")) add("Merchant", 2);
  if (text.includes("mentor") || text.includes("community")) add("Diplomat", 2);
  if (text.includes("crisis") || text.includes("protect")) add("Warrior", 2);
  if (text.includes("travel") || text.includes("explore") || text.includes("unknown")) add("Explorer", 2);

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .map(([type]) => type)
    .slice(0, 2)
    .concat(["Strategist"])
    .slice(0, 2);
}

function buildStats(data, text, priorities) {
  const raw = {
    Energy: Number(data.energy || 50),
    Focus: Number(data.focus || 50),
    Confidence: Number(data.confidence || 50),
    Consistency: Number(data.consistency || 50),
    Creativity: 52,
    Social: 48,
  };

  if (priorities.includes("Creativity")) raw.Creativity += 12;
  if (priorities.includes("Social") || text.includes("outreach")) raw.Social += 10;
  if (priorities.includes("Startup")) raw.Confidence += 5;
  if (text.includes("sleep") || text.includes("tired") || text.includes("burnout")) raw.Energy -= 8;
  if (text.includes("overplan") || text.includes("procrast")) raw.Consistency -= 6;
  if (text.includes("confident") || text.includes("confidence")) raw.Confidence -= 3;

  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, clamp(Math.round(value), 5, 96)]),
  );
}

function buildHumanStats(data, text, priorities, buildGoals) {
  const energy = Number(data.energy || 50);
  const focus = Number(data.focus || 50);
  const confidence = Number(data.confidence || 50);
  const consistency = Number(data.consistency || 50);
  const raw = {
    Strength: Math.round((energy + consistency) / 2),
    Intelligence: focus + (priorities.includes("Study") ? 8 : 0),
    Charisma: confidence + (priorities.includes("Social") ? 8 : 0),
    Wisdom: Math.round((focus + consistency) / 2),
    Dexterity: Math.round((focus + energy) / 2),
    Constitution: Math.round((energy + consistency) / 2),
    Luck: 45,
    Reputation: 42 + (buildGoals.includes("Status") ? 10 : 0),
    Resources: 42 + (priorities.includes("Money") || buildGoals.includes("Wealth") ? 10 : 0),
  };

  if (text.includes("network") || text.includes("mentor")) raw.Luck += 8;
  if (text.includes("capital") || text.includes("runway") || text.includes("savings")) raw.Resources += 8;
  if (text.includes("credential") || text.includes("github") || text.includes("portfolio")) raw.Reputation += 8;
  if (text.includes("sleep") || text.includes("tired") || text.includes("burnout")) raw.Constitution -= 7;
  if (text.includes("uncertain") || text.includes("visa") || text.includes("debt")) raw.Luck -= 5;
  if (priorities.includes("Startup")) {
    raw.Dexterity += 6;
    raw.Reputation += 4;
  }
  if (buildGoals.includes("Peace")) raw.Wisdom += 5;
  if (buildGoals.includes("Adventure")) raw.Luck += 5;

  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, clamp(Math.round(value), 5, 96)]),
  );
}

function buildWorldContext(data, seed) {
  const source = `${data.worldConstraints || ""}\n${data.worldOpportunities || ""}\n${seed || ""}`;
  return {
    location: data.worldLocation?.trim() || "Unmapped arena",
    industry: data.worldIndustry?.trim() || "Open-world / cross-domain",
    culture: data.worldCulture?.trim() || "Rules still being discovered",
    constraints: uniqueTextItems(parseListLike(data.worldConstraints || "").concat(extractWorldSignals(source, "constraint"))).slice(0, 5),
    opportunities: uniqueTextItems(parseListLike(data.worldOpportunities || "").concat(extractWorldSignals(source, "opportunity"))).slice(0, 5),
  };
}

function extractWorldSignals(text, mode) {
  const lower = text.toLowerCase();
  const constraints = [
    ["Low energy", ["tired", "sleep", "burnout", "fatigue"]],
    ["Time pressure", ["deadline", "demo", "due", "weekend"]],
    ["Resource constraint", ["limited money", "budget", "debt", "runway"]],
    ["Network gap", ["weak network", "no mentor", "alone"]],
  ];
  const opportunities = [
    ["Mentor access", ["mentor", "advisor", "teacher"]],
    ["Public proof", ["github", "portfolio", "demo", "public"]],
    ["User signal", ["customer", "user", "interview"]],
    ["Tool leverage", ["ai", "software", "automation", "tool"]],
  ];
  const table = mode === "constraint" ? constraints : opportunities;

  return table.filter(([, keywords]) => keywords.some((keyword) => lower.includes(keyword))).map(([label]) => label);
}

function buildParty(data, text) {
  const parsed = parseListLike(data.partyText || "");
  if (parsed.length) return parsed.slice(0, 6);

  const defaults = ["Future mentor", "Peer ally", "Friendly rival"];
  if (text.includes("customer") || text.includes("user")) defaults.push("Target users");
  if (text.includes("family")) defaults.push("Family system");
  return defaults.slice(0, 6);
}

function buildInventory(data, text) {
  const parsed = parseListLike(data.inventoryText || "");
  if (parsed.length) return parsed.slice(0, 6);

  const defaults = ["Current skills", "Personal device", "Time blocks"];
  if (text.includes("github")) defaults.push("GitHub proof");
  if (text.includes("portfolio")) defaults.push("Portfolio");
  if (text.includes("capital") || text.includes("savings")) defaults.push("Runway");
  return defaults.slice(0, 6);
}

function buildSkillTree(archetypes, priorities, inventory, humanStats) {
  const skills = [];
  const addSkill = (name, branch, status, linkedStats) => skills.push({ name, branch, status, linkedStats });

  archetypes.forEach((type) => {
    if (type === "Builder") addSkill("Ship small systems", "Builder", "active", ["Dexterity", "Reputation"]);
    if (type === "Scholar") addSkill("Explain from first principles", "Scholar", "active", ["Intelligence", "Wisdom"]);
    if (type === "Warrior") addSkill("Train the body under stress", "Warrior", "active", ["Strength", "Constitution"]);
    if (type === "Merchant") addSkill("Make clean offers", "Merchant", "active", ["Charisma", "Resources"]);
    if (type === "Diplomat") addSkill("Build trust loops", "Diplomat", "active", ["Charisma", "Reputation"]);
    if (type === "Artist") addSkill("Turn taste into artifacts", "Artist", "active", ["Wisdom", "Reputation"]);
    if (type === "Explorer") addSkill("Map unknown terrain", "Explorer", "active", ["Luck", "Dexterity"]);
    if (type === "Healer") addSkill("Stabilize the system", "Healer", "active", ["Wisdom", "Constitution"]);
    if (type === "Strategist") addSkill("Choose the right game", "Strategist", "active", ["Wisdom", "Intelligence"]);
    if (type === "Trickster") addSkill("Find non-obvious routes", "Trickster", "active", ["Dexterity", "Luck"]);
  });

  if (priorities.includes("Startup")) addSkill("Validate with users", "Quest-critical", "unlocking", ["Charisma", "Reputation"]);
  if (priorities.includes("Health")) addSkill("Energy floor", "Foundation", "active", ["Strength", "Constitution"]);
  if (inventory.length >= 4) addSkill("Use inventory deliberately", "Loadout", "available", ["Wisdom", "Resources"]);
  if (humanStats.Resources < 45) addSkill("Resource buffer", "Survival", "locked", ["Resources", "Wisdom"]);

  return uniqueBySkill(skills).slice(0, 6);
}

function buildEvolutionPath(data, archetypes, worldContext, blockers, skillTree) {
  const conditions = parseListLike(data.evolutionConditions || "");
  const primary = archetypes[0] || "Explorer";
  const nextForm = inferNextEvolution(primary, data.desiredEvolution || "");
  const triggers = unique([
    ...conditions,
    ...blockers.map((blocker) => `Reduce ${blocker.toLowerCase()}`),
    worldContext.opportunities[0] ? `Use ${worldContext.opportunities[0].toLowerCase()}` : "",
    skillTree[0] ? `Practice ${skillTree[0].name.toLowerCase()}` : "",
  ]).slice(0, 5);

  return [
    {
      stage: "Current form",
      title: `${primary}-${archetypes[1] || "Strategist"}`,
      condition: "Mapped from current survey signals.",
    },
    {
      stage: "Evolution target",
      title: nextForm,
      condition: triggers.join("; ") || "Complete three quests and reflect on the pattern.",
    },
  ];
}

function inferNextEvolution(primary, desiredEvolution) {
  const lower = desiredEvolution.toLowerCase();
  if (lower.includes("founder") || lower.includes("ship") || primary === "Builder") return "Systems Founder";
  if (lower.includes("confident") || lower.includes("social") || primary === "Diplomat") return "Trusted Connector";
  if (lower.includes("travel") || lower.includes("discover") || primary === "Explorer") return "World Mapper";
  if (lower.includes("peace") || lower.includes("heal") || primary === "Healer") return "Stable Guide";
  if (lower.includes("master") || primary === "Scholar") return "Domain Adept";
  return `${primary} Ascendant`;
}

function buildTravelContext(data) {
  const destination = data.travelDestination?.trim() || "";
  const needsText = data.travelNeedsText?.trim() || "";
  const wantsText = data.travelWantsText?.trim() || "";
  const eventsSeed = data.travelEventsSeed?.trim() || "";
  const hasSideQuestClues = Boolean(destination || needsText || wantsText || eventsSeed);
  const sideQuestMode = data.sideQuestMode ? normalizeSideQuestMode(data.sideQuestMode) : hasSideQuestClues ? "Travel" : "Off";
  const combined = `${sideQuestMode} ${destination} ${needsText} ${wantsText} ${eventsSeed}`.toLowerCase();
  const inferredNeeds = inferTravelNeeds(combined);
  const selectedNeeds = Array.from(state.selectedTravelNeeds);
  const active = sideQuestMode !== "Off" && Boolean(destination || needsText || wantsText || eventsSeed || selectedNeeds.length);

  return {
    sideQuestMode,
    destination,
    focus: destination,
    mode: data.travelMode || "On the ground today",
    whimsy: Number(data.whimsy || 50),
    needs: unique([...selectedNeeds, ...inferredNeeds]).slice(0, 6),
    needsText,
    wantsText,
    eventsSeed,
    active,
  };
}

function inferTravelNeeds(text) {
  const checks = [
    ["Food", ["food", "meal", "restaurant", "vegetarian", "vegan", "breakfast", "coffee"]],
    ["Culture", ["museum", "history", "temple", "architecture", "gallery", "heritage"]],
    ["Nature", ["park", "hike", "waterfront", "beach", "garden", "nature", "view"]],
    ["Events", ["event", "festival", "concert", "market", "show", "meetup", "today"]],
    ["Quiet", ["quiet", "calm", "rest", "low noise", "recover", "slow"]],
    ["Social", ["meet", "friend", "local", "community", "social", "conversation"]],
    ["Budget", ["cheap", "budget", "free", "affordable", "save"]],
    ["Accessibility", ["accessible", "wheelchair", "stairs", "mobility", "restroom", "walking"]],
    ["Proof", ["proof", "demo", "ship", "commit", "readme", "artifact", "launch"]],
    ["Learning", ["learn", "study", "docs", "course", "skill", "practice"]],
    ["Outreach", ["outreach", "message", "user", "mentor", "customer", "feedback"]],
    ["Recovery", ["recover", "rest", "sleep", "energy", "burnout", "reset"]],
    ["Admin", ["admin", "paperwork", "forms", "email", "calendar", "logistics"]],
    ["Creative", ["creative", "write", "design", "story", "music", "art", "draft"]],
  ];

  return checks.filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword))).map(([name]) => name);
}

function extractBlockers(blockersText, seed) {
  const source = `${blockersText || ""}\n${seed || ""}`;
  const signals = [
    ["Overplanning", ["overplan", "planning too much", "analysis"]],
    ["Avoiding outreach", ["avoid outreach", "sales call", "network", "message"]],
    ["Low energy", ["tired", "burnout", "sleep", "fatigue"]],
    ["Procrastination", ["procrast", "delay", "avoid"]],
    ["Unclear priorities", ["unclear", "too many", "scattered"]],
    ["Inconsistent rhythm", ["inconsistent", "momentum", "habit"]],
  ];

  const lower = source.toLowerCase();
  const found = signals
    .filter(([, keywords]) => keywords.some((keyword) => lower.includes(keyword)))
    .map(([label]) => label);

  return found.length ? unique(found).slice(0, 4) : ["Needs clearer next actions"];
}

function summarizeSeed(seed, desiredEvolution = "") {
  if (!seed.trim()) {
    return [
      "No seed data added yet, so the coach is relying on survey answers.",
      "Upload notes, goals, tasks, or journal snippets to make future recommendations more specific.",
    ];
  }

  const text = seed.toLowerCase();
  const insights = [];
  const wordCount = countWords(seed);

  insights.push(`Seed memory contains about ${wordCount} words of context.`);

  if (text.includes("deadline") || text.includes("demo") || text.includes("due")) {
    insights.push("Time pressure is present, so quests should bias toward demo-ready progress.");
  }
  if (text.includes("sleep") || text.includes("tired") || text.includes("energy")) {
    insights.push("Energy management appears important; the coach should include recovery-aware routes.");
  }
  if (text.includes("user") || text.includes("customer") || text.includes("outreach")) {
    insights.push("User contact shows up in the seed, so social proof and outreach quests matter.");
  }
  if (text.includes("habit") || text.includes("consistent") || text.includes("momentum")) {
    insights.push("Consistency is a training theme; smaller repeatable quests should beat giant plans.");
  }
  if (desiredEvolution && desiredEvolution.length > 30) {
    insights.push("The desired evolution is specific enough to generate targeted training moves.");
  }

  return unique(insights).slice(0, 5);
}

function buildQuests(profile) {
  const picked = [];

  profile.priorities.forEach((priority) => {
    const bank = questBank[priority];
    if (!bank) return;
    picked.push(bank[Math.floor(Math.random() * bank.length)]);
  });

  if (profile.stats.Energy < 45) picked.unshift(questBank.Health[0]);
  if (profile.blockers.includes("Avoiding outreach")) picked.unshift(questBank.Social[0]);
  if (profile.blockers.includes("Overplanning")) picked.unshift(questBank.Startup[1]);

  return uniqueByTitle([...picked, ...fallbackQuests]).slice(0, 4);
}

function buildSideQuests(profile) {
  const travel = profile.travelContext || {};
  if (!travel.active || travel.sideQuestMode === "Off") return [];

  if (travel.sideQuestMode && travel.sideQuestMode !== "Travel") {
    return buildGeneralSideQuests(travel);
  }

  const destination = travel.destination || "your destination";
  const picked = [];

  (travel.needs || []).forEach((need) => {
    const template = travelQuestTemplates[need];
    if (!template) return;
    picked.push({
      ...template,
      body: localizeTravelQuest(template.body, destination, travel),
    });
  });

  if (travel.eventsSeed) {
    picked.unshift({
      type: "Today",
      title: "Event drift",
      body: `Use the pasted local clues for ${destination}. Pick one event with the easiest exit plan, then add a nearby food or rest stop.`,
      reward: "+4 Serendipity, +2 Safety",
    });
  }

  if (travel.wantsText) {
    picked.unshift({
      type: "Want",
      title: "Curiosity match",
      body: `Turn "${shorten(travel.wantsText, 80)}" into one concrete stop in ${destination}, then pair it with something nearby and low-effort.`,
      reward: "+3 Joy, +2 Discovery",
    });
  }

  if (travel.whimsy >= 70) {
    picked.push({
      type: "Whimsy",
      title: "Coin-flip fork",
      body: `In ${destination}, choose between two safe nearby options with a coin flip. The quest is to practice pleasant uncertainty.`,
      reward: "+5 Serendipity",
    });
  } else if (travel.whimsy <= 35) {
    picked.push({
      type: "Need",
      title: "Low-variance route",
      body: `For ${destination}, keep the route predictable: one main stop, one meal, one backup, and one direct way home.`,
      reward: "+3 Safety, +2 Energy",
    });
  }

  return uniqueByTitle([...picked, ...fallbackSideQuests]).slice(0, 5);
}

function buildGeneralSideQuests(sideQuestContext = {}) {
  const mode = normalizeSideQuestMode(sideQuestContext.sideQuestMode || "Project");
  const focus = sideQuestContext.focus || sideQuestContext.destination || mode.toLowerCase();
  const templates = sideQuestModeTemplates[mode] || sideQuestModeTemplates.Project;
  const picked = templates.map((template) => ({
    ...template,
    body: template.body.replace("{focus}", focus),
  }));

  if (sideQuestContext.needsText) {
    picked.unshift({
      type: "Need",
      title: "Constraint-aware route",
      body: `For ${focus}, account for "${shorten(sideQuestContext.needsText, 90)}" before choosing the side quest.`,
      reward: "+3 Safety, +2 Focus",
    });
  }

  if (sideQuestContext.wantsText) {
    picked.unshift({
      type: "Want",
      title: "Value match",
      body: `Make the side quest worthwhile by aiming at "${shorten(sideQuestContext.wantsText, 90)}" in ${focus}.`,
      reward: "+3 Motivation",
    });
  }

  if (sideQuestContext.eventsSeed) {
    picked.unshift({
      type: "Live",
      title: "Context hook",
      body: `Use this live clue for ${focus}: "${shorten(sideQuestContext.eventsSeed, 110)}" Turn it into one next action.`,
      reward: "+3 Serendipity, +2 Clarity",
    });
  }

  if (sideQuestContext.whimsy >= 70) {
    picked.push({
      type: "Experiment",
      title: "Delight fork",
      body: `Try one tasteful, low-risk variant of ${focus} that could create a better story or useful surprise.`,
      reward: "+4 Luck",
    });
  } else if (sideQuestContext.whimsy <= 35) {
    picked.push({
      type: "Stable",
      title: "Low-variance rep",
      body: `Keep ${focus} boring on purpose: one clear action, one finish line, one note about what changed.`,
      reward: "+3 Consistency",
    });
  }

  return uniqueByTitle(picked).slice(0, 5);
}

function localizeTravelQuest(body, destination, travel) {
  const target = destination === "your destination" ? "the destination" : destination;
  const modeHint = travel.mode === "Planning a future trip" ? " during planning" : "";
  return `${body} Apply it to ${target}${modeHint}.`;
}

function buildCoachGreeting(profile, quests, sideQuests = []) {
  const firstQuest = quests[0];
  const firstSideQuest = sideQuests[0];
  const archetypes = profile.archetypes?.join("-") || `${profile.primaryType}-${profile.secondaryType}`;
  return [
    `${profile.displayName}, your current build is ${archetypes}.`,
    profile.worldContext?.location ? `Current map: ${profile.worldContext.location}.` : "",
    `Your best opening move is "${firstQuest.title}."`,
    firstSideQuest ? `Your side-quest radar is also tracking "${firstSideQuest.title}."` : "",
    profile.stats.Energy < 45
      ? "Your energy stat is low, so the route should be short and stabilizing before it gets ambitious."
      : "Your route can start with action first and reflection second.",
  ].join(" ");
}

function handleCoachSubmit(event) {
  event.preventDefault();
  const prompt = coachPrompt.value.trim();
  if (!prompt || !state.profile) return;

  state.chat.push({ role: "user", content: prompt });
  state.chat.push({
    role: "coach",
    content: buildCoachReply(prompt, state.profile, state.quests, state.sideQuests),
  });
  coachPrompt.value = "";
  persistProfile();
  renderCoachFeed();
}

function buildCoachReply(prompt, profile, quests, sideQuests = []) {
  const lower = prompt.toLowerCase();
  const tone = profile.coachTone;
  const quest = quests[0] || fallbackQuests[0];
  const sideQuest = sideQuests[0] || fallbackSideQuests[0];
  const travel = profile.travelContext || {};
  const weakStat = Object.entries(profile.stats).sort((a, b) => a[1] - b[1])[0][0];

  if (lower.includes("build") || lower.includes("type") || lower.includes("archetype")) {
    return coachToneWrap(
      tone,
      `Your current build reads as ${(profile.archetypes || [profile.primaryType, profile.secondaryType]).join("-")}. The useful question is not whether that label is permanent, but what world and quest conditions let it evolve.`,
    );
  }

  if (lower.includes("world") || lower.includes("map") || lower.includes("environment")) {
    return coachToneWrap(
      tone,
      `Your current map is ${profile.worldContext?.location || "partly unmapped"}. Watch the terrain: constraints are ${(profile.worldContext?.constraints || []).join(", ") || "still unclear"}; opportunities are ${(profile.worldContext?.opportunities || []).join(", ") || "still emerging"}.`,
    );
  }

  if (
    lower.includes("travel") ||
    lower.includes("country") ||
    lower.includes("trip") ||
    lower.includes("side quest") ||
    lower.includes("event")
  ) {
    const destination = travel.destination || "the place you are visiting";
    return coachToneWrap(
      tone,
      `For ${destination}, run the side-quest lens: cover one need, one want, and one serendipity slot. Start with "${sideQuest.title}": ${sideQuest.body}`,
    );
  }

  if (lower.includes("stuck") || lower.includes("procrast") || lower.includes("avoid")) {
    return coachToneWrap(
      tone,
      `Use the anti-stall route: 1. Name the task in one sentence. 2. Do the first visible action for 10 minutes. 3. Stop or continue, but record the result. This trains ${weakStat} without asking for a heroic mood.`,
    );
  }

  if (lower.includes("20") || lower.includes("ten") || lower.includes("minute") || lower.includes("quick")) {
    return coachToneWrap(
      tone,
      `Take a short quest: ${quest.title}. Keep it to 20 minutes, then log one sentence about what changed. Reward target: ${quest.reward}.`,
    );
  }

  if (lower.includes("plan") || lower.includes("today")) {
    return coachToneWrap(
      tone,
      `Today's route: first, ${quests[0]?.title || "Starter move"}. Second, one recovery action. Third, one social or proof-of-work action tied to ${profile.priorities[0]}. Keep the day winnable.`,
    );
  }

  if (lower.includes("data") || lower.includes("remember") || lower.includes("seed")) {
    return coachToneWrap(
      tone,
      `I have ${profile.seedWordCount} words of seed context right now. The strongest signals are: ${profile.insights.join(" ")}`,
    );
  }

  return coachToneWrap(
    tone,
    `I would train ${weakStat} next. Choose one quest, make it smaller than feels impressive, and complete it before adding a second objective. Recommended move: ${quest.title}.`,
  );
}

function coachToneWrap(tone, message) {
  if (tone === "Gentle and reflective") {
    return `${message} Keep the promise small enough that your nervous system believes you.`;
  }
  if (tone === "Tactical and concise") {
    return `${message} Action, timer, log.`;
  }
  if (tone === "Playful and game-like") {
    return `${message} Treat this as a training rep, not a final exam.`;
  }
  return message;
}

function buildDailyNudge(profile, quests = [], sideQuests = [], config = {}, date = new Date()) {
  const nudgeConfig = { ...defaultNudgeConfig, ...config };
  const stats = profile.humanStats || profile.stats || {};
  const weakStat = Object.entries(stats).sort((a, b) => a[1] - b[1])[0]?.[0] || "Focus";
  const leadQuest = quests[0] || fallbackQuests[0];
  const sideQuest = sideQuests[0] || null;
  const recoveryMove =
    Number(stats.Constitution || stats.Energy || 50) < 50
      ? "Do one stabilizer before ambition: water, food, short walk, shower, or sleep plan."
      : "Protect one clear recovery block so the build stays usable tomorrow.";
  const proofMove = profile.priorities?.includes("Startup")
    ? "Create one small public proof or ask one user a concrete question."
    : `Spend one tiny rep on ${profile.priorities?.[0] || "your main quest"} and log what changed.`;
  const todos = uniqueByTitle([
    {
      type: "Main",
      title: leadQuest.title,
      body: leadQuest.body,
      reward: leadQuest.reward,
    },
    {
      type: "Stabilize",
      title: `${weakStat} floor`,
      body: recoveryMove,
      reward: "+2 Stability",
    },
    {
      type: "Proof",
      title: "One visible rep",
      body: proofMove,
      reward: "+3 Reputation",
    },
    sideQuest
      ? {
          type: "Side",
          title: sideQuest.title,
          body: sideQuest.body,
          reward: sideQuest.reward,
        }
      : null,
  ]).slice(0, 4);
  const dateLabel = date.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return {
    date: toDateKey(date),
    dateLabel,
    time: nudgeConfig.time,
    tone: nudgeConfig.tone,
    title: `${profile.displayName}, today's QuestDex route`,
    summary: buildNudgeSummary(profile, todos, nudgeConfig),
    todos,
    profileSummary: `${profile.archetypes?.join("-") || profile.primaryType} optimizing for ${(profile.buildGoals || []).join(", ")}`,
  };
}

function buildNudgeSummary(profile, todos, config) {
  const lead = todos[0]?.title || "Starter move";
  if (config.tone === "Gentle and reflective") {
    return `A small route is enough today: ${lead}, one stabilizer, then stop before the day becomes shapeless.`;
  }
  if (config.tone === "Tactical and concise") {
    return `${lead}. Stabilize. Log one result. No heroic side missions until that is done.`;
  }
  if (config.tone === "Playful and game-like") {
    return `Daily quest spawned for ${profile.archetypes?.[0] || profile.primaryType}: clear ${lead}, collect the reward, protect the save point.`;
  }
  return `Start with ${lead}. Keep the list short enough that it can actually survive contact with the day.`;
}

function buildNudgeChannelPayload(nudge, channel = "browser") {
  const todoText = nudge.todos
    .map((todo, index) => `${index + 1}. [${todo.type}] ${todo.title}: ${todo.body}`)
    .join("\n");

  if (channel === "chatgpt") {
    return `Create a recurring daily ChatGPT Task at ${nudge.time} called "QuestDex daily route". Send me this kind of nudge each day:\n\n${nudge.title}\n${nudge.summary}\n\nProfile: ${nudge.profileSummary}\nToday's TODO:\n${todoText}\n\nKeep it warm, concise, and a little persistent without guilt.`;
  }

  if (channel === "telegram") {
    return `${nudge.title}\n${nudge.summary}\n\n${todoText}\n\nReply done, stuck, or reroll.`;
  }

  if (channel === "notion") {
    return buildNotionDiaryPayload(nudge);
  }

  return `${nudge.title}: ${nudge.summary}`;
}

function buildNotionDiaryPayload(nudge) {
  const checkboxTodos = nudge.todos
    .map((todo) => `- [ ] ${todo.type}: ${todo.title}\n  ${todo.body}`)
    .join("\n");

  return `# ${nudge.title}

Date: ${nudge.dateLabel}
Time: ${nudge.time}
Profile: ${nudge.profileSummary}

## Daily TODO
${checkboxTodos}

## Diary Log
- Started:
- Progress:
- Blocked by:
- Finished:

## Reflection
- What gave energy?
- What drained energy?
- What should tomorrow's route remember?
`;
}

function refreshDailyNudge() {
  updateNudgeConfigFromControls();
  renderDailyNudge();
  setNudgeStatus("Daily TODO refreshed from the current profile and quest board.");
}

async function enableBrowserNudge() {
  updateNudgeConfigFromControls(false);

  if (typeof Notification === "undefined") {
    setNudgeStatus("This browser does not support local notifications. Use ChatGPT Task or Telegram payload instead.", true);
    return;
  }

  const permission =
    Notification.permission === "granted" ? "granted" : await Notification.requestPermission();

  if (permission !== "granted") {
    setNudgeStatus("Browser notifications were not enabled. No worries; copy the ChatGPT Task or Telegram payload instead.", true);
    return;
  }

  state.nudgeConfig.enabled = true;
  state.nudgeConfig.channel = "browser";
  persistProfile();
  hydrateNudgeControls();
  renderDailyNudge();
}

async function copyChatGptTaskPrompt() {
  updateNudgeConfigFromControls(false);
  state.nudgeConfig.channel = "chatgpt";
  hydrateNudgeControls();
  const nudge = buildDailyNudge(state.profile, state.quests, state.sideQuests, state.nudgeConfig);
  await copyNudgePayload(buildNudgeChannelPayload(nudge, "chatgpt"), "ChatGPT Task prompt copied.");
}

async function copyTelegramNudgePayload() {
  updateNudgeConfigFromControls(false);
  state.nudgeConfig.channel = "telegram";
  hydrateNudgeControls();
  const nudge = buildDailyNudge(state.profile, state.quests, state.sideQuests, state.nudgeConfig);
  await copyNudgePayload(buildNudgeChannelPayload(nudge, "telegram"), "Telegram nudge payload copied.");
}

async function copyNotionNudgePayload() {
  updateNudgeConfigFromControls(false);
  state.nudgeConfig.channel = "notion";
  hydrateNudgeControls();
  const nudge = buildDailyNudge(state.profile, state.quests, state.sideQuests, state.nudgeConfig);
  await copyNudgePayload(
    buildNudgeChannelPayload(nudge, "notion"),
    "Notion diary copied. Paste it into a Notion page for checkboxes and progress notes.",
  );
}

async function copyNudgePayload(payload, successMessage) {
  nudgePayloadPreview.hidden = false;
  nudgePayloadPreview.textContent = payload;

  try {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      throw new Error("Clipboard is not available in this browser.");
    }
    await navigator.clipboard.writeText(payload);
    setNudgeStatus(successMessage);
  } catch (error) {
    setNudgeStatus("Payload preview is ready. Copy it from the box below.", true);
  }
}

function updateNudgeConfigFromControls(shouldPersist = true) {
  state.nudgeConfig = {
    ...state.nudgeConfig,
    time: normalizeNudgeTime(nudgeTimeInput.value),
    tone: nudgeToneSelect.value || defaultNudgeConfig.tone,
    channel: nudgeChannelSelect.value || defaultNudgeConfig.channel,
  };

  if (shouldPersist) {
    persistProfile();
    renderDailyNudge();
  }
}

function hydrateNudgeControls() {
  const config = { ...defaultNudgeConfig, ...state.nudgeConfig };
  nudgeTimeInput.value = normalizeNudgeTime(config.time);
  nudgeToneSelect.value = config.tone;
  nudgeChannelSelect.value = config.channel;
}

function startNudgeTimer() {
  if (typeof window === "undefined" || !window.setInterval) return;
  window.setInterval(checkDailyNudgeDue, NUDGE_CHECK_INTERVAL_MS);
}

function checkDailyNudgeDue(now = new Date()) {
  if (!state.profile || !state.nudgeConfig.enabled || state.nudgeConfig.channel !== "browser") return false;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  if (!isNudgeDue(now, state.nudgeConfig)) return false;

  const nudge = buildDailyNudge(state.profile, state.quests, state.sideQuests, state.nudgeConfig, now);
  new Notification("QuestDex daily route", {
    body: buildNudgeChannelPayload(nudge, "browser"),
    tag: `questdex-${nudge.date}`,
  });
  state.nudgeConfig.lastSentDate = nudge.date;
  persistProfile();
  renderDailyNudge();
  return true;
}

function isNudgeDue(now, config) {
  const dateKey = toDateKey(now);
  if (config.lastSentDate === dateKey) return false;
  return minutesSinceMidnight(now) >= timeToMinutes(normalizeNudgeTime(config.time));
}

function setNudgeStatus(message, isError = false) {
  if (!nudgeStatus) return;
  nudgeStatus.textContent = message;
  nudgeStatus.classList.toggle("is-error", isError);
}

function rerollQuests() {
  if (!state.profile) return;
  state.quests = buildQuests(state.profile);
  state.chat.push({
    role: "coach",
    content: `Quest board refreshed. New lead quest: ${state.quests[0].title}.`,
  });
  persistProfile();
  renderDashboard();
}

function rerollSideQuests() {
  if (!state.profile) return;
  state.sideQuests = buildSideQuests(state.profile);
  state.chat.push({
    role: "coach",
    content: `Side-quest radar refreshed. New travel lead: ${state.sideQuests[0].title}.`,
  });
  persistProfile();
  renderDashboard();
}

function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
  state.profile = null;
  state.quests = [];
  state.sideQuests = [];
  state.chat = [];
  setSoulStatus("Local profile reset.");
  dashboard.hidden = true;
  updateNav("intake");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildSoulCapsule(exportedAt = new Date().toISOString()) {
  return {
    schemaVersion: SOUL_CAPSULE_VERSION,
    app: "QuestDex Coach",
    exportedAt,
    profile: state.profile,
    quests: state.quests,
    sideQuests: state.sideQuests,
    chat: state.chat,
    priorities: Array.from(state.selectedPriorities),
    buildGoals: Array.from(state.selectedBuildGoals),
    travelNeeds: Array.from(state.selectedTravelNeeds),
    nudgeConfig: state.nudgeConfig,
  };
}

function validateEncryptedSoulCapsule(encryptedCapsule) {
  if (!encryptedCapsule || typeof encryptedCapsule !== "object") {
    throw new Error("Encrypted capsule must be a JSON object.");
  }
  if (encryptedCapsule.app !== "QuestDex Coach" || encryptedCapsule.type !== "EncryptedSoulCapsule") {
    throw new Error("File is not a QuestDex encrypted Soul Capsule.");
  }
  if (!encryptedCapsule.ciphertext || !encryptedCapsule.iv || !encryptedCapsule.kdf?.salt) {
    throw new Error("Encrypted capsule is missing required crypto fields.");
  }

  return true;
}

function validateSoulCapsule(capsule) {
  if (!capsule || typeof capsule !== "object") {
    throw new Error("Capsule must be a JSON object.");
  }
  if (capsule.app !== "QuestDex Coach") {
    throw new Error("Capsule was not created by QuestDex Coach.");
  }
  if (!capsule.profile || typeof capsule.profile !== "object") {
    throw new Error("Capsule is missing a profile.");
  }
  if (!capsule.profile.displayName || !capsule.profile.desiredEvolution) {
    throw new Error("Capsule profile is incomplete.");
  }

  return true;
}

async function encryptSoulCapsule(capsule, passphrase, options = {}) {
  validateSoulCapsule(capsule);
  assertUsablePassphrase(passphrase);

  const createdAt = options.createdAt || new Date().toISOString();
  const salt = options.saltBase64 ? base64ToBytes(options.saltBase64) : randomBytes(16);
  const iv = options.ivBase64 ? base64ToBytes(options.ivBase64) : randomBytes(12);
  const key = await deriveSoulKey(passphrase, salt);
  const serialized = canonicalStringify(capsule);
  const ciphertextBuffer = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(serialized),
  );
  const ciphertext = bytesToBase64(new Uint8Array(ciphertextBuffer));
  const saltBase64 = bytesToBase64(salt);
  const ivBase64 = bytesToBase64(iv);
  const ciphertextSha256 = await sha256Hex(ciphertext);
  const commitment = await sha256Hex(`${saltBase64}.${ivBase64}.${ciphertextSha256}`);

  return {
    schemaVersion: ENCRYPTED_SOUL_VERSION,
    app: "QuestDex Coach",
    type: "EncryptedSoulCapsule",
    createdAt,
    algorithm: "AES-GCM",
    kdf: {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: SOUL_KDF_ITERATIONS,
      salt: saltBase64,
    },
    iv: ivBase64,
    ciphertext,
    ciphertextSha256,
    commitment,
    recoveryHint: options.recoveryHint || "",
  };
}

async function decryptSoulCapsule(encryptedCapsule, passphrase) {
  validateEncryptedSoulCapsule(encryptedCapsule);
  assertUsablePassphrase(passphrase);

  const salt = base64ToBytes(encryptedCapsule.kdf.salt);
  const iv = base64ToBytes(encryptedCapsule.iv);
  const key = await deriveSoulKey(passphrase, salt);
  const plaintextBuffer = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    base64ToBytes(encryptedCapsule.ciphertext),
  );
  const capsule = JSON.parse(new TextDecoder().decode(plaintextBuffer));

  validateSoulCapsule(capsule);
  return capsule;
}

async function buildSoulAnchorRecord(encryptedCapsule, options = {}) {
  validateEncryptedSoulCapsule(encryptedCapsule);

  const storagePointer = options.storagePointer || "user-held encrypted capsule";
  const createdAt = options.createdAt || new Date().toISOString();
  const anchorPayload = {
    commitment: encryptedCapsule.commitment,
    ciphertextSha256: encryptedCapsule.ciphertextSha256,
    storagePointer,
    schemaVersion: encryptedCapsule.schemaVersion,
  };

  return {
    schemaVersion: SOUL_ANCHOR_VERSION,
    app: "QuestDex Coach",
    type: "SoulAnchor",
    network: options.network || "mock-chain",
    createdAt,
    storagePointer,
    encryptedCapsuleSha256: encryptedCapsule.ciphertextSha256,
    commitment: encryptedCapsule.commitment,
    anchorHash: await sha256Hex(canonicalStringify(anchorPayload)),
    note: "Safe to publish: contains no raw Soul data and no decryption key.",
  };
}

function applySoulCapsule(capsule) {
  validateSoulCapsule(capsule);

  state.profile = ensureRpgProfileFields(capsule.profile);
  state.quests = capsule.quests?.length ? capsule.quests : buildQuests(state.profile);
  state.sideQuests = capsule.sideQuests?.length ? capsule.sideQuests : buildSideQuests(state.profile);
  state.chat = capsule.chat?.length
    ? capsule.chat
    : [{ role: "coach", content: buildCoachGreeting(state.profile, state.quests, state.sideQuests) }];
  state.selectedPriorities = new Set(capsule.priorities || state.profile.priorities || ["Career", "Health"]);
  state.selectedBuildGoals = new Set(capsule.buildGoals || state.profile.buildGoals || ["Freedom", "Mastery"]);
  state.selectedTravelNeeds = new Set(
    capsule.travelNeeds || state.profile.travelContext?.needs || ["Food", "Culture", "Events"],
  );
  state.nudgeConfig = { ...defaultNudgeConfig, ...(capsule.nudgeConfig || {}) };
  hydrateNudgeControls();

  persistProfile();
  renderDashboard();
  dashboard.hidden = false;
  dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
  updateNav("dashboard");
}

function exportSoulCapsule() {
  if (!state.profile) {
    setSoulStatus("Generate a QuestDex profile before exporting.");
    return;
  }

  const capsule = buildSoulCapsule();
  const filename = `questdex-soul-${slugify(state.profile.displayName)}.json`;
  const serialized = downloadJson(capsule, filename);
  setSoulStatus(`Exported ${filename}.`);
  return serialized;
}

function importSoulCapsule(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      applySoulCapsule(JSON.parse(String(reader.result || "")));
      setSoulStatus(`Imported ${file.name}.`);
    } catch (error) {
      setSoulStatus(error.message || "Unable to import this Soul Capsule.", true);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function exportEncryptedSoulCapsule() {
  try {
    const encryptedCapsule = await createEncryptedSoulArtifact();
    const filename = `questdex-soul-encrypted-${slugify(state.profile.displayName)}.json`;
    const serialized = downloadJson(encryptedCapsule, filename);
    setSoulStatus(`Exported encrypted capsule ${filename}. Keep the passphrase separate.`);
    return serialized;
  } catch (error) {
    setSoulStatus(error.message || "Unable to export encrypted Soul Capsule.", true);
    return null;
  }
}

async function exportSoulAnchor() {
  try {
    const encryptedCapsule = await createEncryptedSoulArtifact();
    const anchor = await buildSoulAnchorRecord(encryptedCapsule);
    const filename = `questdex-soul-anchor-${slugify(state.profile.displayName)}.json`;
    const serialized = downloadJson(anchor, filename);

    renderSoulAnchorPreview(anchor);
    setSoulStatus(`Exported anchor ${filename}. Store the encrypted capsule separately.`);
    return serialized;
  } catch (error) {
    setSoulStatus(error.message || "Unable to export Soul Anchor.", true);
    return null;
  }
}

async function importEncryptedSoulCapsule(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const capsule = await decryptSoulCapsule(
        JSON.parse(String(reader.result || "")),
        readSoulPassphrase(),
      );
      applySoulCapsule(capsule);
      setSoulStatus(`Imported encrypted capsule ${file.name}.`);
    } catch (error) {
      setSoulStatus(error.message || "Unable to import encrypted Soul Capsule.", true);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function createEncryptedSoulArtifact() {
  if (!state.profile) {
    throw new Error("Generate a QuestDex profile before creating an encrypted capsule.");
  }

  return encryptSoulCapsule(buildSoulCapsule(), readSoulPassphrase(), {
    recoveryHint: soulRecoveryHint?.value.trim() || "",
  });
}

function renderDashboard() {
  if (!state.profile) return;

  const profile = state.profile;
  ensureRpgProfileFields(profile);
  document.querySelector("#profileTitle").textContent = profile.archetypes?.join("-") || profile.primaryType;
  document.querySelector("#profileSubtitle").textContent =
    `${profile.displayName} is playing ${profile.lifeStage.toLowerCase()} mode, training toward: ${profile.desiredEvolution}`;
  document.querySelector("#coachToneBadge").textContent = profile.coachTone;

  renderDexList(profile);
  renderStats(profile.humanStats || profile.stats);
  renderWorld(profile.worldContext);
  renderBuild(profile);
  renderQuests(state.quests);
  const sideQuestPanel = document.querySelector(".sidequest-panel");
  if (sideQuestPanel) sideQuestPanel.hidden = !profile.travelContext?.active;
  if (profile.travelContext?.active) renderSideQuests(state.sideQuests, profile.travelContext);
  renderProgression(profile.skillTree, profile.evolutionPath);
  renderLoadout(profile.party, profile.inventory);
  renderInsights(profile.insights);
  renderDailyNudge();
  renderCoachFeed();
}

function renderDexList(profile) {
  const rows = [
    ["Dual type", profile.archetypes?.join(" / ") || `${profile.primaryType} / ${profile.secondaryType}`],
    ["Build goals", profile.buildGoals?.join(", ") || "Freedom, Mastery"],
    ["Quest domains", profile.priorities.join(", ")],
    ["Known blockers", profile.blockers.join(", ")],
    ["Travel lens", formatTravelLens(profile.travelContext)],
    ["Seed size", profile.seedWordCount ? `${profile.seedWordCount} words` : "Survey only"],
  ];

  document.querySelector("#dexList").innerHTML = rows
    .map(
      ([term, detail]) => `
        <div>
          <dt>${escapeHtml(term)}</dt>
          <dd>${escapeHtml(detail)}</dd>
        </div>
      `,
    )
    .join("");
}

function renderStats(stats) {
  document.querySelector("#statsList").innerHTML = Object.entries(stats)
    .map(
      ([name, value]) => `
        <div class="stat-row">
          <div class="stat-top">
            <span>${escapeHtml(name)}</span>
            <span>${value}</span>
          </div>
          <div class="stat-track" aria-label="${escapeHtml(name)} ${value} out of 100">
            <div class="stat-fill" style="width: ${value}%; --stat-color: ${statColors[name] || statColors.Focus}"></div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderWorld(worldContext = {}) {
  const rows = [
    ["Location", worldContext.location || "Unmapped arena"],
    ["Industry", worldContext.industry || "Open-world / cross-domain"],
    ["Culture", worldContext.culture || "Rules still being discovered"],
    ["Constraints", formatList(worldContext.constraints, "No major debuffs mapped yet")],
    ["Opportunities", formatList(worldContext.opportunities, "No buffs mapped yet")],
  ];

  document.querySelector("#worldList").innerHTML = rows
    .map(
      ([term, detail]) => `
        <div>
          <dt>${escapeHtml(term)}</dt>
          <dd>${escapeHtml(detail)}</dd>
        </div>
      `,
    )
    .join("");
}

function renderBuild(profile) {
  const buildCards = [
    {
      title: "Human type",
      body: formatList(profile.archetypes, "Adaptive Explorer"),
    },
    {
      title: "Optimizing for",
      body: formatList(profile.buildGoals, "Freedom, Mastery"),
    },
    {
      title: "Quest domains",
      body: formatList(profile.priorities, "Career, Health"),
    },
    {
      title: "Training friction",
      body: formatList(profile.blockers, "Needs clearer next actions"),
    },
  ];

  document.querySelector("#buildList").innerHTML = buildCards
    .map(
      (card) => `
        <article>
          <h4>${escapeHtml(card.title)}</h4>
          <p>${escapeHtml(card.body)}</p>
        </article>
      `,
    )
    .join("");
}

function renderProgression(skillTree = [], evolutionPath = []) {
  document.querySelector("#skillTreeList").innerHTML = skillTree
    .map(
      (skill) => `
        <article>
          <h4>${escapeHtml(skill.name)}</h4>
          <p>${escapeHtml(skill.branch)} | ${escapeHtml(skill.status)} | ${escapeHtml(formatList(skill.linkedStats, "No linked stats"))}</p>
        </article>
      `,
    )
    .join("");

  document.querySelector("#evolutionList").innerHTML = evolutionPath
    .map(
      (step) => `
        <article>
          <h4>${escapeHtml(step.stage)}: ${escapeHtml(step.title)}</h4>
          <p>${escapeHtml(step.condition)}</p>
        </article>
      `,
    )
    .join("");
}

function renderLoadout(party = [], inventory = []) {
  document.querySelector("#partyList").innerHTML = party
    .map((member) => `<li>${escapeHtml(member)}</li>`)
    .join("");
  document.querySelector("#inventoryList").innerHTML = inventory
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function renderQuests(quests) {
  document.querySelector("#questList").innerHTML = quests
    .map(
      (quest, index) => `
        <article class="quest-item">
          <span class="quest-rank">${index + 1}</span>
          <div>
            <h4>${escapeHtml(quest.title)}</h4>
            <p>${escapeHtml(quest.body)}</p>
            <span class="quest-reward">${escapeHtml(quest.reward)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderSideQuests(sideQuests, travelContext = {}) {
  const mode = travelContext?.sideQuestMode || "Travel";
  const destination = travelContext?.destination || (mode === "Travel" ? "New country mode" : mode);
  const needs = travelContext?.needs?.length ? travelContext.needs.join(", ") : "Food, Culture, Events";
  const pace = travelContext?.mode || "On the ground today";
  const title = mode === "Travel" ? "Travel radar" : `${mode} radar`;
  const titleElement = document.querySelector("#sideQuestsTitle");
  if (titleElement) titleElement.textContent = title;

  document.querySelector("#travelContextLine").textContent =
    `${destination} | ${pace} | Lens: ${needs} | Novelty ${travelContext?.whimsy || 50}/100`;

  document.querySelector("#sideQuestList").innerHTML = sideQuests
    .map(
      (quest) => `
        <article class="sidequest-item">
          <span class="sidequest-type">${escapeHtml(quest.type)}</span>
          <h4>${escapeHtml(quest.title)}</h4>
          <p>${escapeHtml(quest.body)}</p>
          <span class="sidequest-reward">${escapeHtml(quest.reward)}</span>
        </article>
      `,
    )
    .join("");
}

function renderDailyNudge() {
  if (!state.profile) return;

  const nudge = buildDailyNudge(state.profile, state.quests, state.sideQuests, state.nudgeConfig);
  document.querySelector("#dailyTodoList").innerHTML = nudge.todos
    .map(
      (todo) => `
        <li>
          <span class="todo-type">${escapeHtml(todo.type)}</span>
          <strong>${escapeHtml(todo.title)}</strong>
          <p>${escapeHtml(todo.body)}</p>
        </li>
      `,
    )
    .join("");

  if (nudgePayloadPreview && !nudgePayloadPreview.hidden) {
    nudgePayloadPreview.textContent = buildNudgeChannelPayload(nudge, state.nudgeConfig.channel);
  }

  setNudgeStatus(
    state.nudgeConfig.enabled
      ? `Browser nudge armed for ${state.nudgeConfig.time}. Keep QuestDex open for local notifications.`
      : "Daily route ready. Copy it to Notion for a diary/TODO page, or use ChatGPT/Telegram for off-app delivery.",
  );
}

function renderInsights(insights) {
  document.querySelector("#insightsList").innerHTML = insights
    .map((insight) => `<li>${escapeHtml(insight)}</li>`)
    .join("");
}

function renderCoachFeed() {
  const feed = document.querySelector("#coachFeed");
  feed.innerHTML = state.chat
    .map((message) => `<div class="message ${message.role}">${escapeHtml(message.content)}</div>`)
    .join("");
  feed.scrollTop = feed.scrollHeight;
}

function setSoulStatus(message, isError = false) {
  if (!soulStatus) return;
  soulStatus.textContent = message;
  soulStatus.classList.toggle("is-error", isError);
}

function renderSoulAnchorPreview(anchor) {
  if (!soulAnchorPreview) return;
  soulAnchorPreview.hidden = false;
  soulAnchorPreview.textContent = JSON.stringify(anchor, null, 2);
}

function readSoulPassphrase() {
  const passphrase = soulPassphrase?.value || "";
  assertUsablePassphrase(passphrase);
  return passphrase;
}

function assertUsablePassphrase(passphrase) {
  if (!passphrase || passphrase.length < 8) {
    throw new Error("Use a passphrase with at least 8 characters.");
  }
}

function downloadJson(payload, filename) {
  const serialized = JSON.stringify(payload, null, 2);

  if (typeof Blob === "undefined" || !document.createElement || typeof URL === "undefined") {
    return serialized;
  }

  const blob = new Blob([serialized], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  return serialized;
}

function downloadText(text, filename, type = "text/plain") {
  if (typeof Blob === "undefined" || !document.createElement || typeof URL === "undefined") {
    return text;
  }

  const blob = new Blob([text], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  return text;
}

function persistProfile() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      profile: state.profile,
      quests: state.quests,
      sideQuests: state.sideQuests,
      chat: state.chat,
      priorities: Array.from(state.selectedPriorities),
      buildGoals: Array.from(state.selectedBuildGoals),
      travelNeeds: Array.from(state.selectedTravelNeeds),
      nudgeConfig: state.nudgeConfig,
    }),
  );
}

function restoreSavedProfile() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    state.profile = parsed.profile || null;
    state.quests = parsed.quests || [];
    state.sideQuests = parsed.sideQuests || [];
    state.chat = parsed.chat || [];
    state.selectedPriorities = new Set(parsed.priorities || ["Career", "Health"]);
    state.selectedBuildGoals = new Set(parsed.buildGoals || state.profile?.buildGoals || ["Freedom", "Mastery"]);
    state.selectedTravelNeeds = new Set(parsed.travelNeeds || ["Food", "Culture", "Events"]);
    state.nudgeConfig = { ...defaultNudgeConfig, ...(parsed.nudgeConfig || {}) };
    hydrateNudgeControls();

    if (state.profile) {
      ensureRpgProfileFields(state.profile);
      if (!state.profile.travelContext) {
        state.profile.travelContext = {
          destination: "",
          mode: "On the ground today",
          whimsy: 50,
          needs: Array.from(state.selectedTravelNeeds),
          needsText: "",
          wantsText: "",
          eventsSeed: "",
          active: false,
        };
      }
      if (!state.quests.length) {
        state.quests = buildQuests(state.profile);
      }
      if (!state.sideQuests.length) {
        state.sideQuests = buildSideQuests(state.profile);
      }
      if (!state.chat.length) {
        state.chat = [{ role: "coach", content: buildCoachGreeting(state.profile, state.quests, state.sideQuests) }];
      }
      dashboard.hidden = false;
      renderDashboard();
      updateNav("dashboard");
    }
  } catch (error) {
    console.warn("Unable to restore saved QuestDex profile", error);
  }
}

function updateNav(activeId) {
  document.querySelectorAll(".step-nav__item").forEach((item) => {
    item.classList.toggle("is-active", item.getAttribute("href") === `#${activeId}`);
  });
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function toDateKey(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeNudgeTime(value) {
  return /^\d{2}:\d{2}$/.test(String(value || "")) ? value : defaultNudgeConfig.time;
}

function timeToMinutes(time) {
  const [hours, minutes] = normalizeNudgeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesSinceMidnight(date) {
  const value = new Date(date);
  return value.getHours() * 60 + value.getMinutes();
}

function formatTravelLens(travelContext = {}) {
  if (!travelContext.active) return "Optional side quests off";
  const mode = travelContext.sideQuestMode || "Travel";
  const destination = travelContext.destination || (mode === "Travel" ? "New country mode" : mode);
  const needs = travelContext.needs?.length ? travelContext.needs.slice(0, 3).join(", ") : "general discovery";
  return `${mode}: ${destination}: ${needs}`;
}

function ensureRpgProfileFields(profile) {
  if (!profile || typeof profile !== "object") return profile;

  profile.priorities = normalizeArray(profile.priorities, ["Career", "Health"]).slice(0, 5);
  profile.buildGoals = normalizeArray(profile.buildGoals, Array.from(state.selectedBuildGoals || [])).slice(0, 5);
  if (!profile.buildGoals.length) profile.buildGoals = ["Freedom", "Mastery"];

  const inferredArchetypes = [
    ...normalizeArray(profile.archetypes),
    toArchetypeName(profile.primaryType),
    toArchetypeName(profile.secondaryType),
  ];
  profile.archetypes = uniqueTextItems(inferredArchetypes).slice(0, 2);
  if (!profile.archetypes.length) profile.archetypes = ["Explorer", "Strategist"];
  if (profile.archetypes.length === 1) profile.archetypes.push("Strategist");
  profile.primaryType = profile.archetypes[0];
  profile.secondaryType = profile.archetypes[1];

  profile.blockers = normalizeArray(profile.blockers, ["Needs clearer next actions"]).slice(0, 5);
  profile.insights = normalizeArray(profile.insights, [
    "No seed data added yet, so the coach is relying on survey answers.",
  ]);
  profile.stats = profile.stats || legacyStatsFromHumanStats(profile.humanStats);
  profile.humanStats = profile.humanStats || humanStatsFromLegacyStats(profile.stats);
  profile.worldContext = normalizeWorldContext(profile.worldContext, profile);
  profile.party = normalizeArray(profile.party, ["Future mentor", "Peer ally", "Friendly rival"]).slice(0, 6);
  profile.inventory = normalizeArray(profile.inventory, ["Current skills", "Personal device", "Time blocks"]).slice(0, 6);
  profile.travelContext = normalizeTravelContext(profile.travelContext);
  profile.skillTree = normalizeSkillTree(profile.skillTree);
  if (!profile.skillTree.length) {
    profile.skillTree = buildSkillTree(profile.archetypes, profile.priorities, profile.inventory, profile.humanStats);
  }
  profile.evolutionPath = normalizeEvolutionPath(profile.evolutionPath, profile);
  profile.seedWordCount = Number(profile.seedWordCount || 0);
  profile.displayName = profile.displayName || "New trainer";
  profile.lifeStage = profile.lifeStage || "Explorer";
  profile.desiredEvolution = profile.desiredEvolution || "Become more capable in the current world.";
  profile.coachTone = profile.coachTone || "Direct and warm";

  return profile;
}

function normalizeArray(value, fallback = []) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return parseListLike(value);
  return [...fallback];
}

function parseListLike(value) {
  if (!value) return [];

  return String(value)
    .split(/\r?\n|;|,/)
    .map((item) =>
      item
        .replace(/^\s*[-*•]\s*/, "")
        .replace(/^\s*\d+[.)]\s*/, "")
        .replace(/\s+/g, " ")
        .replace(/[.]+$/g, "")
        .trim(),
    )
    .filter(Boolean);
}

function normalizeWorldContext(worldContext = {}, profile = {}) {
  const blockers = normalizeArray(profile.blockers).slice(0, 3);
  const insightOpportunities = normalizeArray(profile.insights)
    .filter((insight) => /user|demo|public|specific|targeted/i.test(insight))
    .slice(0, 3);

  return {
    location: worldContext.location || "Unmapped arena",
    industry: worldContext.industry || "Open-world / cross-domain",
    culture: worldContext.culture || "Rules still being discovered",
    constraints: normalizeArray(worldContext.constraints, blockers.length ? blockers : ["No major debuffs mapped yet"]).slice(0, 5),
    opportunities: normalizeArray(
      worldContext.opportunities,
      insightOpportunities.length ? insightOpportunities : ["Next useful route can be discovered"],
    ).slice(0, 5),
  };
}

function normalizeTravelContext(travelContext = {}) {
  const sideQuestMode = normalizeSideQuestMode(travelContext.sideQuestMode || (travelContext.active ? "Travel" : "Off"));
  return {
    sideQuestMode,
    destination: travelContext.destination || "",
    focus: travelContext.focus || travelContext.destination || "",
    mode: travelContext.mode || "On the ground today",
    whimsy: Number(travelContext.whimsy || 50),
    needs: normalizeArray(travelContext.needs, Array.from(state.selectedTravelNeeds || [])).slice(0, 6),
    needsText: travelContext.needsText || "",
    wantsText: travelContext.wantsText || "",
    eventsSeed: travelContext.eventsSeed || "",
    active: Boolean(
      sideQuestMode !== "Off" &&
        (travelContext.active ||
          travelContext.destination ||
          travelContext.focus ||
          travelContext.needsText ||
          travelContext.wantsText ||
          travelContext.eventsSeed),
    ),
  };
}

function normalizeSkillTree(skillTree = []) {
  if (!Array.isArray(skillTree)) return [];

  return uniqueBySkill(
    skillTree
      .filter((skill) => skill && typeof skill === "object")
      .map((skill) => ({
        name: skill.name || "Unnamed skill",
        branch: skill.branch || "General",
        status: skill.status || "available",
        linkedStats: normalizeArray(skill.linkedStats, ["Wisdom"]),
      })),
  ).slice(0, 6);
}

function normalizeEvolutionPath(evolutionPath = [], profile = {}) {
  if (Array.isArray(evolutionPath) && evolutionPath.length) {
    return evolutionPath
      .filter((step) => step && typeof step === "object")
      .map((step) => ({
        stage: step.stage || "Evolution step",
        title: step.title || "Next form",
        condition: step.condition || "Complete quests and review the pattern.",
      }))
      .slice(0, 4);
  }

  return [
    {
      stage: "Current form",
      title: `${profile.primaryType || "Explorer"}-${profile.secondaryType || "Strategist"}`,
      condition: "Mapped from current survey signals.",
    },
    {
      stage: "Evolution target",
      title: inferNextEvolution(profile.primaryType || "Explorer", profile.desiredEvolution || ""),
      condition: "Complete three quests, protect one recovery block, and record what changed.",
    },
  ];
}

function humanStatsFromLegacyStats(stats = {}) {
  const energy = Number(stats.Energy || 50);
  const focus = Number(stats.Focus || 50);
  const confidence = Number(stats.Confidence || 50);
  const consistency = Number(stats.Consistency || 50);
  const social = Number(stats.Social || confidence);

  return {
    Strength: clamp(Math.round((energy + consistency) / 2), 5, 96),
    Intelligence: clamp(Math.round(focus), 5, 96),
    Charisma: clamp(Math.round((confidence + social) / 2), 5, 96),
    Wisdom: clamp(Math.round((focus + consistency) / 2), 5, 96),
    Dexterity: clamp(Math.round((focus + energy) / 2), 5, 96),
    Constitution: clamp(Math.round((energy + consistency) / 2), 5, 96),
    Luck: 50,
    Reputation: clamp(Math.round(confidence), 5, 96),
    Resources: 50,
  };
}

function legacyStatsFromHumanStats(humanStats = {}) {
  return {
    Energy: Number(humanStats.Strength || humanStats.Constitution || 50),
    Focus: Number(humanStats.Intelligence || humanStats.Wisdom || 50),
    Confidence: Number(humanStats.Charisma || humanStats.Reputation || 50),
    Consistency: Number(humanStats.Constitution || humanStats.Wisdom || 50),
    Creativity: Number(humanStats.Luck || 50),
    Social: Number(humanStats.Charisma || 50),
  };
}

function toArchetypeName(value) {
  const text = String(value || "").toLowerCase();
  if (!text) return "";
  if (text.includes("builder") || text.includes("founder") || text.includes("venture") || text.includes("maker")) {
    return "Builder";
  }
  if (text.includes("knowledge") || text.includes("scholar") || text.includes("study") || text.includes("adept")) {
    return "Scholar";
  }
  if (text.includes("energy") || text.includes("warrior") || text.includes("body")) return "Warrior";
  if (text.includes("merchant") || text.includes("resource") || text.includes("money")) return "Merchant";
  if (text.includes("connection") || text.includes("courage") || text.includes("social") || text.includes("diplomat")) {
    return "Diplomat";
  }
  if (text.includes("creative") || text.includes("artist")) return "Artist";
  if (text.includes("explorer") || text.includes("scout") || text.includes("mapper")) return "Explorer";
  if (text.includes("healer") || text.includes("recovery") || text.includes("restarter")) return "Healer";
  if (text.includes("trickster")) return "Trickster";
  if (text.includes("leader") || text.includes("strateg")) return "Strategist";
  return value;
}

function formatList(items, fallback) {
  const values = normalizeArray(items);
  return values.length ? values.join(", ") : fallback;
}

function parseSourceJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(rawText.slice(start, end + 1));
    } catch (nestedError) {
      return null;
    }
  }
}

function firstString(object, paths) {
  for (const path of paths) {
    const value = valueAtPath(object, path);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firstList(object, paths) {
  for (const path of paths) {
    const value = valueAtPath(object, path);
    const list = normalizeUnknownList(value);
    if (list.length) return list;
  }
  return [];
}

function valueAtPath(object, path) {
  return path.split(".").reduce((value, key) => (value && typeof value === "object" ? value[key] : undefined), object);
}

function normalizeUnknownList(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item.name || item.title || item.value || JSON.stringify(item);
        return "";
      })
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === "string") return parseListLike(value);
  if (value && typeof value === "object") return Object.values(value).flatMap((item) => normalizeUnknownList(item));
  return [];
}

function sentenceFromList(items) {
  const list = normalizeUnknownList(items);
  if (!list.length) return "";
  return list.length === 1 ? list[0] : list.slice(0, 3).join(", ");
}

function listText(items) {
  return uniqueTextItems(normalizeUnknownList(items)).join("\n");
}

function firstLabeledText(text, labels) {
  const lines = String(text || "").split(/\r?\n/);
  for (const label of labels) {
    const index = lines.findIndex((line) => line.toLowerCase().includes(`${label}:`));
    if (index === -1) continue;
    const sameLine = lines[index].split(":").slice(1).join(":").trim();
    const following = lines
      .slice(index + 1, index + 5)
      .filter((line) => line.trim() && !/^[a-z][a-z\s]+:/i.test(line.trim()))
      .join("\n");
    return [sameLine, following].filter(Boolean).join("\n").trim();
  }
  return "";
}

function compactObject(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => String(value || "").trim()));
}

function sanitizeOptionList(items, allowedOptions) {
  const normalizedAllowed = new Map(allowedOptions.map((option) => [option.toLowerCase(), option]));
  return uniqueTextItems(normalizeUnknownList(items))
    .map((item) => normalizedAllowed.get(item.toLowerCase()) || allowedOptions.find((option) => item.toLowerCase().includes(option.toLowerCase())))
    .filter(Boolean);
}

function normalizeLifeStage(value) {
  const text = String(value || "").toLowerCase();
  if (!text) return "";
  return (
    lifeStageOptions.find((option) => option.toLowerCase() === text) ||
    lifeStageOptions.find((option) => text.includes(option.toLowerCase())) ||
    (text.includes("founder") || text.includes("startup") ? "Founder" : "") ||
    (text.includes("student") || text.includes("school") ? "Student" : "") ||
    (text.includes("career") || text.includes("transition") ? "Career transition" : "") ||
    (text.includes("recover") || text.includes("reset") ? "Recovery and reset" : "") ||
    (text.includes("explore") || text.includes("travel") ? "Explorer" : "")
  );
}

function sourceSeedText(sourceName, body) {
  return `source: ${sourceName}\n${String(body || "").trim()}`;
}

function buildSourceSignals(sourceName, fields, priorities, buildGoals, travelNeeds) {
  return [
    {
      title: "Source",
      value: sourceName,
      detail: `${Object.keys(fields || {}).length} fields`,
    },
    {
      title: "Build",
      value: buildGoals.length ? buildGoals.join(", ") : "Inferred",
      detail: priorities.length ? priorities.join(", ") : "No priority override",
    },
    {
      title: "World",
      value: fields.worldIndustry || fields.worldLocation || "Open-world",
      detail: fields.worldCulture || "Terrain from seed",
    },
    {
      title: "Inventory",
      value: fieldItemCount(fields.inventoryText),
      detail: fields.partyText ? "Party also mapped" : "Loadout only",
    },
    {
      title: "Travel",
      value: travelNeeds.length ? travelNeeds.join(", ") : "Optional",
      detail: fields.travelDestination || "No destination",
    },
  ];
}

function fieldItemCount(value) {
  const count = parseListLike(value || "").length;
  if (!count) return "No items";
  return `${count} item${count === 1 ? "" : "s"}`;
}

function sanitizeGithubUsername(value) {
  return String(value || "")
    .trim()
    .replace(/^@/, "")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 39);
}

function topCounts(items, limit) {
  const counts = new Map();
  items.forEach((item) => {
    const key = String(item || "").trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}

function daysBetween(now, dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((new Date(now).getTime() - date.getTime()) / 86400000);
}

function inferGithubIndustry(signals, repoText) {
  const text = `${signals.join(" ")} ${repoText}`.toLowerCase();
  if (text.includes("ai") || text.includes("llm") || text.includes("agent")) return "AI tools and agentic software";
  if (text.includes("travel") || text.includes("map") || text.includes("geo")) return "Travel, maps, and local discovery";
  if (text.includes("data") || text.includes("analytics")) return "Data products and analytics";
  if (text.includes("game") || text.includes("rpg")) return "Games and interactive systems";
  if (text.includes("design") || text.includes("frontend") || text.includes("ui")) return "Frontend product design";
  return signals.slice(0, 3).join(", ") || "Software and open-source projects";
}

function githubSeedSummary(user, repos, languages, topics, recentRepos, starredRepos, totalStars) {
  const languageText = languages.map(([language, count]) => `${language} (${count})`).join(", ") || "unspecified";
  const topicText = topics.map(([topic]) => topic).join(", ") || "no public topics";
  const repoLines = repos
    .slice(0, 12)
    .map((repo) => `- ${repo.name}: ${repo.description || "No description"} [${repo.language || "unknown"}]`)
    .join("\n");
  const recentLines = recentRepos
    .slice(0, 8)
    .map((repo) => `- ${repo.name}: ${repo.description || "No description"}`)
    .join("\n");
  const starredLines = starredRepos
    .slice(0, 8)
    .map((repo) => `- ${repo.name}: ${repo.description || "No description"}`)
    .join("\n");

  return [
    `user: ${user?.login || "unknown"}`,
    user?.bio ? `bio: ${user.bio}` : "",
    user?.location ? `location: ${user.location}` : "",
    `repos worked on in the last 30 days: ${recentRepos.length}`,
    `starred repos analyzed: ${starredRepos.length}`,
    `signal repos analyzed: ${repos.length}`,
    `stars across signal repos: ${totalStars}`,
    `top languages: ${languageText}`,
    `topics: ${topicText}`,
    "recent work:",
    recentLines,
    "starred taste:",
    starredLines,
    "signal repos:",
    repoLines,
  ]
    .filter(Boolean)
    .join("\n");
}

function recentGithubEventRepoNames(events = [], now = new Date()) {
  const activeTypes = new Set([
    "PushEvent",
    "PullRequestEvent",
    "IssuesEvent",
    "CreateEvent",
    "PullRequestReviewEvent",
    "CommitCommentEvent",
    "IssueCommentEvent",
  ]);

  return new Set(
    events
      .filter((event) => activeTypes.has(event?.type) && daysBetween(now, event.created_at) <= 30)
      .map((event) => event.repo?.name)
      .filter(Boolean),
  );
}

function uniqueRepos(repos = []) {
  const seen = new Set();
  return repos.filter((repo) => {
    const key = repo?.full_name || repo?.html_url || repo?.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeTextBlock(existing, next) {
  const existingText = String(existing || "").trim();
  const nextText = String(next || "").trim();
  if (!nextText) return existingText;
  if (!existingText) return nextText;
  if (existingText.toLowerCase().includes(nextText.toLowerCase())) return existingText;
  return `${existingText}\n${nextText}`;
}

async function deriveSoulKey(passphrase, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("This browser does not support Web Crypto.");
  }

  const baseKey = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: SOUL_KDF_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function sha256Hex(text) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("This browser does not support Web Crypto.");
  }

  const hash = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return bytesToHex(new Uint8Array(hash));
}

function randomBytes(length) {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("This browser does not support secure random values.");
  }

  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function canonicalStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function shorten(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function slugify(text) {
  return String(text || "trainer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42) || "trainer";
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function uniqueTextItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.title) return false;
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });
}

function uniqueBySkill(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.name) return false;
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
