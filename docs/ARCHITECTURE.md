# ApplyFlow architecture

## Overview

ApplyFlow is a client-focused Next.js application backed by Supabase Auth and PostgreSQL.

```text
Browser
  ├─ Next.js interface
  ├─ Supabase Auth session
  └─ Supabase Data API
       └─ PostgreSQL
            ├─ applications
            ├─ activities
            └─ row-level security
```

## Authentication

Users create an account or sign in with email and password. Supabase manages the browser session. The application responds to authentication state changes and clears user-specific state on sign-out.

## Data ownership

Application and activity rows include the authenticated user's ID. Row-level security policies enforce ownership for reads, inserts, updates, and deletes. The frontend publishable key does not bypass these policies.

## Application state

The primary interface loads the signed-in user's records, derives dashboard metrics in the browser, and persists workflow changes directly through the Supabase client. Activities record important changes for the timeline.

## Deployment

Netlify builds the `main` branch using the Next.js runtime. Public Supabase connection values and the canonical site URL are configured as Netlify environment variables.
