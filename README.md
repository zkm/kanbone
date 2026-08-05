# Kanbone

A lightweight, self-contained scrum/kanban board — multiple projects, draggable ticket cards, priorities, story points, labels, assignees. No backend: everything persists to `localStorage`.

Built as an exercise in how far a "2010-era" library like [Backbone.js](https://backbonejs.org/) goes with a modern toolchain: TypeScript, Vite, and [cash-dom](https://github.com/fabiospampinato/cash) (a ~6kb jQuery-shaped DOM library) standing in for jQuery.

## Features

- Multiple projects with a color-coded sidebar switcher
- Fixed kanban columns: Backlog → To Do → In Progress → Review → Done
- Native HTML5 drag-and-drop, within and across columns — no DnD library
- Ticket cards with priority, story points, assignee, and labels
- A detail modal for full editing (also the only way to move a card by keyboard, since native drag-and-drop has none)

## Stack

- [Backbone.js](https://backbonejs.org/) — models, collections, views, router
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Vite](https://vitejs.dev/) — dev server and build
- [cash-dom](https://github.com/fabiospampinato/cash) — the `$` Backbone's views need, without jQuery
- `localStorage` — the only persistence layer; no server, no database

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

## Project structure

```
src/
  lib/          shared constants (columns/priorities) and the escapeHtml helper
  models/       Project, Ticket
  collections/  Projects, Tickets (+ the localStorage-backed sync layer)
  views/        sidebar, board, columns, cards, and the ticket detail modal
  router.ts     project/:id routing
  main.ts       bootstrap + demo data seeding
```
