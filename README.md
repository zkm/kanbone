# Kanbone

[![Deploy](https://github.com/zkm/kanbone/actions/workflows/deploy.yml/badge.svg)](https://github.com/zkm/kanbone/actions/workflows/deploy.yml)
[![Live demo](https://img.shields.io/website?url=https%3A%2F%2Fzkm.github.io%2Fkanbone%2F&label=live%20demo)](https://zkm.github.io/kanbone/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Backbone.js](https://img.shields.io/badge/Backbone.js-0071B5?logo=backbonedotjs&logoColor=white)
![cash-dom](https://img.shields.io/badge/cash--dom-555555)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-60A5FA?logo=biome&logoColor=white)
![Yarn](https://img.shields.io/badge/Yarn-4-2C8EBB?logo=yarn&logoColor=white)
![Node.js 24](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?logo=githubpages&logoColor=white)

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
yarn install
yarn dev      # start the dev server
yarn build    # typecheck + production build
yarn preview  # preview the production build
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
