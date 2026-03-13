export const marketplaceCategories = [
  "Templates",
  "Plugins",
  "Components",
  "Vectors",
  "Tutorials",
] as const;

export type MarketplaceCategory = (typeof marketplaceCategories)[number];
