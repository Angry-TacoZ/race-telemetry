# Local Mock Race Telemetry Dashboard

A presentation-ready, engineer-facing race telemetry dashboard driven entirely by deterministic mock data. It runs locally and does not connect to a vehicle, Firebase, a backend, or any external API.

> **SIMULATED DATA:** This project demonstrates the user interface only. It is not suitable for vehicle monitoring or operational decisions.

## Start the demo

Requirements: Node.js 20 or newer and npm.

```powershell
npm.cmd install
npm.cmd run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The server binds only to the local loopback interface.

The 75-second scenario starts automatically:

1. Stable warm running.
2. A representative racing lap.
3. Rising coolant temperature.
4. Warning and critical engineer states.

Select **DEMO** in the upper-right corner, or press `D`, to pause, restart, change speed, jump to a scenario, or simulate satellite-link loss. Audio remains muted until explicitly armed.

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
C:\Users\angry\.codex\sessions\scripts\verify-project.cmd --project C:\Users\angry\.codex\sessions\projects\race-telemetry
```

## Prototype boundary

- No CAN bus, GPS receiver, satellite modem, database, authentication, or remote transport exists.
- No data persists between browser sessions.
- The simulator generates 50 fixed-step samples per second and retains at most 60 seconds in memory.
- The mock engine is isolated under `src/telemetry`, providing a future seam for a real telemetry adapter.

