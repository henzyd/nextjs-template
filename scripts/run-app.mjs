import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import {
  SINGLE_TENANT,
  defaultVariant,
  materialiseTenant,
  repositoryRoot,
  singleTenantExists,
  tenantNames,
  watchRoots,
} from "./lib/tenants.mjs";

const require = createRequire(import.meta.url);
const action = process.argv[2];
const forwardedArguments = process.argv.slice(3);

const nextCli = require.resolve("next/dist/bin/next");
const openNextEntry = require.resolve("@opennextjs/cloudflare");
const openNextCli = resolve(dirname(openNextEntry), "../cli/index.js");
const typeScriptCli = require.resolve("typescript/bin/tsc");
const wranglerCli = require.resolve("wrangler");

const actions = {
  build: [[nextCli, "build"]],
  "cf-typegen": [
    [
      wranglerCli,
      "types",
      "--env-interface",
      "CloudflareEnv",
      "cloudflare-env.d.ts",
    ],
  ],
  deploy: [
    [openNextCli, "build"],
    [openNextCli, "deploy"],
  ],
  dev: [[nextCli, "dev"]],
  preview: [
    [openNextCli, "build"],
    [openNextCli, "preview"],
  ],
  start: [[nextCli, "start"]],
  typecheck: [[typeScriptCli, "--noEmit"]],
  upload: [
    [openNextCli, "build"],
    [openNextCli, "upload"],
  ],
};

function fail(message) {
  console.error(`\nApplication selection failed: ${message}\n`);
  process.exit(1);
}

function listVariants() {
  console.log("Available applications:");

  const fallback = defaultVariant();

  if (singleTenantExists()) {
    console.log(`- ${SINGLE_TENANT}: . (single tenant)`);
  }

  for (const name of tenantNames()) {
    console.log(`- ${name}: apps/${name}`);
  }

  if (fallback) {
    console.log(`\nSelected when APP_VARIANT is unset: ${fallback}`);
  }

  if (!singleTenantExists() && tenantNames().length === 0) {
    console.log("- none. Create app/ or a tenant under apps/.");
  }
}

if (action === "list") {
  listVariants();
  process.exit(0);
}

if (!Object.hasOwn(actions, action)) {
  fail(
    `unknown action ${JSON.stringify(action)}. Expected one of: ${[
      ...Object.keys(actions),
      "list",
    ].join(", ")}.`
  );
}

const requested = process.env.APP_VARIANT?.trim();
const selected = requested || defaultVariant();

if (!selected) {
  listVariants();
  fail(
    "no application selected. Set APP_VARIANT, or create app/ at the " +
      "repository root for a single-tenant build."
  );
}

let projectRoot;

if (selected === SINGLE_TENANT) {
  if (!singleTenantExists()) {
    listVariants();
    fail(
      "the single-tenant application needs app/ or src/app/ at the " +
        "repository root."
    );
  }
  projectRoot = repositoryRoot;
  console.log("Using the single-tenant application at the repository root.");
} else {
  if (!tenantNames().includes(selected)) {
    listVariants();
    fail(
      `APP_VARIANT=${JSON.stringify(selected)} is not listed in ` +
        "tenants.config.mjs."
    );
  }

  try {
    projectRoot = materialiseTenant(selected).projectRoot;
  } catch (error) {
    fail(error.message);
  }

  console.log(
    `Using tenant ${JSON.stringify(selected)} from apps/${selected}.`
  );
}

/**
 * Keeps the generated tree in step with apps/ while the dev server runs.
 *
 * Editing a file needs nothing: the link already points at it, and the change
 * reaches the dev server through the link. Adding or removing a route does
 * change the tree, and Next does not register a route that appears in a
 * generated project after startup, so those restart the dev server.
 */
function startWatcher(onStructuralChange) {
  if (selected === SINGLE_TENANT) return () => {};

  const watchers = [];
  let pending;

  for (const root of watchRoots()) {
    try {
      watchers.push(
        watch(root, { recursive: true }, () => {
          clearTimeout(pending);
          pending = setTimeout(() => {
            try {
              if (materialiseTenant(selected).changed) onStructuralChange();
            } catch (error) {
              console.error(
                `Could not refresh the tenant tree: ${error.message}`
              );
            }
          }, 120);
        })
      );
    } catch {
      console.warn(
        "Could not watch apps/ for new files. Restart the dev server after " +
          "adding a route."
      );
    }
  }

  return () => {
    clearTimeout(pending);
    for (const watcher of watchers) watcher.close();
  };
}

let activeChild = null;

function run(cli, baseArguments) {
  return new Promise((resolveRun) => {
    const child = spawn(
      process.execPath,
      [cli, ...baseArguments, ...forwardedArguments],
      {
        cwd: projectRoot,
        env: { ...process.env, APP_VARIANT: selected },
        stdio: "inherit",
      }
    );

    activeChild = child;
    const forward = (signal) => child.kill(signal);
    process.on("SIGINT", forward);
    process.on("SIGTERM", forward);

    child.on("error", (error) => fail(error.message));
    child.on("close", (code) => {
      process.off("SIGINT", forward);
      process.off("SIGTERM", forward);
      activeChild = null;
      resolveRun(code ?? 0);
    });
  });
}

if (action === "dev") {
  let restarting = false;

  const stopWatching = startWatcher(() => {
    if (!activeChild) return;
    restarting = true;
    console.log("\nRoutes changed under apps/. Restarting the dev server...");
    activeChild.kill("SIGTERM");
  });

  const [[devCli, ...devArguments]] = actions.dev;

  for (;;) {
    restarting = false;
    const code = await run(devCli, devArguments);
    if (restarting) continue;

    stopWatching();
    process.exit(code);
  }
}

for (const [cli, ...baseArguments] of actions[action]) {
  const code = await run(cli, baseArguments);
  if (code !== 0) process.exit(code);
}
