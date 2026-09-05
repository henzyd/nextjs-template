import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { appVariants } from "../app-variants.config.mjs";

const require = createRequire(import.meta.url);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const action = process.argv[2];
const forwardedArguments = process.argv.slice(3);
const selectedVariant = process.env.APP_VARIANT?.trim() || "default";

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
  console.log("Configured application variants:");

  for (const [name, path] of Object.entries(appVariants)) {
    console.log(`- ${name}: ${path}`);
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

if (!Object.hasOwn(appVariants, selectedVariant)) {
  listVariants();
  fail(
    `APP_VARIANT=${JSON.stringify(selectedVariant)} is not registered in ` +
      "app-variants.config.mjs."
  );
}

const configuredPath = appVariants[selectedVariant];

if (typeof configuredPath !== "string" || configuredPath.trim() === "") {
  fail(
    `the path registered for ${JSON.stringify(selectedVariant)} is invalid.`
  );
}

const applicationRoot = resolve(repositoryRoot, configuredPath);
const pathFromRepository = relative(repositoryRoot, applicationRoot);

if (pathFromRepository === ".." || pathFromRepository.startsWith(`..${sep}`)) {
  fail("application paths must stay inside the repository.");
}

if (!existsSync(applicationRoot)) {
  fail(
    `${JSON.stringify(configuredPath)} does not exist. Create the app before ` +
      "registering it."
  );
}

const repositoryRealRoot = realpathSync(repositoryRoot);
const applicationRealRoot = realpathSync(applicationRoot);
const realPathFromRepository = relative(
  repositoryRealRoot,
  applicationRealRoot
);

if (
  realPathFromRepository === ".." ||
  realPathFromRepository.startsWith(`..${sep}`)
) {
  fail("application paths must not resolve outside the repository.");
}

if (
  !existsSync(resolve(applicationRoot, "app")) &&
  !existsSync(resolve(applicationRoot, "src/app"))
) {
  fail(
    `${JSON.stringify(configuredPath)} does not contain an app/ or src/app/ ` +
      "directory."
  );
}

console.log(
  `Using application variant ${JSON.stringify(selectedVariant)} from ` +
    `${JSON.stringify(configuredPath)}.`
);

for (const [cli, ...baseArguments] of actions[action]) {
  const result = spawnSync(
    process.execPath,
    [cli, ...baseArguments, ...forwardedArguments],
    {
      cwd: applicationRoot,
      env: { ...process.env, APP_VARIANT: selectedVariant },
      stdio: "inherit",
    }
  );

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
