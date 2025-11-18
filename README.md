# Geospatial MapLibre Frontend Demo

A monorepo for geospatial sensor data visualization with interactive mapping capabilities.

## Monorepo Structure

This repository uses [Turborepo](https://turbo.build/) for centralized build and development workflows, and [Bun workspaces](https://bun.sh/docs/install/workspaces) for package management.

### Projects

- **`apps/sensor-map`** - Frontend React application with MapLibre GL for interactive sensor data visualization
  - Interactive map with time-based filtering
  - Network and time range filtering
  - See [`apps/sensor-map/README.md`](apps/sensor-map/README.md) for detailed documentation

- **`apps/backend`** - Express.js API server for sensor data filtering and serving
  - RESTful API endpoints for sensor data
  - Time, network, and bounding box filtering
  - See [`apps/backend/README.md`](apps/backend/README.md) for detailed documentation

- **`apps/shared-schemas`** - Shared Zod schemas for type-safe data validation
  - Used by both frontend and backend
  - Ensures consistent data structures across the stack
  - See [`apps/shared-schemas/README.md`](apps/shared-schemas/README.md) for detailed documentation

## Getting Started

```bash
# Install all dependencies
bun install

# Run all projects in development mode
bun run dev

# Build all projects
bun run build

# Start production servers
bun run start

# Preview production builds
bun run preview
```

## Tech Stack

- **Turborepo** - Monorepo build system
- **Bun** - Package manager and runtime
- **TypeScript** - Type safety across all projects
- **Zod** - Schema validation (via shared-schemas)
- **React 18** - Frontend framework
- **Express** - Backend framework
- **MapLibre GL** - Map rendering

For detailed information about each project's tech stack and features, see the respective README files in each project directory.
