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

## Templates

### SPA (Single Page Application)

A client-side only application with routing:

```bash
pnpm create effex my-app --template spa
```

Includes:
- `@effex/dom` - DOM rendering
- `@effex/router` - Client-side routing
- `@effex/vite-plugin` - File-based routing
- Vite configuration
- Example routes

### SSR (Server-Side Rendering)

A full-stack application with SSR, loaders, and actions:

```bash
pnpm create effex my-app --template ssr
```

Includes:
- `@effex/platform` - Full-stack framework
- `@effex/vite-plugin` - File-based routing + SSR
- Server entry for SSR
- Client hydration
- Example routes with loaders
- Vite SSR configuration

## Project Structure

### SPA Template

```
my-app/
├── src/
│   ├── routes/
│   │   ├── _index.ts      # Home page
│   │   └── about.ts       # About page
│   ├── generated/
│   │   └── routes.ts      # Auto-generated
│   └── main.ts            # Client entry
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### SSR Template

```
my-app/
├── src/
│   ├── routes/
│   │   ├── _index.ts      # Home page
│   │   └── about.ts       # About page
│   ├── generated/
│   │   └── routes.ts      # Auto-generated
│   ├── client.ts          # Client hydration
│   ├── server.ts          # Production server
│   └── server-entry.ts    # SSR entry
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Development

After creating your project:

```bash
cd my-app
pnpm install
pnpm dev
```

## Building

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Options

```
create-effex <project-name> [options]

Options:
  --template <template>  Template to use (spa, ssr)
  --help                 Show help
  --version              Show version
```
