# Case 01 · Screen recording outline

**Target length** — 20 minutes. The case allows up to 30 minutes. Record in English. If Hanna requests Portuguese, keep the same actions, timings, and code identifiers. Useful terms are To Do (*a fazer*), In Progress (*em andamento*), Done (*concluído*), and Undo (*desfazer*).

Before recording, open the app at the Board setup screen, the terminal in the solution directory, and editor tabs for `src/board.ts`, `src/App.tsx`, `tests/work-board.spec.ts`, and `src/board.test.ts`. Check the recording text size and that Chromium can launch with `npm run test:e2e`.

## 0:00–2:00 · Problem and approach

**Show** the setup screen and a brief view of the README.

**Say** “A team needs a work board that can recover from accidental changes. A new task starts in To Do. In Progress has a configurable limit, and Undo reverses the last change that actually happened. My focus is front-end engineering and the board’s state rules. A browser-only app lets me show those rules immediately. React owns the session and TypeScript owns the rules. Refreshing clears the board.”

## 2:00–7:00 · Live demo

**Show** the setup and board, with the action feedback and capacity count in view.

| Action | What to say |
| --- | --- |
| Choose a limit of **1**, click **Start board**, and add `DOC-01` Docs followed by `REV-02` Review. | “Both start in To Do in ID order. Undo becomes available after the first creation.” |
| Move Review to In Progress. | “Review uses the only slot. The counter now reads one of one.” |
| Before selecting In Progress on Docs and clicking **Move** | “I expect a rejection because the slot is occupied. Docs should stay in To Do and Review should stay in In Progress.” After clicking, point to the failure message and both cards. |
| Before the first **Undo** | “I expect Review to return to To Do. The rejected move should have left history alone.” After clicking, show both cards in To Do and the zero-of-one count. |
| Before the second **Undo** | “The preceding action was creating Review. I expect Review to disappear and Docs to remain.” After clicking, point to the remaining Docs card and the creation Undo message. |
| Optional third **Undo**, if time allows | “This removes Docs, the first creation. Now history is empty and Undo is disabled.” |

## 7:00–12:00 · Domain rules and React

**Show** `src/board.ts` at `Board`, `InverseAction`, `moveTask`, `commit`, and `undo`. Then show `src/App.tsx` at `reducer`, the live status region, and the Undo button.

**Say** “The board carries the tasks, the fixed limit, and a stack of inverse actions. A move validates the task and destination, then checks whether the destination is already the current column. Only a move entering In Progress checks capacity. A successful change uses `commit` to produce a new board and append the inverse. Failure and no change return the existing board. Undo pops the last inverse and either removes a creation or restores a column. A LIFO restore returns to a previously valid state.”

“In React, the reducer sends actions through `applyAction`. The UI turns the result into English feedback and derives the Undo button’s enabled state from `canUndo`. The three column IDs and the empty Undo code retain the case literals.”

## 12:00–17:00 · Tests and observed results

**Show** the Playwright test at its failure-message and Undo assertions, then run:

```sh
npm run test:e2e -- -g 'Undo skips'
npm test -- -t 'same-column move at capacity'
```

**Say** “Playwright checks that Docs remains in To Do after the rejection. The first Undo puts Review back and releases the capacity slot. The second removes Review while keeping Docs. These assertions exercise the UI, reducer, and history together. The targeted Vitest case isolates the full-column no-op. It checks the outcome, the original board identity, and the next Undo.”

Show each test’s actual runner output. The expected result is one passing test per command. In the full verification run, Vitest passed 27 checks and Playwright passed both Chromium scenarios.

## 17:00–20:00 · Decisions, limitations, and AI verification

**Show** the decision notes in the README, then return to `undo` and `moveTask` in the editor.

**Say** “I compared the inverse-action results with snapshots of the same sequence. All three Undos matched the previous task collections. Inverse actions keep each record small and explicit. They do require a reversal for each supported operation. Snapshots would be easier to reason about if future actions changed many fields at once.”

“I also tried checking capacity before the same-column guard. The unit test then failed by reporting a capacity error for a move that left occupancy unchanged. Putting the same-column check first restored the expected result.”

“The board is session-only, and its fixed limit keeps the history valid. Codex helped draft the spec, code, and tests. I can trace each rule to a check, show which tests failed before implementation, and reproduce the Playwright case and the clean-checkout commands.”

Describe only the parts of verification you personally reviewed or reran. Keep the fork branch link, full commit hash, recording link, and time spent handy for your submission.
