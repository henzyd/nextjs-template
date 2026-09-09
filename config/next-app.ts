import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import path from "node:path";

/**
 * Shared Next.js configuration for every application in this repository.
 *
 * Next resolves `next.config.*` from the directory it is told to build, so each
 * application still needs its own file. That file should hold only what differs
 * between surfaces; everything common lives here, so a new application does not
 * restate the build setup.
 */

const repositoryRoot = path.resolve(__dirname, "..");

export interface AppConfigOptions {
  /**
   * Absolute path to the application's own directory. Omit for the application
   * that lives at the repository root.
   */
  appRoot?: string;
  /**
   * Send `X-Robots-Tag: noindex, nofollow` on every response. Set for internal
   * surfaces that must never be indexed, and never linked publicly.
   */
  noindex?: boolean;
}

export function createNextConfig(options: AppConfigOptions = {}): NextConfig {
  const { appRoot, noindex = false } = options;

  const config: NextConfig = {};

  // Only an application nested under the repository root needs its tracing
  // root widened, so standalone and adapter builds can include files from
  // shared workspace packages.
  if (appRoot && path.resolve(appRoot) !== repositoryRoot) {
    config.outputFileTracingRoot = repositoryRoot;
  }

  if (noindex) {
    config.headers = async () => [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  }

  initOpenNextCloudflareForDev();

  return config;
}
