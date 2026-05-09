const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { TextDecoder, TextEncoder } = require("node:util");
const { webcrypto } = require("node:crypto");

function createFakeElement() {
  const element = {
    classList: {
      toggle() {},
    },
    dataset: {},
    elements: {},
    hidden: false,
    style: {},
    value: "",
    addEventListener() {},
    getAttribute() {
      return "";
    },
    querySelector() {
      return element;
    },
    querySelectorAll() {
      return [];
    },
    scrollIntoView() {},
  };

  return element;
}

function loadAppContext() {
  const fakeElement = createFakeElement();
  const context = {
    atob(value) {
      return Buffer.from(value, "base64").toString("binary");
    },
    btoa(value) {
      return Buffer.from(value, "binary").toString("base64");
    },
    console,
    crypto: webcrypto,
    FileReader: function FileReader() {},
    localStorage: {
      getItem() {
        return null;
      },
      removeItem() {},
      setItem() {},
    },
    TextDecoder,
    TextEncoder,
    window: {
      scrollTo() {},
    },
    document: {
      querySelector() {
        return fakeElement;
      },
      querySelectorAll() {
        return [];
      },
    },
  };

  vm.createContext(context);
  const appPath = path.join(__dirname, "..", "app.js");
  vm.runInContext(fs.readFileSync(appPath, "utf8"), context);

  return context;
}

function baseSurvey(overrides = {}) {
  return {
    displayName: "Mira",
    lifeStage: "Explorer",
    desiredEvolution:
      "I want to become a more adaptive traveler who discovers useful places and follows good surprises.",
    energy: "55",
    focus: "48",
    confidence: "46",
    consistency: "39",
    blockers: "I overplan, get tired in unfamiliar cities, and miss interesting local events.",
    coachTone: "Direct and warm",
    worldLocation: "Singapore startup ecosystem with Seoul as a field map",
    worldIndustry: "AI travel tools",
    worldCulture: "Fast demos, public proof, and mentor feedback loops",
    worldConstraints: "Limited budget, light rain, low energy",
    worldOpportunities: "Mentor access, GitHub demo, user interviews, AI automation",
    partyText: "Hackathon teammates, vegetarian cafe staff, local jazz host, future mentor",
    inventoryText: "GitHub repo, transit card, noise-canceling headphones, saved map pins",
    evolutionConditions:
      "Ship a public demo, interview two travelers, keep one recovery block protected",
    travelDestination: "Seoul, South Korea",
    travelMode: "On the ground today",
    whimsy: "78",
    travelNeedsText: "Vegetarian food, simple transit, quiet reset spots, and a safe route back at night.",
    travelWantsText: "Street markets, indie bookstores, old neighborhoods, riverside walks, and live music.",
    travelEventsSeed:
      "today clues: evening market near a station, small jazz set, light rain after 5pm, late cafe hours in Hongdae",
    ...overrides,
  };
}

test("buildProfile creates a typed profile with travel context", () => {
  const app = loadAppContext();
  const profile = app.buildProfile(baseSurvey(), "");

  assert.equal(profile.displayName, "Mira");
  assert.equal(profile.lifeStage, "Explorer");
  assert.equal(profile.travelContext.destination, "Seoul, South Korea");
  assert.equal(profile.travelContext.whimsy, 78);
  assert.ok(profile.travelContext.needs.includes("Food"));
  assert.ok(profile.travelContext.needs.includes("Quiet"));
  assert.ok(profile.blockers.includes("Overplanning"));
});

test("buildProfile exposes the RPG human model", () => {
  const app = loadAppContext();
  const profile = app.buildProfile(
    baseSurvey({
      desiredEvolution:
        "I want freedom, mastery, adventure, and service while becoming a trusted AI travel builder.",
      energy: "62",
      focus: "70",
      confidence: "52",
      consistency: "44",
    }),
    "demo deadline, GitHub proof, user interviews, mentor feedback, limited money, tired after travel",
  );

  assert.equal(profile.worldContext.location, "Singapore startup ecosystem with Seoul as a field map");
  assert.equal(profile.worldContext.industry, "AI travel tools");
  assert.equal(profile.worldContext.culture, "Fast demos, public proof, and mentor feedback loops");
  assert.ok(profile.worldContext.constraints.includes("Limited budget"));
  assert.ok(profile.worldContext.constraints.includes("Time pressure"));
  assert.ok(profile.worldContext.opportunities.includes("GitHub demo"));
  assert.ok(profile.worldContext.opportunities.includes("user interviews"));

  assert.ok(profile.buildGoals.includes("Freedom"));
  assert.ok(profile.buildGoals.includes("Mastery"));
  assert.ok(profile.buildGoals.includes("Adventure"));
  assert.ok(profile.archetypes.includes("Explorer"));
  assert.ok(profile.archetypes.length >= 1);

  assert.equal(profile.humanStats.Intelligence, 70);
  assert.equal(profile.humanStats.Dexterity, 72);
  assert.equal(profile.humanStats.Constitution, 46);
  assert.ok(profile.humanStats.Reputation >= 50);
  assert.ok(profile.humanStats.Resources >= 50);

  assert.deepEqual([...profile.party.slice(0, 4)], [
    "Hackathon teammates",
    "vegetarian cafe staff",
    "local jazz host",
    "future mentor",
  ]);
  assert.deepEqual([...profile.inventory.slice(0, 4)], [
    "GitHub repo",
    "transit card",
    "noise-canceling headphones",
    "saved map pins",
  ]);

  assert.ok(
    profile.skillTree.some(
      (skill) =>
        skill.name === "Map unknown terrain" &&
        skill.branch === "Explorer" &&
        skill.status === "active" &&
        skill.linkedStats.includes("Luck"),
    ),
  );
  assert.ok(profile.skillTree.some((skill) => skill.name === "Use inventory deliberately"));

  assert.equal(profile.evolutionPath[0].stage, "Current form");
  assert.match(profile.evolutionPath[0].title, /Explorer/);
  assert.equal(profile.evolutionPath[1].stage, "Evolution target");
  assert.equal(profile.evolutionPath[1].title, "World Mapper");
  assert.match(profile.evolutionPath[1].condition, /Ship a public demo/);
  assert.match(profile.evolutionPath[1].condition, /interview two travelers/);
});

test("buildQuests includes stabilizing quests for known blockers", () => {
  const app = loadAppContext();
  const profile = app.buildProfile(
    baseSurvey({
      energy: "28",
      blockers: "I overplan, avoid outreach, procrastinate, and sleep badly.",
    }),
    "sleep, tired, outreach, overplanning",
  );
  const titles = app.buildQuests(profile).map((quest) => quest.title);

  assert.ok(titles.includes("Energy floor"));
  assert.ok(titles.includes("Warm reconnect"));
  assert.ok(titles.includes("Assumption duel"));
});

test("buildSideQuests turns travel wants and events into side quests", () => {
  const app = loadAppContext();
  const profile = app.buildProfile(baseSurvey(), "");
  const sideQuests = app.buildSideQuests(profile);
  const titles = sideQuests.map((quest) => quest.title);
  const bodyText = sideQuests.map((quest) => quest.body).join(" ");

  assert.equal(sideQuests.length, 5);
  assert.ok(titles.includes("Curiosity match"));
  assert.ok(titles.includes("Event drift"));
  assert.ok(titles.includes("Taste map"));
  assert.match(bodyText, /Seoul, South Korea/);
});

test("coach reply recognizes travel and side-quest prompts", () => {
  const app = loadAppContext();
  const profile = app.buildProfile(baseSurvey(), "");
  const quests = app.buildQuests(profile);
  const sideQuests = app.buildSideQuests(profile);
  const reply = app.buildCoachReply(
    "I am traveling today. What side quest should I do?",
    profile,
    quests,
    sideQuests,
  );

  assert.match(reply, /Seoul, South Korea/);
  assert.match(reply, /side-quest lens/);
});

test("Soul Capsule export and import preserves generated coach state", () => {
  const app = loadAppContext();
  const profile = app.buildProfile(baseSurvey(), "");
  const capsule = {
    schemaVersion: 1,
    app: "QuestDex Coach",
    exportedAt: "2026-05-09T00:00:00.000Z",
    profile,
    quests: app.buildQuests(profile),
    sideQuests: app.buildSideQuests(profile),
    chat: [{ role: "coach", content: "Welcome back." }],
    priorities: ["Career", "Health"],
    travelNeeds: ["Food", "Culture", "Events"],
  };

  assert.equal(capsule.schemaVersion, 1);
  assert.equal(capsule.profile.displayName, "Mira");
  assert.equal(capsule.sideQuests.length, 5);

  const restoredApp = loadAppContext();
  restoredApp.applySoulCapsule(capsule);
  const exportedAgain = restoredApp.buildSoulCapsule("2026-05-09T00:00:00.000Z");

  assert.equal(exportedAgain.profile.displayName, "Mira");
  assert.equal(exportedAgain.profile.travelContext.destination, "Seoul, South Korea");
  assert.equal(exportedAgain.chat[0].content, "Welcome back.");
});

test("legacy Soul Capsules are upgraded with stable RPG fields", () => {
  const app = loadAppContext();
  const legacyCapsule = {
    schemaVersion: 1,
    app: "QuestDex Coach",
    exportedAt: "2026-05-09T00:00:00.000Z",
    profile: {
      displayName: "Kai",
      lifeStage: "Career transition",
      desiredEvolution: "Become a confident operator with better options.",
      coachTone: "Direct and warm",
      primaryType: "Adaptive Explorer",
      secondaryType: "Curious Strategist",
      priorities: ["Career"],
      blockers: ["Unclear priorities"],
      insights: ["Survey-only profile."],
      stats: {
        Energy: 51,
        Focus: 64,
        Confidence: 43,
        Consistency: 40,
        Creativity: 50,
        Social: 46,
      },
      seedWordCount: 0,
    },
    quests: [],
    sideQuests: [],
    chat: [],
    priorities: ["Career"],
    travelNeeds: ["Food"],
  };

  app.applySoulCapsule(legacyCapsule);
  const upgraded = app.buildSoulCapsule("2026-05-09T00:00:00.000Z");

  assert.equal(upgraded.profile.displayName, "Kai");
  assert.ok(upgraded.profile.archetypes.includes("Explorer"));
  assert.ok(upgraded.profile.humanStats.Intelligence >= 60);
  assert.equal(upgraded.profile.worldContext.location, "Unmapped arena");
  assert.ok(upgraded.profile.party.length > 0);
  assert.ok(upgraded.profile.inventory.length > 0);
  assert.ok(upgraded.profile.skillTree.length > 0);
  assert.equal(upgraded.profile.evolutionPath[0].stage, "Current form");
  assert.ok(upgraded.quests.length > 0);
  assert.ok(upgraded.sideQuests.length > 0);
  assert.ok(upgraded.buildGoals.includes("Freedom"));
});

test("Soul Capsule validation rejects unrelated JSON", () => {
  const app = loadAppContext();

  assert.throws(
    () => app.validateSoulCapsule({ app: "Other App", profile: {} }),
    /not created by QuestDex Coach/,
  );
});

test("encrypted Soul Capsule can decrypt while anchor omits raw Soul data", async () => {
  const app = loadAppContext();
  const profile = app.buildProfile(baseSurvey(), "");
  const capsule = {
    schemaVersion: 1,
    app: "QuestDex Coach",
    exportedAt: "2026-05-09T00:00:00.000Z",
    profile,
    quests: app.buildQuests(profile),
    sideQuests: app.buildSideQuests(profile),
    chat: [{ role: "coach", content: "Carry this safely." }],
    priorities: ["Career", "Health"],
    travelNeeds: ["Food", "Culture", "Events"],
  };
  const encrypted = await app.encryptSoulCapsule(capsule, "correct horse battery staple", {
    createdAt: "2026-05-09T00:00:00.000Z",
    recoveryHint: "four words",
    saltBase64: Buffer.from("questdex-test-salt").toString("base64"),
    ivBase64: Buffer.from("test-iv-12345").subarray(0, 12).toString("base64"),
  });
  const decrypted = await app.decryptSoulCapsule(encrypted, "correct horse battery staple");
  const anchor = await app.buildSoulAnchorRecord(encrypted, {
    createdAt: "2026-05-09T00:00:00.000Z",
    storagePointer: "ipfs://encrypted-capsule-placeholder",
  });
  const anchorText = JSON.stringify(anchor);
  const encryptedText = JSON.stringify(encrypted);

  assert.equal(decrypted.profile.displayName, "Mira");
  assert.equal(decrypted.profile.travelContext.destination, "Seoul, South Korea");
  assert.equal(encrypted.type, "EncryptedSoulCapsule");
  assert.equal(anchor.type, "SoulAnchor");
  assert.equal(anchor.network, "mock-chain");
  assert.match(anchor.anchorHash, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(anchorText, /Mira|Seoul|Carry this safely/);
  assert.doesNotMatch(encryptedText, /Mira|Seoul|Carry this safely/);
});

test("encrypted Soul Capsule rejects the wrong passphrase", async () => {
  const app = loadAppContext();
  const profile = app.buildProfile(baseSurvey(), "");
  const capsule = {
    schemaVersion: 1,
    app: "QuestDex Coach",
    exportedAt: "2026-05-09T00:00:00.000Z",
    profile,
    quests: app.buildQuests(profile),
    sideQuests: app.buildSideQuests(profile),
    chat: [],
    priorities: ["Career", "Health"],
    travelNeeds: ["Food", "Culture", "Events"],
  };
  const encrypted = await app.encryptSoulCapsule(capsule, "correct horse battery staple", {
    saltBase64: Buffer.from("questdex-test-salt").toString("base64"),
    ivBase64: Buffer.from("test-iv-12345").subarray(0, 12).toString("base64"),
  });

  await assert.rejects(() => app.decryptSoulCapsule(encrypted, "wrong passphrase"));
});

test("summarizeSeed detects event, energy, user, and consistency signals", () => {
  const app = loadAppContext();
  const insights = app.summarizeSeed(
    "demo deadline, tired after travel, talk to users, build a consistent habit",
    "Ship a useful prototype",
  );

  assert.ok(insights.some((insight) => insight.includes("Time pressure")));
  assert.ok(insights.some((insight) => insight.includes("Energy management")));
  assert.ok(insights.some((insight) => insight.includes("User contact")));
  assert.ok(insights.some((insight) => insight.includes("Consistency")));
});
