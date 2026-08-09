# Handoff

## Goal

Provide a polished local dashboard that demonstrates the visual experience of remote race-car telemetry without implying a working vehicle integration.

## Current status

Implementation is complete on `codex/mock-telemetry-dashboard`. The project is a private local/single-user visual prototype with deterministic simulated data. It is published to the private `Angry-TacoZ/race-telemetry` repository with draft PR #1 open against `main`.

## Decisions

- React, TypeScript, and Vite; localhost-only.
- Canvas trend plots and an SVG circuit trace.
- Fixed-step 50 Hz mock engine with a bounded 60-second ring buffer.
- Neutral `Car 01` / `Test Circuit` identity.
- Coolant warning uses two-second dwell and five-second clear hysteresis.
- Remote link loss freezes values and exposes sample age.

## Changed files

- Dashboard UI and styling under `src/`.
- Simulator and state machine under `src/telemetry/`.
- Tests, verification contract, and project documentation.

## Verification

- Canonical verifier passed on 2026-08-09: ESLint, TypeScript, 14 unit/component tests, and production build.
- Predeployment secret/API exposure scan passed.
- Source inspection found no application network, Firebase, or WebSocket calls.
- Playwright exercised healthy, warning, critical, expanded-control, and stale-link states with zero console errors.
- Layout visually inspected at 1280×720, 1440×900, 1920×1080, 2560×1440, and 3840×2160.
- Five simulated minutes remain within the 3,000-sample history bound.

## Next task

Review and merge draft PR #1, then decide whether the next coherent change is team branding or a separately designed real telemetry adapter.

## Risks or blockers

- This is simulated data and must not be used for vehicle decisions.
- Real telemetry will require a separate authenticated ingestion and transport layer.
