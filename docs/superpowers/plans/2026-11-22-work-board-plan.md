# Work Board implementation plan

The [spec](../specs/2026-11-22-work-board-design.md) maps the brief to observable checks. Keep the app small enough to explain live.

1. **Domain** — Write Vitest checks for creation, lexical order in each column, all six moves, the capacity boundary, invalid inputs, no-ops, and Undo. Run against a behavior-free shell and observe assertion failures. Implement `createBoard`, `applyAction`, `tasksInColumn`, and `canUndo` in `src/board.ts` and rerun.
2. **Browser** — Write the Docs and Review sequence plus the keyboard, no-op, and refresh checks. Run Playwright against the empty shell. Implement setup, task creation, native move controls, status, and Undo using React's reducer. Rerun in Chromium.
3. **Review and delivery** — Check the effect of reversing guard order and compare inverse entries with snapshots on the Undo sequence. Run the README commands from a clean checkout, then document findings and prepare the 20-minute recording outline. Verify the commit on the user's fork.

Keep duplicate/blank input, zero capacity, same-column movement at capacity, returning to a previously full column through Undo, and keyboard submission within the checks above.

## React refactor

1. Capture the existing form reset, draft preservation, and focus behavior in the keyboard browser scenario and run it on the current app.
2. Extract each component into its own file and move the board screen reducer into a plain TypeScript module. Keep form drafts local and derive sorted columns from the board.
3. Run both suites and the production build. Update the recording outline's editor references and verify the pushed commit.
