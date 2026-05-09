const STORAGE_KEY = "questdex-profile";
const SOUL_CAPSULE_VERSION = 1;
const ENCRYPTED_SOUL_VERSION = 1;
const SOUL_ANCHOR_VERSION = 1;
const SOUL_KDF_ITERATIONS = 150000;

const state = {
  selectedPriorities: new Set(["Career", "Health"]),
  selectedTravelNeeds: new Set(["Food", "Culture", "Events"]),
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

const form = document.querySelector("#intakeForm");
const seedFile = document.querySelector("#seedFile");
const seedPreview = document.querySelector("#seedPreview");
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
  form.elements.travelDestination.value = "Singapore";
  form.elements.travelNeedsText.value = "Reliable meals, easy transit, a calm place to reset, and low-friction evening options.";
  form.elements.travelWantsText.value = "Hawker food, design shops, waterfront walks, and one unexpected neighborhood.";
  form.elements.travelEventsSeed.value = demoTravelEvents;
  form.elements.whimsy.value = 72;
  document.querySelector('[data-output-for="whimsy"]').textContent = "72";
  document.querySelector('[data-output-for="whimsy"]').value = "72";
  state.uploadedSeed = "";
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
  const lowerGoals = `${data.desiredEvolution || ""} ${data.blockers || ""}`.toLowerCase();
  const combined = `${lowerSeed} ${lowerGoals}`;
  const inferredPriorities = inferPriorities(combined);
  const mergedPriorities = unique([...priorities, ...inferredPriorities]).slice(0, 5);
  const primaryType = inferPrimaryType(data.lifeStage, mergedPriorities, combined);
  const secondaryType = inferSecondaryType(combined, mergedPriorities);
  const blockers = extractBlockers(data.blockers, seed);
  const insights = summarizeSeed(seed, data.desiredEvolution);
  const stats = buildStats(data, combined, mergedPriorities);
  const travelContext = buildTravelContext(data);

  return {
    displayName: data.displayName?.trim() || "New trainer",
    lifeStage: data.lifeStage,
    desiredEvolution: data.desiredEvolution.trim(),
    coachTone: data.coachTone,
    priorities: mergedPriorities.length ? mergedPriorities : ["Career", "Health"],
    primaryType,
    secondaryType,
    blockers,
    insights,
    stats,
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

function buildTravelContext(data) {
  const destination = data.travelDestination?.trim() || "";
  const needsText = data.travelNeedsText?.trim() || "";
  const wantsText = data.travelWantsText?.trim() || "";
  const eventsSeed = data.travelEventsSeed?.trim() || "";
  const combined = `${destination} ${needsText} ${wantsText} ${eventsSeed}`.toLowerCase();
  const inferredNeeds = inferTravelNeeds(combined);
  const selectedNeeds = Array.from(state.selectedTravelNeeds);

  return {
    destination,
    mode: data.travelMode || "On the ground today",
    whimsy: Number(data.whimsy || 50),
    needs: unique([...selectedNeeds, ...inferredNeeds]).slice(0, 6),
    needsText,
    wantsText,
    eventsSeed,
    active: Boolean(destination || needsText || wantsText || eventsSeed),
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

function localizeTravelQuest(body, destination, travel) {
  const target = destination === "your destination" ? "the destination" : destination;
  const modeHint = travel.mode === "Planning a future trip" ? " during planning" : "";
  return `${body} Apply it to ${target}${modeHint}.`;
}

function buildCoachGreeting(profile, quests, sideQuests = []) {
  const firstQuest = quests[0];
  const firstSideQuest = sideQuests[0];
  return [
    `${profile.displayName}, your current form is ${profile.primaryType} with ${profile.secondaryType} tendencies.`,
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
    travelNeeds: Array.from(state.selectedTravelNeeds),
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

  state.profile = capsule.profile;
  state.quests = capsule.quests?.length ? capsule.quests : buildQuests(state.profile);
  state.sideQuests = capsule.sideQuests?.length ? capsule.sideQuests : buildSideQuests(state.profile);
  state.chat = capsule.chat?.length
    ? capsule.chat
    : [{ role: "coach", content: buildCoachGreeting(state.profile, state.quests, state.sideQuests) }];
  state.selectedPriorities = new Set(capsule.priorities || state.profile.priorities || ["Career", "Health"]);
  state.selectedTravelNeeds = new Set(
    capsule.travelNeeds || state.profile.travelContext?.needs || ["Food", "Culture", "Events"],
  );

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
  document.querySelector("#profileTitle").textContent = profile.primaryType;
  document.querySelector("#profileSubtitle").textContent =
    `${profile.displayName} is in ${profile.lifeStage.toLowerCase()} mode, training toward: ${profile.desiredEvolution}`;
  document.querySelector("#coachToneBadge").textContent = profile.coachTone;

  renderDexList(profile);
  renderStats(profile.stats);
  renderQuests(state.quests);
  renderSideQuests(state.sideQuests, profile.travelContext);
  renderInsights(profile.insights);
  renderCoachFeed();
}

function renderDexList(profile) {
  const rows = [
    ["Secondary type", profile.secondaryType],
    ["Priorities", profile.priorities.join(", ")],
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
  const destination = travelContext?.destination || "New country mode";
  const needs = travelContext?.needs?.length ? travelContext.needs.join(", ") : "Food, Culture, Events";
  const mode = travelContext?.mode || "On the ground today";

  document.querySelector("#travelContextLine").textContent =
    `${destination} | ${mode} | Lens: ${needs} | Whimsy ${travelContext?.whimsy || 50}/100`;

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

function persistProfile() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      profile: state.profile,
      quests: state.quests,
      sideQuests: state.sideQuests,
      chat: state.chat,
      priorities: Array.from(state.selectedPriorities),
      travelNeeds: Array.from(state.selectedTravelNeeds),
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
    state.selectedTravelNeeds = new Set(parsed.travelNeeds || ["Food", "Culture", "Events"]);

    if (state.profile) {
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
      if (!state.sideQuests.length) {
        state.sideQuests = buildSideQuests(state.profile);
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

function formatTravelLens(travelContext = {}) {
  if (!travelContext.active && !travelContext.destination) return "Ready when a destination is added";
  const destination = travelContext.destination || "New country mode";
  const needs = travelContext.needs?.length ? travelContext.needs.slice(0, 3).join(", ") : "general discovery";
  return `${destination}: ${needs}`;
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

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function uniqueByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
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
