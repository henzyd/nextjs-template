export const QUERY_KEYS = {
  auth: {
    all: ["auth"] as const,
    me: ["auth", "me"] as const,
  },
} as const;
