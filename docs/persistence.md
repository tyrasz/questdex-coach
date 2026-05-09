# Persistence Design

QuestDex treats the user's evolving profile as a "Soul": a consent-based memory model that includes goals, stats, blockers, quest history, coaching preferences, travel context, and summarized reflections.

## Current MVP

- Browser `localStorage` keeps the generated profile on the same device and browser.
- Soul Capsule export/import lets the user carry their data between browsers, devices, or future versions of the app.
- The capsule is a plain JSON file owned by the user. It is not uploaded anywhere in the static MVP.

## Soul Capsule Shape

```json
{
  "schemaVersion": 1,
  "app": "QuestDex Coach",
  "exportedAt": "2026-05-09T00:00:00.000Z",
  "profile": {},
  "quests": [],
  "sideQuests": [],
  "chat": [],
  "priorities": [],
  "travelNeeds": []
}
```

## Cloud Storage Path

For a real hosted product, use Supabase as the fastest hackathon-friendly path:

- `auth.users`: email, passkey, or OAuth login
- `profiles`: display name, life stage, coaching style, created timestamp
- `soul_snapshots`: versioned JSONB snapshots of the user's full coach state
- `memories`: summarized durable memories, tagged by goal, blocker, travel, health, career, or relationship
- `quest_events`: quest completions, skips, rerolls, reflections, and stat deltas
- `uploads`: user-provided seed files, ideally stored as summaries instead of raw personal data

Postgres `jsonb` is useful early because the schema will evolve quickly. Once patterns stabilize, promote repeated fields into relational tables.

## Privacy Rules

- Store only what the user explicitly submits or confirms.
- Summarize sensitive uploads before long-term storage.
- Keep raw uploads deletable and optional.
- Add an export and delete-my-data path from the first authenticated version.
- Avoid storing precise location history unless the user intentionally saves a trip memory.
- Separate private memory from shareable progress artifacts.

## Retrieval Model

The coach should load memory in this order:

1. Current session state
2. Latest soul snapshot
3. Recent quest events and reflections
4. Durable memories relevant to the user's current prompt
5. Optional travel context, such as destination, weather, events, saved constraints, and curiosity preferences

This keeps the coach from drowning in old data while still feeling continuous.

## Suggested Next Implementation

1. Add Supabase auth.
2. Save Soul Capsule JSON to a `soul_snapshots` row after every generated profile or import.
3. Add an explicit "Remember this" control in the coach console.
4. Summarize chat sessions into durable memories.
5. Add user-controlled export/delete actions.
