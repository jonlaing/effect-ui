/**
 * Development server command.
 *
 * Starts Vite dev server with SSR middleware.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import pc from "picocolors";
import { createServer, type InlineConfig } from "vite";

export interface DevOptions {
  port: number;
  host?: string | boolean;
  open?: boolean;
}

export async function dev(options: DevOptions): Promise<void> {
  const root = process.cwd();

  console.log();
  console.log(pc.cyan(pc.bold("  effex dev")));
  console.log(pc.dim("  Starting development server..."));
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

  // Create Vite dev server
  const config: InlineConfig = {
    root,
    configFile: viteConfigPath,
    server: {
      port: options.port,
      host: options.host,
      open: options.open,
    },
  };

  try {
    const server = await createServer(config);
    await server.listen();

    const info = server.config.server;
    const protocol = info.https ? "https" : "http";
    const host = typeof info.host === "string" ? info.host : "localhost";
    const port = info.port ?? options.port;

    console.log();
    console.log(
      `  ${pc.green("ready")} ${pc.dim("in")} ${pc.bold(`${Date.now() - performance.now()}ms`)}`,
    );
    console.log();
    console.log(`  ${pc.cyan("Local:")}   ${protocol}://${host}:${port}`);

    if (info.host === true || info.host === "0.0.0.0") {
      const { networkInterfaces } = await import("node:os");
      const nets = networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name] ?? []) {
          if (net.family === "IPv4" && !net.internal) {
            console.log(
              `  ${pc.cyan("Network:")} ${protocol}://${net.address}:${port}`,
            );
          }
        }
      }
    }

    console.log();
    console.log(pc.dim("  Press Ctrl+C to stop"));
    console.log();
  } catch (error) {
    console.error(pc.red("  Failed to start dev server:"));
    throw error;
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
