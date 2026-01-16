/**
 * Effex CLI
 *
 * Commands:
 * - effex dev    Start development server with SSR
 * - effex build  Build for production (client + SSG)
 */

import { cac } from "cac";
import pc from "picocolors";

import { build } from "./commands/build.js";
import { dev } from "./commands/dev.js";

const cli = cac("effex");

cli
  .command("dev", "Start development server with SSR")
  .option("--port <port>", "Port to listen on", { default: 3000 })
  .option("--host [host]", "Host to listen on")
  .option("--open", "Open browser on startup")
  .action(async (options) => {
    try {
      await dev(options);
    } catch (error) {
      console.error(pc.red("Error:"), error);
      process.exit(1);
    }
  });

cli
  .command("build", "Build for production")
  .option("--no-ssg", "Skip static site generation")
  .option("--outDir <dir>", "Output directory", { default: "dist" })
  .action(async (options) => {
    try {
      await build(options);
    } catch (error) {
      console.error(pc.red("Error:"), error);
      process.exit(1);
    }
  });

cli.help();
cli.version("0.0.1");

cli.parse();
