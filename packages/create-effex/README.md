# create-effex

CLI to scaffold new Effex projects.

## Usage

```bash
# With pnpm
pnpm create effex my-app

# With npm
npm create effex my-app

# With yarn
yarn create effex my-app
```

The CLI prompts for a project name (if not provided), template selection, and whether to install dependencies.

## Templates

### SPA (Single-Page Application)

A client-side only application with routing:

```bash
pnpm create effex my-app --spa
```

Includes:
- `@effex/dom` — DOM rendering and reactivity
- `@effex/router` — Client-side routing
- Vite dev server and build
- Example routes with a reactive counter

### SSR (Server-Side Rendering)

A full-stack application with server-side rendering and hydration:

```bash
pnpm create effex my-app --ssr
```

Includes:
- `@effex/dom` — DOM rendering and reactivity
- `@effex/router` — Routing (shared between server and client)
- `@effex/platform` — SSR rendering and data loading
- `@effex/vite-plugin` — Dev server with HMR and server-code stripping
- `@effect/platform` / `@effect/platform-node` — HTTP server
- Production server with static file serving
- Client hydration entry point

## Project Structure

### SPA Template

```
my-app/
├── public/
│   └── styles.css
├── src/
│   ├── App.ts           # Root layout with nav + Outlet
│   ├── main.ts          # Client entry point
│   └── routes.ts        # Route definitions and router
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### SSR Template

```
my-app/
├── public/
│   └── styles.css
├── src/
│   ├── App.ts           # Root layout (shared server/client)
│   ├── client.ts        # Client hydration entry
│   ├── server.ts        # Production HTTP server
│   ├── vite-entry.ts    # Vite dev server SSR entry
│   └── routes.ts        # Route definitions and router
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Development

After creating your project:

```bash
cd my-app
pnpm install   # if you skipped auto-install
pnpm dev
```

## Building

### SPA

```bash
pnpm build     # Build for production
pnpm preview   # Preview production build
```

### SSR

```bash
pnpm build     # Build client + server bundles
pnpm start     # Run production server
```

## CLI Options

```
create-effex <project-name> [options]

Options:
  --spa          Use SPA template
  --ssr          Use SSR template
  --no-install   Skip dependency installation
  --help         Show help
  --version      Show version
```

If both a project name and a template flag are provided, all prompts are skipped.
