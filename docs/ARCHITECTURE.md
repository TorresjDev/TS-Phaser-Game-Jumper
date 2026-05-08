# Architecture

This document explains how Jumper is structured as a simple Phaser + TypeScript sandbox.

## Runtime flow

Scene order:

1. `Boot` loads minimal startup assets.
2. `Preloader` loads gameplay and UI assets.
3. `MainMenu` handles player entry.
4. `Leaderboard` displays saved high scores and timestamps.
5. `Game` runs active gameplay loop.
6. `GameOver` handles fail state and restart flow.

The scene list is wired in `src/main.ts`.

## Core modules

- `src/main.ts`: game config, canvas sizing, physics baseline, scene registration
- `src/scenes/Game.ts`: platformer gameplay, countdown timer, scoring, bomb damage, pause/settings UI
- `src/scenes/Leaderboard.ts`: dedicated leaderboard page with historical score dates
- `src/controls/MobileControls.ts`: touch controls with resize-aware layout
- `src/config/settings.ts`: persisted gameplay/audio settings
- `src/config/leaderboard.ts`: persisted leaderboard storage and helpers
- `src/scenes/*`: isolated scene classes for lifecycle clarity

## Assets and public files

- Static assets live under `public/assets`.
- Production build copies required assets into `dist/`.
- UI styling is served from `public/style.css`.

## Build system

- Development config: `webpack/config.js`
- Production config: `webpack/config.prod.js`
- TypeScript transpilation via `ts-loader`
- Asset handling via `file-loader` and copy plugin patterns

## Deployment model

GitHub Actions builds on push to `main` and deploys `dist/` to GitHub Pages.

When changing repository name, ensure `publicPath` in production webpack config matches the new Pages subpath.

## Extension points for contributors

- Add new scenes and register in `src/main.ts`
- Expand gameplay states in `Game.ts` (powerups, enemies, wave logic)
- Add persistent progression (high score, unlocks) with local storage
- Tune gameplay settings UX (pause/menu sliders, lives, accessibility controls)
- Improve mobile UX (button placement presets, haptics, accessibility)
