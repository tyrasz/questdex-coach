const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

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
    console,
    FileReader: function FileReader() {},
    localStorage: {
      getItem() {
        return null;
      },
      removeItem() {},
      setItem() {},
    },
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

test("Soul Capsule validation rejects unrelated JSON", () => {
  const app = loadAppContext();

  assert.throws(
    () => app.validateSoulCapsule({ app: "Other App", profile: {} }),
    /not created by QuestDex Coach/,
  );
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
