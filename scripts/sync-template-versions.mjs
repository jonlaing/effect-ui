#!/usr/bin/env node
/**
 * Sync @stax-ui/* dependency versions in create-stax templates with the
 * current workspace versions.
 *
 * Reads the version field from each workspace @stax-ui package, then walks
 * every package.json under packages/create-stax/templates/ and rewrites
 * matching @stax-ui/* entries under `dependencies` and `devDependencies`
 * to `^MAJOR.MINOR.PATCH`.
 *
 * Run as part of the release flow (after `changeset version`) so generated
 * project scaffolds always reference the most recently bumped versions.
 *
 * Idempotent: re-running on already-synced files is a no-op.
 */

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = dirname(dirname(__filename));

const PACKAGES_DIR = join(repoRoot, "packages");
const TEMPLATES_DIR = join(
  repoRoot,
  "packages",
  "create-stax",
  "templates",
);

/**
 * Read every workspace package.json under packages/ and return a map of
 * { "@stax-ui/<name>": "1.2.3" } for those that publish under @stax-ui/*.
 */
const readWorkspaceVersions = async () => {
  const entries = await readdir(PACKAGES_DIR);
  const versions = {};

  for (const entry of entries) {
    const pkgPath = join(PACKAGES_DIR, entry, "package.json");
    let raw;
    try {
      raw = await readFile(pkgPath, "utf8");
    } catch {
      continue; // not every dir has a package.json
    }
    const pkg = JSON.parse(raw);
    if (typeof pkg.name === "string" && pkg.name.startsWith("@stax-ui/")) {
      versions[pkg.name] = pkg.version;
    }
  }

  return versions;
};

/**
 * Rewrite @stax-ui/* entries in a deps object to ^version. Mutates input.
 * Returns true if anything changed.
 */
const rewriteDepsBlock = (deps, versions) => {
  if (!deps || typeof deps !== "object") return false;
  let changed = false;
  for (const name of Object.keys(deps)) {
    if (!name.startsWith("@stax-ui/")) continue;
    const target = versions[name];
    if (!target) continue; // unknown @stax-ui package — leave alone
    const desired = `^${target}`;
    if (deps[name] !== desired) {
      deps[name] = desired;
      changed = true;
    }
  }
  return changed;
};

/**
 * Find every package.json under templates/, rewrite @stax-ui/* deps to
 * pinned-to-workspace versions, and write back. Returns the list of
 * files that were updated.
 */
const syncTemplates = async (versions) => {
  const updated = [];
  const templateDirs = await readdir(TEMPLATES_DIR);

  for (const dir of templateDirs) {
    const templatePath = join(TEMPLATES_DIR, dir);
    const info = await stat(templatePath);
    if (!info.isDirectory()) continue;

    const pkgPath = join(templatePath, "package.json");
    let raw;
    try {
      raw = await readFile(pkgPath, "utf8");
    } catch {
      continue; // not every template has a package.json (e.g. base/)
    }

    const pkg = JSON.parse(raw);
    const depsChanged = rewriteDepsBlock(pkg.dependencies, versions);
    const devDepsChanged = rewriteDepsBlock(pkg.devDependencies, versions);

    if (!depsChanged && !devDepsChanged) continue;

    // Preserve trailing newline if present in original.
    const trailingNewline = raw.endsWith("\n") ? "\n" : "";
    await writeFile(
      pkgPath,
      JSON.stringify(pkg, null, 2) + trailingNewline,
      "utf8",
    );
    updated.push(pkgPath);
  }

  return updated;
};

const main = async () => {
  const versions = await readWorkspaceVersions();
  const known = Object.entries(versions);

  if (known.length === 0) {
    console.error("[sync-template-versions] No @stax-ui/* packages found");
    process.exit(1);
  }

  console.log("[sync-template-versions] Workspace versions:");
  for (const [name, ver] of known) {
    console.log(`  ${name} @ ${ver}`);
  }

  const updated = await syncTemplates(versions);

  if (updated.length === 0) {
    console.log("[sync-template-versions] All templates already in sync.");
    return;
  }

  console.log(
    `[sync-template-versions] Updated ${updated.length} template package.json file(s):`,
  );
  for (const file of updated) {
    console.log(`  ${file.replace(repoRoot + "/", "")}`);
  }
};

main().catch((err) => {
  console.error("[sync-template-versions] Failed:", err);
  process.exit(1);
});
