const LOCAL_ORIGIN = "https://local.invalid";

export function getSafeReturnPath(
  candidate: string | null | undefined,
  fallback = "/"
): string {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return fallback;
  }

  try {
    const url = new URL(candidate, LOCAL_ORIGIN);
    if (url.origin !== LOCAL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function getLoginRedirectPath(pathname: string, search = ""): string {
  const origin = getSafeReturnPath(`${pathname}${search}`);
  return `/login?origin=${encodeURIComponent(origin)}`;
}
