#!/usr/bin/env node
/**
 * Guard against accidentally bumping a workspace package to 1.0 or beyond
 * before Stax is genuinely ready to signal API stability.
 *
 * Walks every `packages/<name>/package.json`. Any that publishes to
 * `@stax-ui/*` must have a version starting with `0.`. If any package has
 * moved past 0.x, the script exits non-zero — the release flow refuses
 * to publish, and CI refuses to merge.
 *
 * This exists because we accidentally shipped `@stax-ui/platform` and
 * `@stax-ui/vite-plugin` at `1.0.0` and then `2.0.0` while the rest of the
 * family was still at 0.x. The version numbers falsely implied API
 * stability. Rewound to 0.x via a one-time hand-edited republish; this
 * script keeps it from happening again.
 *
 * When Stax is genuinely production-ready and we plan a coordinated 1.0
 * release across every package, delete or update this script — but only
 * as part of that coordinated release, not by anyone patching a single
 * package.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = dirname(dirname(__filename));

const PACKAGES_DIR = join(repoRoot, "packages");

const main = async () => {
  const entries = await readdir(PACKAGES_DIR);
  const offenders = [];

  for (const entry of entries) {
    const pkgPath = join(PACKAGES_DIR, entry, "package.json");
    let raw;
    try {
      raw = await readFile(pkgPath, "utf8");
    } catch {
      continue; // not every dir has a package.json
    }
    const pkg = JSON.parse(raw);
    if (typeof pkg.name !== "string" || !pkg.name.startsWith("@stax-ui/")) {
      continue;
    }
    if (typeof pkg.version !== "string" || !pkg.version.startsWith("0.")) {
      offenders.push({ name: pkg.name, version: pkg.version, path: pkgPath });
    }
  }

  if (offenders.length === 0) {
    console.log(
      "[check-versions] All @stax-ui/* packages are on the 0.x track. ✓",
    );
    return;
  }

  console.error(
    "[check-versions] The following @stax-ui/* packages have moved off the 0.x",
  );
  console.error(
    "[check-versions] track before Stax reached a coordinated 1.0 release:",
  );
  console.error("");
  for (const { name, version, path } of offenders) {
    console.error(
      `  ${name}@${version}  (${path.replace(repoRoot + "/", "")})`,
    );
  }
  console.error("");
  console.error(
    "[check-versions] Rewind the version to a 0.x value before continuing.",
  );
  console.error(
    "[check-versions] See scripts/check-versions.mjs for the rationale.",
  );
  process.exit(1);
};

main().catch((err) => {
  console.error("[check-versions] Failed:", err);
  process.exit(1);
});
