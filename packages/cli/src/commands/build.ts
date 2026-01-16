/**
 * Build command.
 *
 * Builds the application for production:
 * 1. Runs Vite build for client bundle
 * 2. Runs SSG to generate static HTML files
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import pc from "picocolors";
import { build as viteBuild, type InlineConfig } from "vite";

export interface BuildOptions {
  ssg: boolean;
  outDir: string;
}

export async function build(options: BuildOptions): Promise<void> {
  const root = process.cwd();
  const startTime = Date.now();

  console.log();
  console.log(pc.cyan(pc.bold("  effex build")));
  console.log();

  // Look for vite.config.ts or vite.config.js
  const viteConfigPath = findViteConfig(root);
  if (!viteConfigPath) {
    console.error(
      pc.red("  Error: No vite.config.ts or vite.config.js found."),
    );
    console.error(pc.dim("  Make sure you're in an Effex project directory."));
    process.exit(1);
  }

  // Step 1: Build client bundle
  console.log(pc.cyan("  Building client bundle..."));

  const clientConfig: InlineConfig = {
    root,
    configFile: viteConfigPath,
    build: {
      outDir: options.outDir,
    },
  };

  try {
    await viteBuild(clientConfig);
    console.log(pc.green("  Client bundle built successfully."));
    console.log();
  } catch (error) {
    console.error(pc.red("  Failed to build client bundle:"));
    throw error;
  }

  // Step 2: Run SSG (if enabled)
  if (options.ssg) {
    console.log(pc.cyan("  Generating static pages..."));

    try {
      await runSSG(root, options.outDir);
      console.log(pc.green("  Static pages generated successfully."));
      console.log();
    } catch (error) {
      if (error instanceof SSGSkippedError) {
        console.log(pc.yellow(`  ${error.message}`));
        console.log();
      } else {
        console.error(pc.red("  Failed to generate static pages:"));
        throw error;
      }
    }
  }

  const duration = Date.now() - startTime;
  console.log(
    pc.green(pc.bold("  Build completed")) + pc.dim(` in ${duration}ms`),
  );
  console.log();
}

class SSGSkippedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SSGSkippedError";
  }
}

/**
 * Run SSG by looking for an effex.config.ts or ssg-entry.ts file.
 */
async function runSSG(root: string, outDir: string): Promise<void> {
  // Look for SSG entry file
  const ssgEntryPath = findSSGEntry(root);

  if (!ssgEntryPath) {
    throw new SSGSkippedError(
      "No SSG entry found (ssg-entry.ts or effex.config.ts). Skipping SSG.",
    );
  }

  // We need to dynamically import the SSG entry
  // Since it's TypeScript, we'll use tsx or ts-node to run it
  // For now, we'll check if the compiled version exists in dist

  // Import the SSG entry using tsx
  // We'll spawn a subprocess to handle TypeScript
  const { execSync } = await import("node:child_process");

  // Check if tsx is available
  try {
    execSync("npx tsx --version", { stdio: "ignore" });
  } catch {
    throw new Error(
      "tsx is required for SSG. Install it with: pnpm add -D tsx",
    );
  }

  // Create a temporary script that runs SSG
  const tempScript = path.join(root, ".effex-ssg-runner.mjs");
  const absoluteOutDir = path.resolve(root, outDir);
  const ssgEntryImport = pathToFileURL(ssgEntryPath).href;

  const scriptContent = `
import { buildStaticPages } from "@effex/platform/server";

async function main() {
  // Dynamic import the SSG entry
  const entry = await import("${ssgEntryImport}");

  if (!entry.routes || !entry.components || !entry.createApp) {
    console.error("SSG entry must export: routes, components, createApp");
    process.exit(1);
  }

  // staticRouteConfig is optional - if not present, no static pages will be generated
  const staticRouteConfig = entry.staticRouteConfig ?? {};

  // Check if there are any static routes
  const hasStaticRoutes = Object.values(staticRouteConfig).some(c => c?.static);
  if (!hasStaticRoutes) {
    console.log(JSON.stringify({ pages: 0, duration: 0, paths: [], skipped: true }));
    return;
  }

  const result = await buildStaticPages({
    routes: entry.routes,
    staticRouteConfig,
    components: entry.components,
    createApp: entry.createApp,
    outDir: "${absoluteOutDir}",
    generateDocument: entry.generateDocument,
    layer: entry.layer,
  });

  console.log(JSON.stringify({
    pages: result.pages.length,
    duration: result.duration,
    paths: result.pages.map(p => p.path),
  }));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
`;

  try {
    fs.writeFileSync(tempScript, scriptContent);

    // Run with tsx
    const output = execSync(`npx tsx "${tempScript}"`, {
      cwd: root,
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "inherit"],
    });

    // Parse result
    const result = JSON.parse(output.trim());

    if (result.skipped) {
      console.log(
        pc.dim(
          "  No static routes found. Add Route.define({ static: true }) to enable SSG.",
        ),
      );
    } else {
      console.log(
        pc.dim(`  Generated ${result.pages} pages in ${result.duration}ms`),
      );
      for (const pagePath of result.paths) {
        console.log(pc.dim(`    ${pagePath}`));
      }
    }
  } finally {
    // Clean up temp script
    if (fs.existsSync(tempScript)) {
      fs.unlinkSync(tempScript);
    }
  }
}

function findViteConfig(root: string): string | null {
  const candidates = [
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mts",
    "vite.config.mjs",
  ];

  for (const candidate of candidates) {
    const configPath = path.join(root, candidate);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }

  return null;
}

function findSSGEntry(root: string): string | null {
  const candidates = [
    "ssg-entry.ts",
    "ssg-entry.tsx",
    "src/ssg-entry.ts",
    "src/ssg-entry.tsx",
    "effex.config.ts",
    "effex.config.tsx",
  ];

  for (const candidate of candidates) {
    const entryPath = path.join(root, candidate);
    if (fs.existsSync(entryPath)) {
      return entryPath;
    }
  }

  return null;
}
