# General Instructions

## Communication

* Respond in Russian unless asked otherwise.
* Be concise.
* Explain reasoning for architecture/design/debugging decisions.

## Tools

* **Check `memory` first for known issues/solutions** — `search` with `query` and `scope: "all-projects"` before debugging anything. Call tools by their exact registered path (e.g. `tools.memory({...})` inside `execute`, not a bare `memory(...)`); confirm a tool's name in the catalog before calling it.
* Use codebase-memory-mcp first for code analysis when relevant; fall back to other tools if unavailable or insufficient.
* Check real-world examples via GitHub code search for unfamiliar APIs.
* Use repo's canonical build targets over ad-hoc commands.

## Paid API Calls

* Any external API that charges per call (video/image generation, paid inference, media jobs) requires explicit user approval first.
* Before asking, state the model, key parameters and the exact expected cost; never run or retry such calls unprompted.

## Planning & Reporting

* Outline plan before coding for 3+ step tasks.
* Report progress at milestones; final summary: changes, verification, risks.

## Software Engineering

* Simple, idiomatic solutions over clever abstractions.
* Follow existing project conventions.
* Stdlib first; add dependencies only for clear value.
* Keep deps explicit; avoid hidden global state.
* Don't refactor unrelated code.
* Preserve existing behavior unless changing it is the task.
* Smallest correct change.
* Check error handling; don't silently ignore errors.
* Consider concurrency, cancellation, resource ownership, shutdown.

## Tests

* Run relevant tests after changes.
* Report checks that were not run and explain why.
* Focused tests first, then broader.
* Don't modify tests to make them pass unless behavior intentionally changed.
* Add/update test when fixing a bug.

## Git

* No commits unless requested.
* No history rewrite unless requested.
* Don't discard unrelated user changes.
* Conventional Commits; include scope.

## Changes

Before: inspect code, identify conventions, smallest reasonable change.
After: review diff, run formatting/linting/tests, report changes + verification.

## User Changes

* Assume uncommitted changes intentional.
* Never revert/reset/overwrite without permission.
* On conflicts: inspect diff, preserve unrelated changes.

## Files

* Save user-requested exportable artifacts to `~/Downloads/` and report their paths. Create project files in the appropriate repository location.
