# Contributing

Thanks for your interest in improving Jumper.

## Local setup

1. Fork and clone the repository.
2. Install dependencies:
   - `npm install`
3. Start local development:
   - `npm start`

## Branch naming

Use a descriptive branch name:

- `feat/add-powerups`
- `fix/mobile-input-bug`
- `docs/update-readme`

## Before opening a PR

Run the full local quality check:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

If formatting is needed:

- `npm run format:fix`

## Pull request checklist

- Clear title and description of the change and motivation.
- Screenshots or video for visual/gameplay updates.
- Linked issue when relevant.
- No unrelated refactors mixed into focused PRs.

## Commit style

Conventional-style prefixes are recommended:

- `feat:`
- `fix:`
- `docs:`
- `chore:`
- `refactor:`
- `test:`

## Good first contributions

- Gameplay polish (particles, camera shake, juice effects)
- Mobile control improvements
- Accessibility and input options
- Documentation and examples
