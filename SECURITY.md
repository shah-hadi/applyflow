# Security policy

## Reporting a vulnerability

Do not open a public issue for vulnerabilities involving authentication, authorization, exposed data, or credentials. Contact the repository owner privately through the GitHub profile instead.

Please include the affected workflow, reproduction steps, potential impact, and a suggested remediation when possible.

## Security model

- The browser receives only a Supabase publishable key.
- PostgreSQL row-level security restricts records to their authenticated owner.
- Secret and service-role keys must never be placed in `NEXT_PUBLIC_*` variables.
- Environment files are ignored except for the safe `.env.example` template.
