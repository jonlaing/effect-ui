import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import pc from "picocolors";
import prompts from "prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ProjectOptions {
  name: string;
  template: "ssr" | "spa" | "ssg";
  install: boolean;
}

const TEMPLATES = {
  ssr: "Full-stack SSR app with Effect HTTP server",
  spa: "Single-page app (client-only)",
  ssg: "Static site generation (pre-rendered HTML)",
};

async function main() {
  console.log();
  console.log(pc.bold(pc.cyan("  create-effex")));
  console.log(pc.dim("  Scaffold a new Effex application"));
  console.log();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const projectNameArg = args.find((arg) => !arg.startsWith("-"));
  const noInstall = args.includes("--no-install");
  const useSSR = args.includes("--ssr");
  const useSPA = args.includes("--spa");
  const useSSG = args.includes("--ssg");

  let options: ProjectOptions;

  // If all options provided via CLI, skip prompts
  if (projectNameArg && (useSSR || useSPA || useSSG)) {
    options = {
      name: projectNameArg,
      template: useSSR ? "ssr" : useSSG ? "ssg" : "spa",
      install: !noInstall,
    };
  } else {
    // Interactive mode
    const response = await prompts(
      [
        {
          type: projectNameArg ? null : "text",
          name: "name",
          message: "Project name:",
          initial: "my-effex-app",
          validate: (value: string) =>
            /^[a-z0-9-]+$/.test(value) ||
            "Name can only contain lowercase letters, numbers, and hyphens",
        },
        {
          type: useSSR || useSPA || useSSG ? null : "select",
          name: "template",
          message: "Select a template:",
          choices: [
            {
              title: `${pc.green("SSR")} - ${TEMPLATES.ssr}`,
              value: "ssr",
            },
            {
              title: `${pc.blue("SPA")} - ${TEMPLATES.spa}`,
              value: "spa",
            },
            {
              title: `${pc.magenta("SSG")} - ${TEMPLATES.ssg}`,
              value: "ssg",
            },
          ],
          initial: 0,
        },
        {
          type: noInstall ? null : "confirm",
          name: "install",
          message: "Install dependencies?",
          initial: true,
        },
      ],
      {
        onCancel: () => {
          console.log(pc.red("\n  Cancelled.\n"));
          process.exit(1);
        },
      },
    );

    options = {
      name: projectNameArg || response.name,
      template: useSSR
        ? "ssr"
        : useSSG
          ? "ssg"
          : useSPA
            ? "spa"
            : response.template,
      install: noInstall ? false : (response.install ?? true),
    };
  }

  const targetDir = path.resolve(process.cwd(), options.name);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    if (files.length > 0) {
      const { overwrite } = await prompts({
        type: "confirm",
        name: "overwrite",
        message: `Directory ${pc.yellow(options.name)} is not empty. Overwrite?`,
        initial: false,
      });

      if (!overwrite) {
        console.log(pc.red("\n  Cancelled.\n"));
        process.exit(1);
      }

      // Clear the directory
      fs.rmSync(targetDir, { recursive: true });
    }
  }

  console.log();
  console.log(
    `  ${pc.green("Creating")} ${pc.bold(options.name)} with ${pc.cyan(options.template.toUpperCase())} template...`,
  );
  console.log();

  // Create project directory
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy template files
  const templatesDir = path.resolve(__dirname, "..", "templates");
  copyTemplate(path.join(templatesDir, "base"), targetDir);
  copyTemplate(path.join(templatesDir, options.template), targetDir);

  // Update package.json with project name
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.name = options.name;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // Install dependencies
  if (options.install) {
    console.log(`  ${pc.cyan("Installing")} dependencies...`);
    console.log();

    const { execSync } = await import("node:child_process");

    try {
      // Detect package manager
      const pkgManager = detectPackageManager();
      execSync(`${pkgManager} install`, {
        cwd: targetDir,
        stdio: "inherit",
      });
      console.log();
    } catch {
      console.log(
        pc.yellow("\n  Failed to install dependencies. Run manually:\n"),
      );
      console.log(`    cd ${options.name}`);
      console.log(`    pnpm install`);
      console.log();
    }
  }

  // Print success message
  console.log(pc.green("  Done!") + " Your Effex app is ready.\n");
  console.log("  Next steps:\n");

  if (!options.install) {
    console.log(`    ${pc.cyan("cd")} ${options.name}`);
    console.log(`    ${pc.cyan("pnpm")} install`);
  } else {
    console.log(`    ${pc.cyan("cd")} ${options.name}`);
  }

  if (options.template === "ssr") {
    console.log(
      `    ${pc.cyan("pnpm")} dev          ${pc.dim("# Start dev server with SSR")}`,
    );
    console.log(
      `    ${pc.cyan("pnpm")} build        ${pc.dim("# Build for production (client + server)")}`,
    );
    console.log(
      `    ${pc.cyan("pnpm")} start        ${pc.dim("# Start production server")}`,
    );
  } else if (options.template === "ssg") {
    console.log(
      `    ${pc.cyan("pnpm")} dev          ${pc.dim("# Start dev server with SSR")}`,
    );
    console.log(
      `    ${pc.cyan("pnpm")} build        ${pc.dim("# Build and generate static HTML")}`,
    );
    console.log(
      `    ${pc.cyan("pnpm")} preview      ${pc.dim("# Preview the static site")}`,
    );
  } else {
    console.log(
      `    ${pc.cyan("pnpm")} dev          ${pc.dim("# Start Vite dev server")}`,
    );
    console.log(
      `    ${pc.cyan("pnpm")} build        ${pc.dim("# Build for production")}`,
    );
  }

  console.log();
}

function copyTemplate(src: string, dest: string) {
  if (!fs.existsSync(src)) return;

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    // Handle _gitignore -> .gitignore renaming
    const destName = entry.name.startsWith("_")
      ? "." + entry.name.slice(1)
      : entry.name;
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplate(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function detectPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes("pnpm")) return "pnpm";
    if (userAgent.includes("yarn")) return "yarn";
    if (userAgent.includes("bun")) return "bun";
  }
  return "npm";
}

main().catch((err) => {
  console.error(pc.red("Error:"), err);
  process.exit(1);
});
