# Contributing to ApplyFlow

Thanks for your interest in improving ApplyFlow.

## Development workflow

1. Fork the repository and create a focused branch.
2. Install dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local` and add your Supabase development values.
4. Make one clear change per pull request.
5. Run `npm run lint` and `npm test` before submitting.

## Pull requests

- Explain the problem and the approach used to solve it.
- Include screenshots for visible interface changes.
- Keep unrelated formatting or dependency changes out of the pull request.
- Never commit database secrets, service-role keys, or real user data.

## Reporting bugs

Include the browser, steps to reproduce, expected behavior, actual behavior, and any non-sensitive console output that helps explain the problem.
