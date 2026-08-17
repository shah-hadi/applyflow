# ApplyFlow

A polished job-application command center for tracking opportunities from saved role to offer.

![ApplyFlow social preview](public/og.png)

## Features

- Live metrics for applications, interviews, offers, and response rate
- Search and stage filtering
- Add, inspect, and delete application records
- Responsive, accessible interface
- Cloudflare D1 persistence with Drizzle migrations
- Optimistic updates for a fast interface

## Tech stack

React 19, TypeScript, vinext, Tailwind CSS, Cloudflare Workers, D1, and Drizzle ORM.

## Run locally

Requires Node.js 22.13 or newer.

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000.

## Validate

\`\`\`bash
npm run lint
npm test
\`\`\`

Generate a migration after changing the database schema with \`npm run db:generate\`.

## Architecture

\`\`\`text
Browser UI
   │
   ├── Search, filters, optimistic updates
   │
   └── /api/applications
            │
            └── Drizzle ORM ── Cloudflare D1
\`\`\`

## Roadmap

- Drag-and-drop Kanban pipeline
- Per-user authentication and record ownership
- Follow-up reminders and CSV import/export
- End-to-end workflow tests

## License

MIT
