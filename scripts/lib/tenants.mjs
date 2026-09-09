import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { sharedRootDirectories, tenants } from "../../tenants.config.mjs";

export const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const APPS_DIR = resolve(repositoryRoot, "apps");
const GENERATED_DIR = resolve(repositoryRoot, ".tenants");

/**
 * A tenant directory containing this marker stops inheriting at that point:
 * the directory replaces the shared one wholesale instead of merging with it.
 */
const REPLACE_MARKER = ".override";

export const SINGLE_TENANT = "default";

function hasRouteTree(dir) {
  return existsSync(join(dir, "app")) || existsSync(join(dir, "src/app"));
}

export function singleTenantExists() {
  return hasRouteTree(repositoryRoot);
}

export function tenantNames() {
  return Object.keys(tenants);
}

/**
 * Resolves the variant to run when `APP_VARIANT` is absent: the single-tenant
 * application if one exists, then the tenant marked `default`, then the only
 * tenant if there is just one.
 */
export function defaultVariant() {
  if (singleTenantExists()) return SINGLE_TENANT;

  const marked = tenantNames().filter((name) => tenants[name].default);
  if (marked.length > 1) {
    throw new Error(
      `More than one tenant is marked default: ${marked.join(", ")}.`
    );
  }
  if (marked.length === 1) return marked[0];

  const names = tenantNames();
  return names.length === 1 ? names[0] : null;
}

// ---------------------------------------------------------------------------
// Overlay planning
// ---------------------------------------------------------------------------

function isIgnoredEntry(name) {
  return name.startsWith(".") || name === "node_modules";
}

/**
 * Builds the merged view of an ordered list of source directories, lowest
 * precedence first.
 *
 * Directories are always recreated as real directories and only files are
 * linked. A symlinked directory builds correctly but is invisible to the dev
 * server's watcher, so a route behind one 404s under `next dev` while working
 * in production. Linking at file level keeps both identical.
 *
 * Where the same name appears in several sources the highest-precedence side
 * wins. Directories present in more than one source merge, unless the winning
 * side carries the replace marker, which makes it replace rather than extend.
 */
function planOverlay(sources, skipPerSource = []) {
  const layers = new Map();

  for (const [index, source] of sources.entries()) {
    if (!existsSync(source)) continue;
    const skip = skipPerSource[index];

    for (const entry of readdirSync(source, { withFileTypes: true })) {
      if (isIgnoredEntry(entry.name)) continue;
      if (skip?.has(entry.name)) continue;

      const path = join(source, entry.name);
      const isDirectory = entry.isDirectory();
      const existing = layers.get(entry.name);

      if (existing) existing.push({ path, isDirectory });
      else layers.set(entry.name, [{ path, isDirectory }]);
    }
  }

  const plan = new Map();

  for (const [name, stack] of layers) {
    const winner = stack[stack.length - 1];

    if (!winner.isDirectory) {
      plan.set(name, { kind: "link", target: winner.path });
      continue;
    }

    const replaces = existsSync(join(winner.path, REPLACE_MARKER));
    const directories = replaces
      ? [winner.path]
      : stack.filter((layer) => layer.isDirectory).map((layer) => layer.path);

    plan.set(name, { kind: "dir", plan: planOverlay(directories) });
  }

  return plan;
}

// ---------------------------------------------------------------------------
// Applying a plan
// ---------------------------------------------------------------------------

function linkMatches(path, wanted) {
  try {
    return lstatSync(path).isSymbolicLink() && readlinkSync(path) === wanted;
  } catch {
    return false;
  }
}

/**
 * Reconciles `destination` with `plan`, touching only what differs, and reports
 * whether the shape of the tree changed. Editing a file behind an existing link
 * changes nothing here and reaches the dev server through the link itself; only
 * added or removed entries need the caller to react.
 */
function applyPlan(destination, plan) {
  let changed = false;
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
    changed = true;
  }

  const stale = new Set(readdirSync(destination));

  for (const [name, node] of plan) {
    stale.delete(name);
    const path = join(destination, name);

    if (node.kind === "link") {
      const wanted = relative(destination, node.target);
      if (linkMatches(path, wanted)) continue;

      rmSync(path, { recursive: true, force: true });
      symlinkSync(wanted, path, "file");
      changed = true;
      continue;
    }

    if (existsSync(path)) {
      const stats = lstatSync(path);
      if (stats.isSymbolicLink() || !stats.isDirectory()) {
        rmSync(path, { recursive: true, force: true });
        changed = true;
      }
    }

    if (applyPlan(path, node.plan)) changed = true;
  }

  for (const name of stale) {
    rmSync(join(destination, name), { recursive: true, force: true });
    changed = true;
  }

  return changed;
}

function writeIfChanged(path, contents) {
  if (existsSync(path) && readFileSync(path, "utf8") === contents) return;
  writeFileSync(path, contents);
}

function linkRootDirectory(projectRoot, name) {
  const target = resolve(repositoryRoot, name);
  if (!existsSync(target)) return;

  const path = join(projectRoot, name);
  const wanted = relative(projectRoot, target);
  if (linkMatches(path, wanted)) return;

  rmSync(path, { recursive: true, force: true });
  symlinkSync(wanted, path, "junction");
}

// ---------------------------------------------------------------------------
// Generated project files
// ---------------------------------------------------------------------------

function nextConfigSource(options) {
  return `// Generated from tenants.config.mjs. Edit that file, not this one.
import { createNextConfig } from "../../config/next-app";

export default createNextConfig({
  appRoot: __dirname,
  noindex: ${Boolean(options.noindex)},
});
`;
}

const TSCONFIG_SOURCE = `{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules", ".open-next"]
}
`;

const OPEN_NEXT_SOURCE = `// Generated from tenants.config.mjs. Edit that file, not this one.
export { default } from "../../open-next.config";
`;

/**
 * Derives the tenant's Worker configuration from the repository's own, so
 * compatibility dates, flags and asset bindings stay in one place and only the
 * Worker name differs.
 *
 * A tenant that names no Worker gets one derived from the repository's. Every
 * tenant must end up with a distinct name: without its own configuration a
 * tenant resolves the repository's, and deploying it would publish over the
 * root application.
 */
function wranglerSource(tenant, worker) {
  const rootConfig = resolve(repositoryRoot, "wrangler.jsonc");
  if (!existsSync(rootConfig)) return null;

  const source = readFileSync(rootConfig, "utf8");
  const rootName = /"name"\s*:\s*"([^"]*)"/.exec(source)?.[1];
  const name = worker ?? (rootName ? `${rootName}-${tenant}` : tenant);

  const named = source.replace(
    /("name"\s*:\s*)"[^"]*"/,
    `$1${JSON.stringify(name)}`
  );

  return named.replace(/("\$schema"\s*:\s*)"\.\/([^"]*)"/, `$1"../../$2"`);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Builds the real Next.js project for a tenant and returns its root.
 *
 * Next resolves both its configuration and its route tree from one directory,
 * and only ever looks for routes in `app/` or `src/app/`. A tenant therefore
 * cannot be a project root itself. This assembles one: a generated directory
 * whose `app/` is the merged view of the shared route files and the tenant's
 * own, linked rather than copied so edits reach the running dev server.
 *
 * Returns the project root and whether the tree's shape changed.
 */
export function materialiseTenant(name) {
  const options = tenants[name];
  if (!options) throw new Error(`Unknown tenant ${JSON.stringify(name)}.`);

  const tenantRoot = join(APPS_DIR, name);
  if (!existsSync(tenantRoot)) {
    throw new Error(
      `apps/${name} does not exist. Create it before running the tenant.`
    );
  }

  const projectRoot = join(GENERATED_DIR, name);
  mkdirSync(projectRoot, { recursive: true });

  // Shared route content is everything at the top of apps/ that is not itself
  // a tenant. The exclusion applies only to that level of apps/, so a tenant
  // may still own a route segment that happens to share another tenant's name.
  const plan = planOverlay([APPS_DIR, tenantRoot], [new Set(tenantNames())]);

  const changed = applyPlan(join(projectRoot, "app"), plan);

  for (const directory of sharedRootDirectories) {
    linkRootDirectory(projectRoot, directory);
  }

  writeIfChanged(
    join(projectRoot, "next.config.ts"),
    nextConfigSource(options)
  );
  writeIfChanged(join(projectRoot, "tsconfig.json"), TSCONFIG_SOURCE);
  writeIfChanged(join(projectRoot, "open-next.config.ts"), OPEN_NEXT_SOURCE);

  const wrangler = wranglerSource(name, options.worker);
  if (wrangler) {
    writeIfChanged(join(projectRoot, "wrangler.jsonc"), wrangler);
  }

  return { projectRoot, changed };
}

/** Directories whose contents change the materialised tree. */
export function watchRoots() {
  return existsSync(APPS_DIR) ? [APPS_DIR] : [];
}
