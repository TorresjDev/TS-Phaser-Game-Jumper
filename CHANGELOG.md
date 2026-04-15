# Changelog

All notable changes to this project are documented in this file.

The format is inspired by Keep a Changelog and follows semantic versioning where practical.

## [Unreleased]

### Added
- Developer experience tooling: TypeScript typecheck, ESLint, and Prettier scripts.
- Contributor documentation: architecture, contribution workflow, security, and code of conduct docs.
- CI workflow to validate pull requests with install, typecheck, lint, and build.
- Node version pinning via `.nvmrc`.
- Gameplay settings system with in-menu and in-game controls.
- Dedicated leaderboard scene with persisted score history and timestamps.
- Game over actions for replay, main menu, and leaderboard navigation.
- Countdown gameplay loop with coin-based time extensions (`+3s` per coin).
- In-place bomb damage feedback and improved contact reliability checks.

### Changed
- Upgraded Phaser to `3.90.x`.
- Upgraded build toolchain dependencies to latest compatible stable versions.
- Reworked README to focus on clone-and-go onboarding and deploy clarity.
- Polished menu and pause UI layouts for clearer interaction and spacing.

## [3.1.1] - Existing Release

### Notes
- Baseline release prior to documentation and tooling refresh.
