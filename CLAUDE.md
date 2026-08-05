# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Kanbone: a self-contained scrum/kanban board (multiple projects, draggable ticket cards, priorities,
story points, labels, assignees). No backend — everything persists to `localStorage`. It's built as an
exercise in how far Backbone.js goes with a modern toolchain: TypeScript (strict), Vite, and
[cash-dom](https://github.com/fabiospampinato/cash) (a ~6kb jQuery-shaped DOM library) standing in for
jQuery, since `Backbone.View` needs a jQuery-shaped `$`.

## Commands

Package manager is Yarn Berry (`yarn@4.18.0`, `nodeLinker: node-modules`) — use `yarn`, not `npm`.

```bash
yarn dev            # start the Vite dev server
yarn build           # tsc -b (typecheck) + vite build
yarn preview          # preview the production build

yarn test             # run the full vitest suite once
yarn test:watch       # vitest in watch mode
yarn vitest run src/collections/Tickets.test.ts   # run a single test file
yarn vitest run -t "name of test"                 # run tests matching a name

yarn check           # biome check (lint + format, read-only)
yarn check:fix        # biome check --write (lint + format, auto-fix)
yarn lint / yarn lint:fix
yarn format / yarn format:check
```

Tests run with `NODE_OPTIONS=--no-experimental-webstorage` (already baked into the `test`/`test:watch`
scripts) — needed because jsdom's `localStorage` conflicts with Node's experimental built-in one.

There is no CI config in this repo; `yarn check` + `yarn test` + `yarn build` is the closest thing to a
full verification pass before considering a change done.

## Architecture

### Data flow: Backbone models/collections → custom localStorage sync

There is no server. `Ticket` and `Project` (in `src/models/`) each override `sync()` to call
`localStorageSync` (`src/lib/localStorageSync.ts`) instead of Backbone's default AJAX sync. That
function resolves a `LocalStorageStore` off the model or its collection and does a synchronous
create/read/update/delete against `localStorage`, keyed as `backbone:<name>` (`backbone:projects`,
`backbone:tickets`), with records stored as `{ [id]: model.toJSON() }`. `Tickets` and `Projects`
(`src/collections/`) each own a `LocalStorageStore` instance and also override `sync()` themselves so
collection-level `fetch()`/`create()` route through the same store.

`Tickets` has the board-specific query/mutation helpers: `byProject`, `byColumn` (filtered + sorted by
`order`), and `moveTicket(ticketId, toStatus, orderedIds)` — called once per drop with the column's
final DOM order, so it just renumbers `order` 0..n-1 for that column and updates `status` only on the
dragged ticket. Gaps in `order` across other columns are harmless since `byColumn` only compares within
a column.

Theme preference (`light`/`dark`/`system`) is separate, stored under `kanbone:theme` and applied via
`document.documentElement.dataset.theme` (`src/lib/theme.ts`).

### View hierarchy

```
AppView            shell: mobile topbar/hamburger drawer, sidebar slot, board slot
 └─ ProjectSidebarView   project list + swatch colors, theme toggle, "new project" trigger
     └─ ProjectFormView  new-project form (name + color), overlaid on body
 └─ BoardView            one per active project; owns all ColumnViews + TicketCardViews
     ├─ ColumnView (×5)  one per COLUMNS entry; drag-over/drop target, "add ticket" trigger
     │   └─ TicketCardView  draggable card; re-renders on model `change`
     └─ TicketDetailView    modal, appended to document.body; the only way to edit/move a
                            ticket by keyboard (native HTML5 DnD has no keyboard path)
```

`BoardView.renderCards()` is the one place that reconciles model state → DOM: for each column it
recomputes `tickets.byColumn(...)`, reuses existing `TicketCardView`s by ticket id (creating new ones
as needed), and removes card views for tickets no longer visible. It's re-run on
`add remove reset change:status change:order` from the `Tickets` collection, and also on a card's
`card:dragend` event — native drag-and-drop doesn't fire `drop` on a cancelled drag (dropped outside a
valid target, or Escape), so `dragend` forces a re-render from model state to keep the DOM from getting
out of sync with a drag that never committed.

Views communicate up via Backbone events (`trigger`/`listenTo`), not callbacks: e.g. `ColumnView`
triggers `column:addTicket`, `TicketCardView` triggers `card:open`/`card:dragend`,
`TicketDetailView`/`ProjectFormView` trigger `detail:close`/`project:created`/`form:cancel`. `BoardView`
and `ProjectSidebarView` own the lifecycle of the modal/form views they spawn (create, append to
`document.body`, listen for the close event, `remove()`).

### Routing

`BoardRouter` (`src/router.ts`) maps `project/:id` → `AppView.setActiveProject`, and any other/no hash
→ redirect to the first project's id (`replace: true`, no history entry). It's a thin adapter: it holds
no board state itself, just delegates to `AppView`.

### Board structure as data

`src/lib/board.ts` defines `COLUMNS` (backlog → todo → in_progress → review → done) and `PRIORITIES` as
`as const` arrays, with `TicketStatus`/`Priority` derived from them via `(typeof X)[number]["id"]`.
This is the single source of truth for both the column set and status/priority option lists rendered
in `ColumnView` and `TicketDetailView` — add a column or priority here, not by editing views directly.

### Manual HTML escaping

Views build markup via template-string `innerHTML` (no auto-escaping like JSX/templating engines
provide), so any interpolated user data must go through `escapeHtml()` (`src/lib/escapeHtml.ts`). It
escapes both text-node characters and `"`/`'` (needed because callers also interpolate into
`value="..."` attributes, and quote-encoding is an attribute-serialization rule that plain
`textContent`/`innerHTML` round-tripping doesn't cover).

### Backbone/TypeScript interop gotchas (already handled, but relevant if touching these files)

- **View constructor options, not class fields**: `tagName`/`className`/`attributes`/`events` must be
  passed through `super({ ...options })`, not set as TS class fields — `Backbone.View`'s constructor
  reads them synchronously before a subclass field initializer would run. See `TicketCardView`,
  `ColumnView`, `TicketDetailView` constructors for the pattern.
- **Collection `model` option, not a class field**: `Tickets`/`Projects` pass `{ model: Ticket }` /
  `{ model: Project }` through `super(models, options)` rather than a class field, since
  `Collection`'s constructor can synchronously call `reset()` for any initial `models` before a class
  field default would be set.
- **`noUnusedLocals` is off** in `tsconfig.json` deliberately: Backbone dispatches `events`/`routes`
  handlers by method-name string (e.g. `"click .foo": "onFoo"`), which TS can't see as a "read" and
  would otherwise flag as unused.

## Style

Biome (`biome.json`) handles both lint and format: 2-space indent, double quotes, 100-char line width,
import organization on save. Notable deviations from Biome's recommended preset:
`noUnusedPrivateClassMembers` and `noNonNullAssertion` are both off — the codebase uses `!` freely for
DOM queries known to exist post-`render()` (e.g. `el.querySelector(...)!`).
