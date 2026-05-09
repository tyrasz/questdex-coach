# QuestDex Coach

A static web MVP for a "personal Pokedex" style digital coach. It starts with a survey, optionally accepts user-owned seed data, and generates a LifeDex profile with stats, blockers, quests, seed insights, and a local coach console.

## Run

Open `index.html` in a browser. No install step is required.

For a local server:

```sh
npm start
```

## Web Demo

GitHub Pages deploys from `main` when Pages is enabled for the repository:

https://tyrasz.github.io/questdex-coach/

## Test

```sh
npm test
```

The tests use Node's built-in test runner and a small mocked browser environment, so there are no package dependencies to install.

## Current MVP

- Survey for life stage, desired evolution, priorities, blockers, coaching style, and baseline stats
- Optional seed data through paste or file upload (`.txt`, `.md`, `.json`, `.csv`)
- Travel side-quest setup for destination, trip mode, needs, wants, whimsy level, and daily event clues
- Generated profile with primary type, secondary type, priorities, blockers, and stat bars
- Quest board with reroll support
- Side-quest board with travel needs, wants, daily clues, and serendipity prompts
- Coach console with local, rule-based responses
- Local storage persistence
- Soul Capsule export/import for portable user-owned profile storage
- Encrypted Soul Capsule and Soul Anchor exports for blockchain-ready recovery without putting raw data on-chain

## Next Build Ideas

- Add real authentication and a database for long-term memory
- Summarize uploaded seed data server-side before storing it
- Connect the coach console to an LLM
- Add daily check-ins and notification scheduling
- Connect travel side quests to maps, weather, events, and local search APIs
- Add a consent screen that explains what data is used, stored, and ignored

See [docs/persistence.md](docs/persistence.md) for the proposed long-term storage design.
