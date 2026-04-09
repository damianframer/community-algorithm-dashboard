import {
  type DropdownFieldState,
  type NumericFieldState,
  type SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import {
  scoreTemplates,
  type LookbackWindow,
  type RankedTemplate,
  type RankingSettings,
  type TemplateSeed,
  type TemplatePipelineSnapshot,
} from "@/features/templates/lib/template-ranking";

const TIME_WINDOW_SECTION_TITLE = "Time Window";
const TRENDING_ROTATION_SECTION_TITLE = "Trending Rotation";
const CORE_SCORE_SECTION_TITLE = "Core Score";
const RESERVED_SHARE_WINDOW_SIZE = 48;
const LANE_WINDOW_SIZE = RESERVED_SHARE_WINDOW_SIZE / 2;
const DEFAULT_EXPOSURE_DECAY_FLOOR = 0.7;
const DEFAULT_STABILITY_PENALTY = 0.9;
const DEFAULT_STABILITY_THRESHOLD = 3;
const DEFAULT_TOP_48_STREAK_DECAY_FLOOR = 0.75;
const DEFAULT_TOP_48_STREAK_DECAY_RATE = 0.95;
const DEFAULT_TOTAL_DECAY_FLOOR = 0.55;
const BASE_RANKING_SETTINGS: RankingSettings = {
  activeSiteRateWeight: 10,
  activeSitesWeight: 0,
  agePriorityBoost: 10,
  agePriorityReservedShare: 15,
  agePriorityWindowDays: 45,
  antiDominanceExposureDecayRate: 0.985,
  antiDominanceExposureThreshold: 24,
  antiDominanceTop48StreakThreshold: 5,
  categoryCap: Number.MAX_SAFE_INTEGER,
  conversionRateWeight: 2,
  conversionsWeight: 0,
  cooldown: 0,
  creatorCap: Number.MAX_SAFE_INTEGER,
  ctrThreshold: 0,
  currentTrendingCount: 0,
  durationDecay: 0,
  featureCountThreshold: Number.MAX_SAFE_INTEGER,
  featureCountWindow: "30d",
  freshBoostDuration: 30,
  freshBoostMultiplier: 1,
  freshTemplateBoost: 0,
  lifetimeSource: "90d",
  lookbackWindow: "30 days",
  maxDays: Number.MAX_SAFE_INTEGER,
  minPreviews: 0,
  minRemixes: 0,
  newUserBoost: 0,
  overrideBoost: 1,
  overrideDecay: 1,
  paidConversionMultiplier: 1,
  paidMinPreviews: 0,
  paidMinRemixes: 0,
  paidRemixMultiplier: 1,
  previewRateWeight: 10,
  previewsWeight: 0,
  recencyWeight: 100,
  remixRateWeight: 24,
  remixesWeight: 0,
  repeatFeatureDecay: 1,
  reservedShareWindowSize: RESERVED_SHARE_WINDOW_SIZE,
  revenueEfficiencyWeight: 0,
  revenueWeight: 0,
  viewsWeight: 0,
};

function getNumericSettingValue(
  settings: SidebarSettingsState,
  label: string,
  section = CORE_SCORE_SECTION_TITLE,
) {
  return (
    settings[section][label] as NumericFieldState
  ).value;
}

function getDropdownSettingValue(
  settings: SidebarSettingsState,
  section: string,
  label: string,
) {
  return (settings[section][label] as DropdownFieldState).value;
}

export function getTemplateWorkspaceRankingModelSettings(
  settings: SidebarSettingsState,
): RankingSettings {
  const lookbackWindow = getDropdownSettingValue(
    settings,
    TIME_WINDOW_SECTION_TITLE,
    "Lookback window",
  ) as LookbackWindow;
  const freshnessWindowDays = getNumericSettingValue(
    settings,
    "Freshness window",
    TRENDING_ROTATION_SECTION_TITLE,
  );
  const reservedExplorationShare = getNumericSettingValue(
    settings,
    "Reserved exploration share",
    TRENDING_ROTATION_SECTION_TITLE,
  );
  const exposureThreshold = getNumericSettingValue(
    settings,
    "Weighted exposure threshold",
    TRENDING_ROTATION_SECTION_TITLE,
  );
  const exposureDecayRate = getNumericSettingValue(
    settings,
    "Exposure decay rate",
    TRENDING_ROTATION_SECTION_TITLE,
  );
  const top48StreakThreshold = getNumericSettingValue(
    settings,
    "Top-48 streak threshold",
    TRENDING_ROTATION_SECTION_TITLE,
  );

  return {
    ...BASE_RANKING_SETTINGS,
    antiDominanceExposureDecayRate: exposureDecayRate,
    antiDominanceExposureThreshold: exposureThreshold,
    antiDominanceTop48StreakThreshold: top48StreakThreshold,
    lookbackWindow,
    recencyWeight: 100,
    lifetimeSource: "90d",
    viewsWeight: 0,
    previewsWeight: 0,
    remixesWeight: 0,
    activeSitesWeight: 0,
    conversionsWeight: 0,
    revenueWeight: 0,
    previewRateWeight: getNumericSettingValue(settings, "Preview Rate"),
    remixRateWeight: getNumericSettingValue(settings, "Remix Rate"),
    activeSiteRateWeight: getNumericSettingValue(settings, "Active Site Rate"),
    conversionRateWeight: getNumericSettingValue(settings, "Conversion Rate"),
    revenueEfficiencyWeight: 0,
    paidRemixMultiplier: 1,
    paidConversionMultiplier: 1,
    newUserBoost: 0,
    freshTemplateBoost: 0,
    freshBoostMultiplier: 1,
    freshBoostDuration: 30,
    agePriorityWindowDays: freshnessWindowDays,
    agePriorityBoost: BASE_RANKING_SETTINGS.agePriorityBoost,
    agePriorityReservedShare: reservedExplorationShare,
    reservedShareWindowSize: RESERVED_SHARE_WINDOW_SIZE,
    minPreviews: 0,
    minRemixes: 0,
    paidMinPreviews: 0,
    paidMinRemixes: 0,
    featureCountThreshold: Number.MAX_SAFE_INTEGER,
    featureCountWindow: "30d",
    durationDecay: 0,
    maxDays: Number.MAX_SAFE_INTEGER,
    cooldown: 0,
    ctrThreshold: 0,
    repeatFeatureDecay: 1,
    creatorCap: Number.MAX_SAFE_INTEGER,
    categoryCap: Number.MAX_SAFE_INTEGER,
    overrideBoost: 1,
    overrideDecay: 1,
  };
}

export type TemplateWorkspacePipelineResult = {
  displayTemplates: RankedTemplate[];
  pipelineSnapshots: ReadonlyMap<string, TemplatePipelineSnapshot>;
  rankedTemplates: RankedTemplate[];
  rankingSeeds: TemplateSeed[];
};

type LaneSelectionEntry = {
  reservedAgePriorityApplied: boolean;
  template: RankedTemplate;
};

function getTemplateIdentityKey(template: Pick<RankedTemplate, "name" | "templateId">) {
  return template.templateId === undefined
    ? template.name
    : `${template.templateId}:${template.name}`;
}

function getWorkspaceDisplayScore(template: RankedTemplate) {
  return template.finalScore;
}

function buildExplorationPositions(count: number, slots: number) {
  if (slots <= 0 || count <= 0) {
    return new Set<number>();
  }

  const positions = new Set<number>();
  const stride = count / slots;

  for (let index = 0; index < slots; index += 1) {
    positions.add(Math.min(count - 1, Math.round(index * stride + stride / 2)));
  }

  return positions;
}

function isWorkspaceExplorationCandidate(
  template: RankedTemplate,
  settings: RankingSettings,
) {
  return (
    template.explorationCandidate ||
    (settings.agePriorityWindowDays > 0 &&
      template.ageDays <= settings.agePriorityWindowDays)
  );
}

function takeNextLaneTemplate(
  pool: RankedTemplate[],
  usedTemplateKeys: Set<string>,
) {
  return pool.find(
    (template) => !usedTemplateKeys.has(getTemplateIdentityKey(template)),
  );
}

function buildLaneSelectionEntries(
  rankedTemplates: RankedTemplate[],
  settings: RankingSettings,
  pricingType: RankedTemplate["pricingType"],
) {
  const laneTemplates = rankedTemplates.filter(
    (template) => template.pricingType === pricingType,
  );
  const usedTemplateKeys = new Set<string>();
  const selection: LaneSelectionEntry[] = [];
  const prioritizedPool = laneTemplates.filter((template) =>
    isWorkspaceExplorationCandidate(template, settings),
  );
  const reservedWindowSize = Math.min(
    LANE_WINDOW_SIZE,
    laneTemplates.length,
  );
  const reservedSlots = Math.min(
    prioritizedPool.length,
    Math.round(
      reservedWindowSize * (settings.agePriorityReservedShare / 100),
    ),
  );
  const reservedPositions = buildExplorationPositions(
    reservedWindowSize,
    reservedSlots,
  );

  for (let index = 0; index < laneTemplates.length; index += 1) {
    const reservedExplorationPosition =
      index < reservedWindowSize && reservedPositions.has(index);
    const preferredPool = reservedExplorationPosition
      ? prioritizedPool
      : laneTemplates;
    const fallbackPool = reservedExplorationPosition
      ? laneTemplates
      : prioritizedPool;
    const preferredCandidate = takeNextLaneTemplate(
      preferredPool,
      usedTemplateKeys,
    );
    const candidate =
      preferredCandidate ??
      takeNextLaneTemplate(fallbackPool, usedTemplateKeys);

    if (!candidate) {
      break;
    }

    usedTemplateKeys.add(getTemplateIdentityKey(candidate));
    selection.push({
      reservedAgePriorityApplied:
        reservedExplorationPosition &&
        preferredCandidate !== undefined &&
        getTemplateIdentityKey(preferredCandidate) ===
          getTemplateIdentityKey(candidate),
      template: candidate,
    });
  }

  return selection;
}

function interleaveLaneSelectionEntries(
  freeEntries: LaneSelectionEntry[],
  paidEntries: LaneSelectionEntry[],
) {
  const displayEntries: LaneSelectionEntry[] = [];
  const maxLength = Math.max(freeEntries.length, paidEntries.length);

  for (let index = 0; index < maxLength; index += 1) {
    const freeEntry = freeEntries[index];
    const paidEntry = paidEntries[index];

    if (freeEntry) {
      displayEntries.push(freeEntry);
    }

    if (paidEntry) {
      displayEntries.push(paidEntry);
    }
  }

  return displayEntries;
}

function getWorkspaceAntiDominanceMultiplier(
  template: RankedTemplate,
  settings: RankingSettings,
) {
  const exposureStats = template.exposureStats;

  if (!exposureStats) {
    return 1;
  }

  const exposureThreshold = settings.antiDominanceExposureThreshold ?? 24;
  const exposureDecayRate = settings.antiDominanceExposureDecayRate ?? 0.985;
  const top48StreakThreshold = settings.antiDominanceTop48StreakThreshold ?? 5;
  const exposureMultiplier =
    exposureStats.weightedExposure30 <= exposureThreshold
      ? 1
      : Math.max(
          DEFAULT_EXPOSURE_DECAY_FLOOR,
          exposureDecayRate **
            (exposureStats.weightedExposure30 - exposureThreshold),
        );
  const streakMultiplier =
    exposureStats.top48StreakDays <= top48StreakThreshold
      ? 1
      : Math.max(
          DEFAULT_TOP_48_STREAK_DECAY_FLOOR,
          DEFAULT_TOP_48_STREAK_DECAY_RATE **
            (exposureStats.top48StreakDays - top48StreakThreshold),
        );
  const stabilityMultiplier =
    exposureStats.weightedExposure30 > exposureThreshold &&
    exposureStats.avgAbsPositionChange14 <= DEFAULT_STABILITY_THRESHOLD
      ? DEFAULT_STABILITY_PENALTY
      : 1;

  return Math.max(
    DEFAULT_TOTAL_DECAY_FLOOR,
    exposureMultiplier * streakMultiplier * stabilityMultiplier,
  );
}

function applyWorkspaceAntiDominance(
  rankedTemplates: RankedTemplate[],
  settings: RankingSettings,
) {
  return rankedTemplates
    .map((template) => {
      const antiDominanceMultiplier = getWorkspaceAntiDominanceMultiplier(
        template,
        settings,
      );
      const finalScore = template.isFeedEligible
        ? template.rankingScore * antiDominanceMultiplier
        : template.finalScore;

      return {
        ...template,
        antiDominanceMultiplier,
        explorationCandidate:
          template.exposureStats?.explorationEligible ??
          template.explorationCandidate,
        finalScore,
      };
    })
    .toSorted(
      (left, right) =>
        getWorkspaceDisplayScore(right) - getWorkspaceDisplayScore(left) ||
        left.name.localeCompare(right.name),
    );
}

function buildWorkspaceDisplayEntries(
  rankedTemplates: RankedTemplate[],
  settings: RankingSettings,
) {
  const freeEntries = buildLaneSelectionEntries(
    rankedTemplates,
    settings,
    "free",
  );
  const paidEntries = buildLaneSelectionEntries(
    rankedTemplates,
    settings,
    "paid",
  );

  return interleaveLaneSelectionEntries(freeEntries, paidEntries);
}

function buildWorkspacePipelineSnapshots(
  rankedTemplates: RankedTemplate[],
  displayEntries: LaneSelectionEntry[],
  settings: RankingSettings,
) {
  const pipelineSnapshots = new Map<string, TemplatePipelineSnapshot>();
  const displayPositionByKey = new Map(
    displayEntries.map((entry, index) => [
      getTemplateIdentityKey(entry.template),
      {
        displayPosition: index,
        reservedAgePriorityApplied: entry.reservedAgePriorityApplied,
      },
    ] as const),
  );

  for (const template of rankedTemplates) {
    const key = getTemplateIdentityKey(template);
    const placement = displayPositionByKey.get(key);

    pipelineSnapshots.set(template.name, {
      agePriorityCandidate: isWorkspaceExplorationCandidate(
        template,
        settings,
      ),
      displayPosition: placement?.displayPosition ?? null,
      feedEligible: template.isFeedEligible,
      feedIneligibilityLabel: template.feedIneligibilityLabel,
      feedPosition: placement?.displayPosition ?? null,
      finalFeedScore: template.finalScore,
      rankingScore: template.rankingScore,
      reservedAgePriorityApplied:
        placement?.reservedAgePriorityApplied ?? false,
      rotationMultiplier:
        template.rankingScore !== 0
          ? template.finalScore / template.rankingScore
          : null,
    });
  }

  return pipelineSnapshots;
}

export function runTemplateWorkspaceRankingPipeline(
  seeds: TemplateSeed[],
  settings: RankingSettings,
): TemplateWorkspacePipelineResult {
  const rankingSeeds = seeds;
  const rankedTemplates = applyWorkspaceAntiDominance(
    scoreTemplates(settings, rankingSeeds),
    settings,
  );
  const displayEntries = buildWorkspaceDisplayEntries(
    rankedTemplates,
    settings,
  );

  return {
    displayTemplates: displayEntries.map((entry) => entry.template),
    pipelineSnapshots: buildWorkspacePipelineSnapshots(
      rankedTemplates,
      displayEntries,
      settings,
    ),
    rankedTemplates,
    rankingSeeds,
  };
}

export function getTemplateWorkspaceMinimumViews(
  settings: SidebarSettingsState,
) {
  return getNumericSettingValue(
    settings,
    "Minimum Views",
    TIME_WINDOW_SECTION_TITLE,
  );
}

export function filterTemplateWorkspaceSeedsByMinimumViews(
  seeds: TemplateSeed[],
  settings: SidebarSettingsState,
) {
  const lookbackWindow = getDropdownSettingValue(
    settings,
    TIME_WINDOW_SECTION_TITLE,
    "Lookback window",
  ) as LookbackWindow;
  const minimumViews = getTemplateWorkspaceMinimumViews(settings);

  return seeds.filter((seed) => {
    const views =
      lookbackWindow === "7 days"
        ? seed.week[0]
        : seed.month[0];

    return views >= minimumViews;
  });
}
