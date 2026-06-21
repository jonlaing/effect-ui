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

### SSG (Static Site Generation)

A pre-rendered static site with client-side hydration. Good for portfolios, marketing sites, documentation, and blogs:

```bash
pnpm create effex my-app --ssg
```

Includes:
- `@effex/dom` — DOM rendering and reactivity
- `@effex/router` — Routing (shared between build and client)
- `@effex/platform` — Static site generation via `buildStaticSite`
- `@effex/vite-plugin` configured in `ssg` mode — runs the static build after the client bundle
- Client hydration entry point

Routes opt into static generation via `Route.static({ paths, load, render })`. The `paths` function returns all parameter sets to build; the `load` function runs at build time per path. Output is fully hydratable — animations and interactive components work the same as SSR once the client bundle loads.

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

### SSG Template

```
my-app/
├── src/
│   ├── App.ts           # Root layout (shared build/client)
│   ├── client.ts        # Client hydration entry
│   ├── entry.ts         # Vite SSG entry (exports router + app + document)
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

### SSG

```bash
pnpm build     # Build client bundle + generate static HTML for all Route.static routes
pnpm preview   # Preview the static site locally
```

The build outputs static HTML pages plus a hashed client bundle to `dist/`. Deploy `dist/` to any static host.

## CLI Options

```
create-effex <project-name> [options]

Options:
  --spa          Use SPA template
  --ssr          Use SSR template
  --ssg          Use SSG template
  --no-install   Skip dependency installation
  --help         Show help
  --version      Show version
```

If both a project name and a template flag are provided, all prompts are skipped.
