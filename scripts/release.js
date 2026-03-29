#!/usr/bin/env node

/**
 * ui-context release script
 *
 * Usage:
 *   node scripts/release.js patch    # 0.1.0 → 0.1.1
 *   node scripts/release.js minor    # 0.1.0 → 0.2.0
 *   node scripts/release.js major    # 0.1.0 → 1.0.0
 *   node scripts/release.js 1.2.3   # explicit version
 *
 * Options:
 *   --dry-run   Show what would happen without making changes
 *   --skip-git  Skip git tag and commit
 *
 * What it does:
 *   1. Bumps version in all package.json files (root + packages/*)
 *   2. Updates internal dependency references (@ui-context/* → new version)
 *   3. Runs clean + build + tests
 *   4. Publishes all packages to npm in dependency order
 *   5. Creates a git commit + tag (unless --skip-git)
 */

const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = resolve(__dirname, "..");
const PACKAGES_DIR = join(ROOT, "packages");

// Publish order (respects dependency graph)
const PUBLISH_ORDER = [
  "core",
  "parser-react",
  "parser-angular",
  "mcp-server",
  "cli",
];

// ── Helpers ──────────────────────────────────────────────

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  if (!opts.dryRun) {
    execSync(cmd, { cwd: opts.cwd || ROOT, stdio: "inherit" });
  }
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split(".").map(Number);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      if (/^\d+\.\d+\.\d+/.test(type)) return type;
      console.error(`Invalid version type: ${type}`);
      console.error("Usage: node scripts/release.js [patch|minor|major|x.y.z]");
      process.exit(1);
  }
}

// ── Main ─────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipGit = args.includes("--skip-git");
const versionArg = args.find((a) => !a.startsWith("--"));

if (!versionArg) {
  console.error("Usage: node scripts/release.js [patch|minor|major|x.y.z] [--dry-run] [--skip-git]");
  process.exit(1);
}

// 1. Read current version
const rootPkgPath = join(ROOT, "package.json");
const rootPkg = readJson(rootPkgPath);
const currentVersion = rootPkg.version;
const newVersion = bumpVersion(currentVersion, versionArg);

console.log(`\nReleasing ui-context: ${currentVersion} -> ${newVersion}`);
if (dryRun) console.log("   (dry run -- no changes will be made)\n");

// 2. Collect all package.json paths
const packagePaths = [
  rootPkgPath,
  ...PUBLISH_ORDER.map((name) => join(PACKAGES_DIR, name, "package.json")),
];

// Verify all exist
for (const p of packagePaths) {
  if (!existsSync(p)) {
    console.error(`Missing: ${p}`);
    process.exit(1);
  }
}

// 3. Bump versions and update internal deps
console.log("\nUpdating package versions...");
for (const pkgPath of packagePaths) {
  const pkg = readJson(pkgPath);
  const oldVersion = pkg.version;
  pkg.version = newVersion;

  // Update internal @ui-context/* dependencies
  for (const depType of ["dependencies", "devDependencies", "peerDependencies"]) {
    if (!pkg[depType]) continue;
    for (const dep of Object.keys(pkg[depType])) {
      if (dep.startsWith("@ui-context/")) {
        pkg[depType][dep] = newVersion;
      }
    }
  }

  console.log(`  ${pkg.name}: ${oldVersion} -> ${newVersion}`);
  if (!dryRun) writeJson(pkgPath, pkg);
}

// 4. Clean + Build + Test
console.log("\nBuilding...");
run("npm run clean", { dryRun });
run("npm run build", { dryRun });

console.log("\nRunning tests...");
run("npm test", { dryRun });

// 5. Publish packages in order
console.log("\nPublishing to npm...");
for (const name of PUBLISH_ORDER) {
  const pkgDir = join(PACKAGES_DIR, name);
  console.log(`\n  Publishing @ui-context/${name}@${newVersion}`);
  if (dryRun) {
    run("npm pack --dry-run", { cwd: pkgDir });
  } else {
    try {
      execSync("npm publish --access public", { cwd: pkgDir, stdio: "inherit" });
    } catch (err) {
      console.error(`\n  Failed to publish @ui-context/${name}`);
      console.error("  Fix the issue and re-run, or publish manually:");
      console.error(`  cd packages/${name} && npm publish --access public\n`);
      process.exit(1);
    }
  }
}

// 6. Git commit + tag
if (!skipGit && !dryRun) {
  console.log("\nCreating git commit and tag...");
  run("git add -A");
  run(`git commit -m "release: v${newVersion}"`);
  run(`git tag -a v${newVersion} -m "v${newVersion}"`);
  console.log(`\n  Created tag v${newVersion}`);
  console.log("  Run 'git push && git push --tags' to push the release.");
}

// Done
console.log(`\nRelease ${dryRun ? "(dry run) " : ""}complete: v${newVersion}\n`);
if (dryRun) {
  console.log("  To perform the actual release, run without --dry-run");
}
