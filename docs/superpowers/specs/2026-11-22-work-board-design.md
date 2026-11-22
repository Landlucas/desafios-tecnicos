# Case 01 · Work Board with History

**Focus** — Front-end engineering with an emphasis on reliable state transitions and observable Undo behavior. The [official case](../../../casos/01-quadro-de-trabalho.md) defines the contract.

| Acceptance criterion | Verification |
| --- | --- |
| Create a task with a text ID and title in `a_fazer`. List each column in ascending ID order. | Vitest creation and ordering checks. Playwright checks both new tasks appear in To Do in order. |
| Allow moves between all three columns. Default In Progress to two and lock the configured limit when the board starts. | Vitest move matrix and default boundary. Playwright sets one, shows the capacity, and reloads to the default setup. |
| Unknown ID or column and moves into full `em_andamento` fail without changing the board or history. Same-column moves, even when full, have no effect. | Vitest identity and outcome assertions. Playwright verifies the rejected move and its effect on the next Undo, and separately verifies no-change feedback. |
| Undo is last in, first out across successful creations and moves. It consumes history, restores a previous column or removes a creation, and returns `nada_a_desfazer` when empty. | Vitest empty and full reversal checks. Playwright reverses Review's move, then its creation, and checks when Undo is available. |
| Distinguish success, failure, and no change. Keep the board in memory and reset on refresh. Use English labels and keyboard-operable controls. | Playwright checks the live feedback and reload. Keyboard path uses native controls, tested through Tab and Enter. |

## Decisions and assumptions

- Store one inverse action per successful change. Full snapshots are an alternative that simplifies restoration but retains a task collection for every change. An inverse entry needs only the task ID and, for a move, its previous column.
- Test for a same-column move after validating the task and destination and before checking capacity. A move within In Progress leaves occupancy unchanged.
- IDs are user-entered, case-sensitive, trimmed, unique, and sorted by JavaScript string comparison. Titles are trimmed. Blank IDs and titles are rejected. Limits are nonnegative safe integers. Zero disables entry into In Progress.
- Use a one-time setup step and a pure TypeScript domain. The React reducer holds the board and the latest feedback. No persistent storage is needed.

## React structure

- Give each component a dedicated file. The app shell switches between setup and the board screen. The board screen owns the reducer and delegates form, column, card, and feedback rendering.
- Keep draft values in their forms. A successful creation clears the draft and focuses the ID field. A failed creation preserves the draft. Successful moves keep keyboard focus on the moved card.
