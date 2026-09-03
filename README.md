<div align="center">

# ApplyFlow

**A secure, focused workspace for moving every job opportunity forward.**

[![Netlify Status](https://api.netlify.com/api/v1/badges/ba8f4f23-fcbd-4e75-b9a9-84ea4ef0cd49/deploy-status)](https://app.netlify.com/projects/applyflow-career-tracker/deploys)
[![CI](https://github.com/shah-hadi/applyflow/actions/workflows/ci.yml/badge.svg)](https://github.com/shah-hadi/applyflow/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=111)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](LICENSE)

A private, full-stack job application tracker for organizing opportunities, follow-ups, interviews, and offers in one focused workspace.

[**Open the live application →**](https://applyflow-career-tracker.netlify.app)

</div>

![ApplyFlow dashboard preview](public/og.png)

## Product tour

| Workspace | Capability |
| --- | --- |
| **Pipeline** | Track opportunities across stages, priorities, dates, companies, and contacts |
| **Follow-ups** | Plan the next action so promising applications do not disappear into a spreadsheet |
| **Interviews** | Keep preparation notes and important context attached to each opportunity |
| **Activity** | Review a chronological history of changes and progress |
| **Analytics** | Understand pipeline totals, stage distribution, and recent momentum |
| **Portability** | Import and export CSV data without locking information into the product |

## Highlights

- Secure email and password authentication with Supabase Auth
- Per-user application data protected by PostgreSQL row-level security
- Application pipeline with stages, priorities, notes, contacts, and dates
- Search, filters, sorting, activity history, and dashboard metrics
- Follow-up planning and interview preparation workflows
- CSV import and export for data portability
- Responsive interface designed for desktop and mobile
- Production deployment on Netlify

## Architecture

```text
Browser
  ↓ authenticated Next.js application
Supabase Auth
  ↓ verified user identity
PostgreSQL + row-level security
  ↓ user-owned application records
Dashboard, workflow history, analytics, and CSV tools
```

## Tech stack

- Next.js 16, React 19, and TypeScript
- Supabase Auth and PostgreSQL
- Netlify Next.js runtime
- ESLint and Node's built-in test runner

## Local setup

Requirements: Node.js 22 or newer and a Supabase project.

```bash
git clone https://github.com/shah-hadi/applyflow.git
cd applyflow
npm ci
cp .env.example .env.local
```

Create a Supabase project, then apply the versioned database migration:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref your-project-ref
npx supabase@latest db push
```

Set these values in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Only the Supabase publishable key belongs in the browser application. Never expose a secret or service-role key.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production server locally |
| `npm run lint` | Check code quality |
| `npm test` | Build and run workflow tests |

## Deployment

The repository includes `netlify.toml`. To deploy your own copy:

1. Import this repository into Netlify.
2. Add the three variables from `.env.example` in Netlify's environment settings.
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
4. Add the same production URL to the allowed redirect URLs in Supabase Auth.
5. Deploy the `main` branch.

## Project documentation

- [Architecture](docs/ARCHITECTURE.md) — authentication, data ownership, application state, and deployment
- [Database migration](supabase/migrations/20260817204111_create_applyflow_schema.sql) — tables, indexes, grants, and row-level security policies
- [Contributing](CONTRIBUTING.md) — development workflow and pull-request expectations
- [Security policy](SECURITY.md) — security model and responsible disclosure

## Security model

The frontend uses a Supabase publishable key. PostgreSQL row-level security restricts reads and writes to rows owned by the authenticated user. Authentication sessions are managed by Supabase, and private database credentials are not included in this repository.

## License

Released under the [MIT License](LICENSE).
