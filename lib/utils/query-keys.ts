export type SearchParams = Readonly<
  Record<string, string | number | boolean | null | undefined>
>;

export function createQueryKeys<const Entity extends string>(entity: Entity) {
  return {
    all: [entity] as const,
    list: (params?: SearchParams) => [entity, "list", params] as const,
    detail: (id: string) => [entity, "detail", id] as const,
  };
}

export const QUERY_KEYS = {
  auth: {
    ...createQueryKeys("auth"),
    me: ["auth", "me"] as const,
  },
} as const;
