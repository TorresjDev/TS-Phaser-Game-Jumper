# Jumper: TypeScript Phaser Sandbox

![GitHub Pages Deploy](https://github.com/TorresjDev/TS-Phaser-Game-Jumper/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-43853d.svg)
![Phaser](https://img.shields.io/badge/Phaser-3.90.0-orange.svg)

A clone-and-go Phaser 3 + TypeScript game starter built around a real playable platformer.

Play the live game on GitHub Pages: [Jumper Live](https://torresjdev.github.io/TS-Phaser-Game-Jumper/)

![Game Logo](/public/assets/images/ui/jumper-title.png)

## Why this repo exists

This project is both:

- a polished platformer you can play right away
- an open-source sandbox for developers to quickly build and ship Phaser games with TypeScript

The architecture is intentionally straightforward so contributors can jump in fast.

## Quick start (60 seconds)

```bash
git clone https://github.com/TorresjDev/TS-Phaser-Game-Jumper.git
cd TS-Phaser-Game-Jumper
npm install
npm start
```

The dev server starts on `http://localhost:8081`.

## Scripts

- `npm start`: run the dev server on port `8081`
- `npm run dev`: run the default webpack dev server config
- `npm run build`: create production build in `dist/`
- `npm run typecheck`: run TypeScript checks with no emit
- `npm run lint`: lint TypeScript files
- `npm run lint:fix`: lint and auto-fix where possible
- `npm run format`: check formatting with Prettier
- `npm run format:fix`: apply Prettier formatting

## Tech stack

- Phaser `3.90.x`
- TypeScript `5.9.x`
- Webpack `5.x`
- ESLint + Prettier
- GitHub Actions + GitHub Pages

## Project structure

```text
src/
  config/
    leaderboard.ts
    settings.ts
  controls/
    MobileControls.ts
  scenes/
    Boot.ts
    Preloader.ts
    MainMenu.ts
    Leaderboard.ts
    Game.ts
    GameOver.ts
  main.ts
public/
  assets/
webpack/
  config.js
  config.prod.js
```

For a deeper walkthrough, see `docs/ARCHITECTURE.md`.

## Controls

| Device | Action | Input |
| :--- | :--- | :--- |
| Desktop | Move | `Left` / `Right` arrows |
| Desktop | Move (alt) | `A` / `D` |
| Desktop | Jump | `Up` arrow / `W` / `Space` |
| Mobile | Move | On-screen left/right buttons |
| Mobile | Jump | On-screen jump button |

## How to play

- Move with `Left/Right` or `A/D`.
- Jump with `Up`, `W`, or `Space`.
- Avoid touching bombs; each hit costs one life (unless using unlimited lives mode).
- Collect coins before time runs out.
- Each coin adds `+3s` to the timer.
- Pause anytime to adjust edge wrap, volume, and starting lives.

## Gameplay essentials included

- configurable lives (`1`, `3`, `5`, `Unlimited`)
- persistent best-score tracking in local storage
- edge-wrap option (toggle in Settings)
- in-game pause menu with live settings updates
- in-game pause actions (resume, restart, return to menu)
- countdown gameplay loop with time pressure
- coin collection adds `+3s` per coin
- local top-score leaderboard with 3-character initials entry and timestamps
- dedicated leaderboard page + quick access from game over
- adjustable volume slider in menu and pause settings
- damage feedback flash effect on bomb hit

## Deployment

Deployment is automated with GitHub Actions:

- push to `main`
- workflow builds the project
- `dist/` is published to GitHub Pages

Important: production webpack config uses:

- `output.publicPath = "/TS-Phaser-Game-Jumper/"`

If you fork and rename the repository, update that value in `webpack/config.prod.js`.

## Contributing

Contributions are welcome. Start with:

- `CONTRIBUTING.md` for workflow and PR checks
- `CODE_OF_CONDUCT.md` for community expectations
- `SECURITY.md` for responsible reporting

## Changelog

Release notes live in `CHANGELOG.md`.

## License

MIT. See `LICENSE`.
