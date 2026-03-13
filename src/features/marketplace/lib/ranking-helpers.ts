export type AdminOverride = "none" | "great" | "bad";

export function getOverrideMultiplier(
  adminOverride: AdminOverride | undefined,
  boost: number,
  decay: number,
) {
  if (adminOverride === "great") {
    return boost;
  }

  if (adminOverride === "bad") {
    return decay;
  }

  return 1;
}

export function getRotationState(
  isCurrentlyTrending: boolean,
  daysInTrending: number,
  daysSinceLastTrending: number | null | undefined,
  durationDecay: number,
  maxDays: number,
  cooldown: number,
) {
  if (isCurrentlyTrending && daysInTrending > maxDays) {
    return { eligible: false, value: 0 };
  }

  if (
    !isCurrentlyTrending &&
    daysSinceLastTrending !== null &&
    daysSinceLastTrending !== undefined &&
    daysSinceLastTrending < cooldown
  ) {
    return { eligible: false, value: 0 };
  }

  return {
    eligible: true,
    value: isCurrentlyTrending
      ? Math.max(0, 1 - durationDecay * daysInTrending)
      : 1,
  };
}

function buildExplorationPositions(count: number, slots: number) {
  if (count <= 0 || slots <= 0) {
    return new Set<number>();
  }

  const positions = new Set<number>();
  const stride = count / slots;

  for (let index = 0; index < slots; index += 1) {
    positions.add(Math.min(count - 1, Math.round(index * stride + stride / 2)));
  }

  return positions;
}

function takeNextItem<T extends { name: string }>(
  items: T[],
  usedNames: Set<string>,
  creatorCounts: Map<string, number>,
  categoryCounts: Map<string, number>,
  creatorCap: number,
  categoryCap: number,
  getCreator: (item: T) => string | null | undefined,
  getCategory: (item: T) => string | null | undefined,
) {
  return (
    items.find((item) => {
      if (usedNames.has(item.name)) {
        return false;
      }

      const creator = getCreator(item);
      const category = getCategory(item);
      const underCreatorCap =
        creator === null ||
        creator === undefined ||
        (creatorCounts.get(creator) ?? 0) < creatorCap;
      const underCategoryCap =
        category === null ||
        category === undefined ||
        (categoryCounts.get(category) ?? 0) < categoryCap;

      return underCreatorCap && underCategoryCap;
    }) ?? null
  );
}

export function applyExplorationOrdering<T extends {
  finalScore: number;
  isEligible: boolean;
  name: string;
}>(
  items: T[],
  explorationPercent: number,
  isExplorationCandidate: (item: T) => boolean,
  options?: {
    categoryCap?: number;
    creatorCap?: number;
    getCategory?: (item: T) => string | null | undefined;
    getCreator?: (item: T) => string | null | undefined;
  },
) {
  const eligibleItems = items
    .filter((item) => item.isEligible)
    .toSorted(
      (left, right) =>
        right.finalScore - left.finalScore || left.name.localeCompare(right.name),
    );
  const ineligibleItems = items
    .filter((item) => !item.isEligible)
    .toSorted(
      (left, right) =>
        right.finalScore - left.finalScore || left.name.localeCompare(right.name),
    );

  const explorationPool = eligibleItems.filter(isExplorationCandidate);
  const explorationSlots = Math.min(
    explorationPool.length,
    Math.round(eligibleItems.length * (explorationPercent / 100)),
  );
  const explorationPositions = buildExplorationPositions(
    eligibleItems.length,
    explorationSlots,
  );
  const usedNames = new Set<string>();
  const creatorCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const orderedEligible: T[] = [];
  const creatorCap = options?.creatorCap ?? Number.POSITIVE_INFINITY;
  const categoryCap = options?.categoryCap ?? Number.POSITIVE_INFINITY;
  const getCreator = options?.getCreator ?? (() => null);
  const getCategory = options?.getCategory ?? (() => null);

  for (let index = 0; index < eligibleItems.length; index += 1) {
    const preferredPool = explorationPositions.has(index)
      ? explorationPool
      : eligibleItems;
    const fallbackPool = explorationPositions.has(index)
      ? eligibleItems
      : explorationPool;
    const nextItem =
      takeNextItem(
        preferredPool,
        usedNames,
        creatorCounts,
        categoryCounts,
        creatorCap,
        categoryCap,
        getCreator,
        getCategory,
      ) ??
      takeNextItem(
        fallbackPool,
        usedNames,
        creatorCounts,
        categoryCounts,
        creatorCap,
        categoryCap,
        getCreator,
        getCategory,
      );

    if (!nextItem) {
      break;
    }

    usedNames.add(nextItem.name);
    orderedEligible.push(nextItem);
    const creator = getCreator(nextItem);
    const category = getCategory(nextItem);

    if (creator !== null && creator !== undefined) {
      creatorCounts.set(creator, (creatorCounts.get(creator) ?? 0) + 1);
    }

    if (category !== null && category !== undefined) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  // Keep caps strict: once no remaining eligible item can fit, exclude the rest.
  return [...orderedEligible, ...ineligibleItems];
}
