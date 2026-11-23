# Case 01 · Work Board with History

**Focus** — Front-end engineering with a pure TypeScript model for board rules and a React interface that makes Undo and action results visible.

Set the In Progress limit before starting a board. Create tasks in To Do and move them among To Do, In Progress, and Done. Each column sorts by text ID. Undo reverses the latest successful change. Refreshing the browser starts a fresh session. See the [official brief](casos/01-quadro-de-trabalho.md) and the [acceptance criteria](docs/superpowers/specs/2026-11-22-work-board-design.md).

## Run locally

Use Node.js 22.12+ on the 22.x line, 24.x, or 26+. Verification used Node.js 26.12.1 and npm 11.20.0.

```sh
git clone https://github.com/Landlucas/desafios-tecnicos.git
cd desafios-tecnicos
npm ci
npm run dev
```

Open the localhost URL printed by Vite. The board runs entirely in the browser. In a separate terminal:

```sh
npx playwright install chromium
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Playwright starts a local Vite server on port 4173. Keep that port free for the test run. Biome checks the source, tests, and Playwright configuration, including recommended React rules. TypeScript checks the project in strict mode. The build runs that type check before writing static assets to `dist/`.

The [custom Biome rule](lint/board-no-browser-globals.grit) flags references to `document`, `window`, browser storage, `globalThis`, and `self` in `src/board.ts`. Keeping those dependencies at the UI boundary lets the domain rules work from their arguments alone. Other source files still use Biome’s regular rules.

The [GitHub Actions workflow](.github/workflows/checks.yml) runs Biome, Vitest, the type-checked build, and Chromium Playwright on each push to `main`. See the [workflow runs](https://github.com/Landlucas/desafios-tecnicos/actions/workflows/checks.yml?query=branch%3Amain) for commit-level results.

## Reproduce the demo

| Action | Expected result |
| --- | --- |
| Set **In Progress limit** to **1** and click **Start board**. | In Progress reads **0 / 1** and Undo is disabled. |
| Add `DOC-01` titled **Docs**, then `REV-02` titled **Review**. | Both cards appear in To Do, sorted by ID, and Undo is enabled. |
| On Review, select **In Progress** under **Move to** and click **Move**. | Review moves and In Progress reads **1 / 1**. |
| On Docs, select **In Progress** and click **Move**. | The board reports that In Progress is full. Docs stays in To Do. |
| Click **Undo**. | Review returns to To Do and capacity reads **0 / 1**. |
| Click **Undo** again. | Review disappears. Docs remains. |

## Three tests to review

| Test | Expected result and regression it catches |
| --- | --- |
| [Playwright workflow](tests/work-board.spec.ts) | Review returns to To Do on the first Undo and disappears on the second. This catches recording a rejected move or reversing creations incorrectly. |
| [Vitest same-column move at capacity](src/board.test.ts) | Returns `no_change` and preserves the board, including history. This catches treating a move within a full column as a capacity violation. |
| [Vitest restoration through a full column](src/board.test.ts) | Each Undo restores the prior board until the history is empty, including a state with a full In Progress column. This catches restoring a wrong destination, removing the wrong task, or adding a history entry during Undo. |

## Two investigated decisions

1. **Inverse actions or task snapshots.** I compared the Docs/Review inverse history with a reference stack of the task arrays before each successful action. All three Undos restored the matching prior task arrays. In that specific sequence, serializing the inverse entries took 140 bytes and serializing the task snapshots took 160 bytes. The check compares JSON representations. In-memory costs also depend on structural sharing. I kept inverse actions because an entry stores the task ID and, for a move, its prior column. Snapshots would simplify restoration if more fields or multi-task edits entered the history.
2. **Same-column check before the capacity check.** I temporarily reversed the guards and ran the targeted Vitest case. It failed with `in_progress_full` where `same_column` was expected. Restoring guard order made the test pass. The capacity guard now applies only to moves that enter In Progress.

## Time, scope, and AI use

- **Time spent** — Approximately 17 minutes of elapsed AI-assisted work across implementation, review, testing, static analysis, and recording preparation. Add your own review and rehearsal time separately.
- **Validation** — The domain and browser checks ran before and after the implementation. The guard-order experiment exercised a realistic regression. A separate code review identified stale blank-submission feedback, which was reproduced and fixed with Playwright. Verification also covered Biome, strict TypeScript checking, the production build, and the README workflow in a clean checkout.
- **AI use** — Codex drafted the specification, implementation, tests, and documentation, and ran the checks above. The two experiments and clean-checkout run supplied concrete evidence for the implementation choices. Candidate review and the video recording remain pending.
- **Before submitting** — Review the ID and capacity assumptions, rerun the demo, and explain the two decisions in your own words. Confirm your total time and the video link’s reviewer access. The [recording outline](docs/recording-outline.md) gives the 20-minute walkthrough.
