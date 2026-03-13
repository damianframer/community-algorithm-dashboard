import type {
  DropdownFieldState,
  NumericFieldState,
  SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import { getTemplateSlug } from "@/features/templates/lib/template-paths";

export type TemplatePricingType = "free" | "paid";
export type TemplateOverride = "none" | "great" | "bad";
export type StatsRange = "week" | "month";
export type LookbackWindow = "7 days" | "30 days" | "90 days";
export type MomentumWindow = "3 days" | "7 days" | "14 days" | "30 days";

type MetricTuple = [views: number, previews: number, remixes: number, conversions: number];

export type RankingMetricSet = {
  conversions: number;
  newUserActivations: number;
  previews: number;
  remixes: number;
  revenue: number;
  views: number;
};

export type TemplateSeed = {
  adminOverride: TemplateOverride;
  ageDays: number;
  category: string;
  creator: string;
  daysInTrending: number;
  daysSinceLastTrending: number | null;
  explorationCandidate: boolean;
  isCurrentlyTrending: boolean;
  momentum: {
    previousPreviewGrowth: number;
    previousRemixGrowth: number;
    previewGrowth: number;
    remixGrowth: number;
  };
  month: MetricTuple;
  name: string;
  previewBase: string;
  previewGlow: string;
  pricingLabel: string;
  pricingType: TemplatePricingType;
  quarter?: MetricTuple;
  revenuePerConversion: number;
  thumbnailUrl?: string;
  week: MetricTuple;
  newUserRate: number;
};

export type RankedTemplateStats = Pick<RankingMetricSet, "views" | "previews" | "remixes" | "conversions"> & {
  revenue: number;
  newUserActivations: number;
};

export type RankedTemplate = {
  adminOverride: TemplateOverride;
  ageDays: number;
  category: string;
  creator: string;
  daysInTrending: number;
  isCurrentlyTrending: boolean;
  isFeedEligible: boolean;
  explorationCandidate: boolean;
  finalScore: number;
  name: string;
  previewBase: string;
  previewGlow: string;
  thumbnailUrl?: string;
  pricingLabel: string;
  pricingType: TemplatePricingType;
  stats: Record<StatsRange, RankedTemplateStats>;
};

export type RankingSettings = {
  accelerationWeight: number;
  categoryCap: number;
  cooldown: number;
  conversionRateWeight: number;
  conversionsWeight: number;
  creatorCap: number;
  ctrThreshold: number;
  durationDecay: number;
  explorationPercent: number;
  freshBoostDuration: number;
  freshTemplateBoost: number;
  lifetimeWeight: number;
  lookbackWindow: LookbackWindow;
  maxDays: number;
  minPreviews: number;
  minRemixes: number;
  momentumWeight: number;
  momentumWindow: MomentumWindow;
  newUserBoost: number;
  overrideBoost: number;
  overrideDecay: number;
  paidConversionMultiplier: number;
  paidMinPreviews: number;
  paidMinRemixes: number;
  paidRemixMultiplier: number;
  previewRateWeight: number;
  previewsWeight: number;
  recencyWeight: number;
  remixesWeight: number;
  remixRateWeight: number;
  revenueEfficiencyWeight: number;
  revenueWeight: number;
  viewsWeight: number;
};

type TemplateDefinition = Omit<TemplateSeed, "month" | "quarter" | "week"> & {
  lifetime: RankingMetricSet;
  month: RankingMetricSet;
  quarter: RankingMetricSet;
  thumbnailUrl?: string;
  week: RankingMetricSet;
};

const templateThumbnailUrls = [
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F51012%2Fxtract-xqzXUvtiwNfRpXdCNOSbHGhjlIXzdS&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F53466%2Fviral-eiXeroCBYNt4GbJaWO6MBeqzNu1Q7T&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F50744%2Ffabrica-RXrmPPc9YMOnPdwKvStOaE6BffXhoj&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F49775%2Fsuperior-ZsPtCt6yei7TEo3I8jsCXoNm34LlkK&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F50716%2Fportfolite-tSdwL2z7uMF6IBuGzhEUgbCmCKfrgt&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F57495%2Fportez-7VAsrKxtBa0evc2Jp3mxCTMFSJflVS&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F55602%2Fpreelio-i8w6bSSDDkflqbNH9y9gs42I4kLTgu&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F52038%2Forbai-wl01JtZG34cLRjQFIM1p97TJrvdCKN&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F45955%2Fpearl-tAAPET5MSOsE1HHKMijfwtUHKw80yW&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F52723%2Fkanso-kg2U0s0rpYkwrBtCWM4jZzVbsxbk6o&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F50147%2Flandio-AKmog8ctF9MCV76Jfav3GhrsMQGnoI&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F55582%2Ffizens-KFUEdvzppngDOcdt8GBQc4D2SDiFW6&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F51964%2Fportavia-cHCplMO9DbnDQqYPVZXnAmlcltiTcB&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F48693%2Farpeggio-qRMShpuUYEGcVULUbvnU2MOUXmhQ1o&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F54074%2Fpalmer-AQEbhDjpT4yCnWbCg9F1WJHbDxJVPs&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F54720%2Fai-supply-8FfceZkv3rkf6cI8AGl2Idi5LSrLOp&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F53016%2Fdraftr-oBWLGFZgtUfVOcJsCicxS1mPY6zNk6&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F53653%2Fclearpath-as0qTkX51A233O09b7U5ZHJTq3YgkI&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F45423%2Flimitless-iUrhuyeHT4wlKxawc6lNUp0ygapDL4&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F55472%2Fvectura-1n3Kk0xkPPxa7KzfgJXu6caPYQdCk8&w=3840&q=100",
  "https://www.framer.com/creators-assets/_next/image/?url=https%3A%2F%2Fy4pdgnepgswqffpt.public.blob.vercel-storage.com%2Ftemplates%2F50281%2Frefit-KHrqxTg7MUBBlJKeWxfwRIH2EA4T49&w=3840&q=100",
] as const;

const defaultFeedThumbnailNames = [
  "Nova Grid",
  "Xtract",
  "Orbit",
  "Signal",
  "Monaco",
  "Pulsekit",
  "Halo",
  "Viewport",
  "Avenue",
  "Pixeldeck",
  "Stelvio",
  "Quartz",
  "Northstar",
  "Solace",
  "Launchboard",
  "Formica",
  "Axel",
  "Driftline",
  "Limitless",
  "Marble",
  "Vanta",
] as const;

const defaultFeedThumbnailAssignments = new Map<string, string>(
  defaultFeedThumbnailNames.map((name, index) => [name, templateThumbnailUrls[index]]),
);

const templateSeeds: TemplateSeed[] = [
  {
    name: "Stelvio",
    creator: "Maya Cole",
    category: "Portfolio",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(145deg, #07090f 10%, #0d1324 54%, #2c6cff 100%)",
    previewGlow: "radial-gradient(circle at 18% 16%, rgba(51, 117, 255, 0.9), transparent 22%)",
    week: [4218, 3091, 542, 34],
    month: [16796, 12906, 2385, 126],
    revenuePerConversion: 24,
    newUserRate: 0.24,
    ageDays: 34,
    isCurrentlyTrending: true,
    daysInTrending: 2,
    daysSinceLastTrending: null,
    adminOverride: "great",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.16, remixGrowth: 0.22, previousPreviewGrowth: 0.1, previousRemixGrowth: 0.12 },
  },
  {
    name: "Axel",
    creator: "Owen Hart",
    category: "SaaS",
    pricingType: "paid",
    pricingLabel: "$64",
    previewBase: "linear-gradient(135deg, #ece7c6 0%, #f3eed5 32%, #dcceb4 100%)",
    previewGlow: "radial-gradient(circle at 42% 28%, rgba(255, 138, 0, 0.38), transparent 28%)",
    week: [3762, 2644, 401, 27],
    month: [14352, 10842, 1908, 101],
    revenuePerConversion: 32,
    newUserRate: 0.16,
    ageDays: 52,
    isCurrentlyTrending: true,
    daysInTrending: 4,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.08, remixGrowth: 0.1, previousPreviewGrowth: 0.06, previousRemixGrowth: 0.07 },
  },
  {
    name: "Xtract",
    creator: "Lina Park",
    category: "Agency",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(135deg, #121212 10%, #2e122f 55%, #6d2c8f 100%)",
    previewGlow: "radial-gradient(circle at 72% 18%, rgba(228, 92, 255, 0.3), transparent 30%)",
    week: [3341, 2303, 367, 25],
    month: [12907, 9711, 1664, 94],
    revenuePerConversion: 22,
    newUserRate: 0.22,
    ageDays: 18,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 6,
    adminOverride: "none",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.28, remixGrowth: 0.34, previousPreviewGrowth: 0.12, previousRemixGrowth: 0.14 },
  },
  {
    name: "Launchboard",
    creator: "Theo Reed",
    category: "SaaS",
    pricingType: "paid",
    pricingLabel: "$79",
    previewBase: "linear-gradient(145deg, #0a141e 0%, #0e2c36 52%, #00b2ff 100%)",
    previewGlow: "radial-gradient(circle at 78% 20%, rgba(0, 191, 255, 0.35), transparent 28%)",
    week: [3112, 2138, 348, 23],
    month: [11944, 8956, 1521, 88],
    revenuePerConversion: 34,
    newUserRate: 0.15,
    ageDays: 63,
    isCurrentlyTrending: true,
    daysInTrending: 3,
    daysSinceLastTrending: null,
    adminOverride: "great",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.14, remixGrowth: 0.2, previousPreviewGrowth: 0.08, previousRemixGrowth: 0.1 },
  },
  {
    name: "Chainlight",
    creator: "Aria Stone",
    category: "SaaS",
    pricingType: "paid",
    pricingLabel: "$59",
    previewBase: "linear-gradient(135deg, #0f1115 0%, #1a1d2d 48%, #4f6bff 100%)",
    previewGlow: "radial-gradient(circle at 16% 78%, rgba(126, 145, 255, 0.3), transparent 28%)",
    week: [2954, 2081, 319, 21],
    month: [11288, 8203, 1402, 82],
    revenuePerConversion: 30,
    newUserRate: 0.13,
    ageDays: 81,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 2,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.04, remixGrowth: 0.02, previousPreviewGrowth: 0.07, previousRemixGrowth: 0.05 },
  },
  {
    name: "Limitless",
    creator: "Jonah Vale",
    category: "Startup",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(140deg, #0d0f0f 0%, #1f2622 46%, #73b98f 100%)",
    previewGlow: "radial-gradient(circle at 82% 24%, rgba(115, 185, 143, 0.3), transparent 28%)",
    week: [2821, 1992, 306, 20],
    month: [10874, 7982, 1346, 79],
    revenuePerConversion: 20,
    newUserRate: 0.25,
    ageDays: 26,
    isCurrentlyTrending: true,
    daysInTrending: 5,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.19, remixGrowth: 0.23, previousPreviewGrowth: 0.1, previousRemixGrowth: 0.11 },
  },
  {
    name: "Nova Grid",
    creator: "Lina Park",
    category: "Startup",
    pricingType: "paid",
    pricingLabel: "$69",
    previewBase: "linear-gradient(145deg, #0e1014 0%, #1a1829 54%, #8a5cff 100%)",
    previewGlow: "radial-gradient(circle at 30% 24%, rgba(138, 92, 255, 0.3), transparent 28%)",
    week: [2744, 1935, 288, 18],
    month: [10443, 7648, 1284, 73],
    revenuePerConversion: 30,
    newUserRate: 0.14,
    ageDays: 15,
    isCurrentlyTrending: true,
    daysInTrending: 1,
    daysSinceLastTrending: null,
    adminOverride: "great",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.31, remixGrowth: 0.38, previousPreviewGrowth: 0.09, previousRemixGrowth: 0.12 },
  },
  {
    name: "Orbit",
    creator: "Maya Cole",
    category: "Portfolio",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(135deg, #0a1018 0%, #102338 46%, #2ca0ff 100%)",
    previewGlow: "radial-gradient(circle at 24% 82%, rgba(44, 160, 255, 0.28), transparent 28%)",
    week: [2688, 1876, 274, 18],
    month: [10084, 7301, 1226, 69],
    revenuePerConversion: 19,
    newUserRate: 0.23,
    ageDays: 57,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 9,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.03, remixGrowth: 0.05, previousPreviewGrowth: 0.02, previousRemixGrowth: 0.03 },
  },
  {
    name: "Vanta",
    creator: "Sia Moreau",
    category: "Commerce",
    pricingType: "paid",
    pricingLabel: "$39",
    previewBase: "linear-gradient(135deg, #0c0d10 0%, #1f1218 48%, #d14d7a 100%)",
    previewGlow: "radial-gradient(circle at 84% 18%, rgba(209, 77, 122, 0.26), transparent 28%)",
    week: [2541, 1804, 252, 17],
    month: [9706, 7012, 1163, 65],
    revenuePerConversion: 28,
    newUserRate: 0.11,
    ageDays: 48,
    isCurrentlyTrending: true,
    daysInTrending: 6,
    daysSinceLastTrending: null,
    adminOverride: "bad",
    explorationCandidate: false,
    momentum: { previewGrowth: -0.04, remixGrowth: -0.02, previousPreviewGrowth: 0.05, previousRemixGrowth: 0.04 },
  },
  {
    name: "Helio",
    creator: "Remy Fox",
    category: "Commerce",
    pricingType: "paid",
    pricingLabel: "$59",
    previewBase: "linear-gradient(145deg, #1b1204 0%, #4f2200 52%, #ff9d00 100%)",
    previewGlow: "radial-gradient(circle at 18% 20%, rgba(255, 157, 0, 0.32), transparent 30%)",
    week: [2462, 1738, 244, 16],
    month: [9355, 6784, 1118, 62],
    revenuePerConversion: 31,
    newUserRate: 0.12,
    ageDays: 31,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 1,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.09, remixGrowth: 0.11, previousPreviewGrowth: 0.04, previousRemixGrowth: 0.06 },
  },
  {
    name: "Monaco",
    creator: "Ivy March",
    category: "Portfolio",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(140deg, #0d0e10 0%, #262626 46%, #8d8d8d 100%)",
    previewGlow: "radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.15), transparent 30%)",
    week: [2341, 1669, 228, 15],
    month: [8981, 6431, 1082, 58],
    revenuePerConversion: 18,
    newUserRate: 0.21,
    ageDays: 94,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.02, remixGrowth: 0.01, previousPreviewGrowth: 0.04, previousRemixGrowth: 0.03 },
  },
  {
    name: "Driftline",
    creator: "Luca Finn",
    category: "Directory",
    pricingType: "paid",
    pricingLabel: "$89",
    previewBase: "linear-gradient(145deg, #0d1115 0%, #131f2e 40%, #2f5b86 100%)",
    previewGlow: "radial-gradient(circle at 28% 18%, rgba(76, 141, 220, 0.28), transparent 28%)",
    week: [2273, 1598, 216, 15],
    month: [8617, 6142, 1026, 55],
    revenuePerConversion: 36,
    newUserRate: 0.12,
    ageDays: 72,
    isCurrentlyTrending: true,
    daysInTrending: 4,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.07, remixGrowth: 0.09, previousPreviewGrowth: 0.06, previousRemixGrowth: 0.07 },
  },
  {
    name: "Solace",
    creator: "Lina Park",
    category: "Startup",
    pricingType: "paid",
    pricingLabel: "$29",
    previewBase: "linear-gradient(135deg, #0f1115 0%, #1a1822 52%, #a88bf0 100%)",
    previewGlow: "radial-gradient(circle at 80% 24%, rgba(168, 139, 240, 0.24), transparent 30%)",
    week: [2196, 1541, 205, 14],
    month: [8308, 5933, 981, 53],
    revenuePerConversion: 26,
    newUserRate: 0.13,
    ageDays: 12,
    isCurrentlyTrending: true,
    daysInTrending: 2,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.26, remixGrowth: 0.29, previousPreviewGrowth: 0.1, previousRemixGrowth: 0.12 },
  },
  {
    name: "Pixeldeck",
    creator: "Luca Finn",
    category: "Editorial",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(145deg, #140f12 0%, #321926 48%, #ff5e91 100%)",
    previewGlow: "radial-gradient(circle at 22% 80%, rgba(255, 94, 145, 0.24), transparent 28%)",
    week: [2108, 1469, 198, 13],
    month: [7994, 5711, 943, 50],
    revenuePerConversion: 17,
    newUserRate: 0.2,
    ageDays: 23,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.12, remixGrowth: 0.08, previousPreviewGrowth: 0.06, previousRemixGrowth: 0.05 },
  },
  {
    name: "Northstar",
    creator: "Maya Cole",
    category: "SaaS",
    pricingType: "paid",
    pricingLabel: "$99",
    previewBase: "linear-gradient(145deg, #091018 0%, #13253d 48%, #47a3ff 100%)",
    previewGlow: "radial-gradient(circle at 76% 18%, rgba(71, 163, 255, 0.28), transparent 30%)",
    week: [2041, 1408, 187, 12],
    month: [7682, 5468, 901, 48],
    revenuePerConversion: 38,
    newUserRate: 0.1,
    ageDays: 108,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 12,
    adminOverride: "bad",
    explorationCandidate: false,
    momentum: { previewGrowth: -0.02, remixGrowth: 0.01, previousPreviewGrowth: 0.02, previousRemixGrowth: 0.03 },
  },
  {
    name: "Pulsekit",
    creator: "Jonah Vale",
    category: "Commerce",
    pricingType: "paid",
    pricingLabel: "$49",
    previewBase: "linear-gradient(140deg, #0d1211 0%, #12261f 46%, #4bc79f 100%)",
    previewGlow: "radial-gradient(circle at 18% 18%, rgba(75, 199, 159, 0.24), transparent 30%)",
    week: [1982, 1364, 181, 12],
    month: [7408, 5291, 878, 46],
    revenuePerConversion: 29,
    newUserRate: 0.11,
    ageDays: 39,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 4,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.05, remixGrowth: 0.04, previousPreviewGrowth: 0.02, previousRemixGrowth: 0.03 },
  },
  {
    name: "Marble",
    creator: "Ivy March",
    category: "Portfolio",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(145deg, #111111 0%, #242424 48%, #7c7c7c 100%)",
    previewGlow: "radial-gradient(circle at 84% 78%, rgba(255, 255, 255, 0.12), transparent 30%)",
    week: [1934, 1318, 174, 11],
    month: [7146, 5073, 842, 44],
    revenuePerConversion: 16,
    newUserRate: 0.19,
    ageDays: 44,
    isCurrentlyTrending: true,
    daysInTrending: 5,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.06, remixGrowth: 0.05, previousPreviewGrowth: 0.03, previousRemixGrowth: 0.03 },
  },
  {
    name: "Avenue",
    creator: "Sia Moreau",
    category: "Agency",
    pricingType: "paid",
    pricingLabel: "$59",
    previewBase: "linear-gradient(145deg, #15110d 0%, #2f2014 52%, #c78440 100%)",
    previewGlow: "radial-gradient(circle at 26% 20%, rgba(199, 132, 64, 0.25), transparent 30%)",
    week: [4308, 1276, 168, 11],
    month: [15401, 4901, 811, 42],
    revenuePerConversion: 27,
    newUserRate: 0.12,
    ageDays: 17,
    isCurrentlyTrending: true,
    daysInTrending: 1,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.24, remixGrowth: 0.27, previousPreviewGrowth: 0.08, previousRemixGrowth: 0.1 },
  },
  {
    name: "Halo",
    creator: "Owen Hart",
    category: "Startup",
    pricingType: "paid",
    pricingLabel: "$19",
    previewBase: "linear-gradient(145deg, #0d1018 0%, #1a1733 50%, #7e78ff 100%)",
    previewGlow: "radial-gradient(circle at 78% 16%, rgba(126, 120, 255, 0.24), transparent 28%)",
    week: [4621, 1243, 161, 10],
    month: [17122, 4759, 786, 40],
    revenuePerConversion: 22,
    newUserRate: 0.13,
    ageDays: 10,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.22, remixGrowth: 0.31, previousPreviewGrowth: 0.06, previousRemixGrowth: 0.08 },
  },
  {
    name: "Cascade",
    creator: "Sia Moreau",
    category: "Agency",
    pricingType: "paid",
    pricingLabel: "$79",
    previewBase: "linear-gradient(145deg, #0c1214 0%, #11252b 48%, #2fd5de 100%)",
    previewGlow: "radial-gradient(circle at 18% 76%, rgba(47, 213, 222, 0.24), transparent 28%)",
    week: [1768, 1198, 155, 10],
    month: [6501, 4614, 759, 39],
    revenuePerConversion: 33,
    newUserRate: 0.12,
    ageDays: 29,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 2,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.11, remixGrowth: 0.12, previousPreviewGrowth: 0.08, previousRemixGrowth: 0.09 },
  },
  {
    name: "Formica",
    creator: "Luca Finn",
    category: "Portfolio",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(145deg, #12100f 0%, #282019 46%, #977b5f 100%)",
    previewGlow: "radial-gradient(circle at 84% 24%, rgba(151, 123, 95, 0.22), transparent 28%)",
    week: [4810, 1164, 149, 10],
    month: [16882, 4482, 733, 37],
    revenuePerConversion: 15,
    newUserRate: 0.18,
    ageDays: 61,
    isCurrentlyTrending: true,
    daysInTrending: 3,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.04, remixGrowth: 0.03, previousPreviewGrowth: 0.05, previousRemixGrowth: 0.04 },
  },
  {
    name: "Viewport",
    creator: "Theo Reed",
    category: "Directory",
    pricingType: "paid",
    pricingLabel: "$69",
    previewBase: "linear-gradient(145deg, #0c1119 0%, #122334 44%, #4ca3d9 100%)",
    previewGlow: "radial-gradient(circle at 24% 22%, rgba(76, 163, 217, 0.22), transparent 28%)",
    week: [5660, 1121, 144, 9],
    month: [20341, 4341, 706, 36],
    revenuePerConversion: 30,
    newUserRate: 0.11,
    ageDays: 21,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: null,
    adminOverride: "none",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.2, remixGrowth: 0.24, previousPreviewGrowth: 0.08, previousRemixGrowth: 0.09 },
  },
  {
    name: "Quartz",
    creator: "Remy Fox",
    category: "Editorial",
    pricingType: "free",
    pricingLabel: "Free",
    previewBase: "linear-gradient(140deg, #0f0f10 0%, #212121 46%, #717171 100%)",
    previewGlow: "radial-gradient(circle at 76% 80%, rgba(255, 255, 255, 0.1), transparent 30%)",
    week: [2980, 1082, 139, 9],
    month: [11041, 4201, 681, 35],
    revenuePerConversion: 14,
    newUserRate: 0.17,
    ageDays: 76,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    daysSinceLastTrending: 7,
    adminOverride: "none",
    explorationCandidate: false,
    momentum: { previewGrowth: 0.03, remixGrowth: 0.02, previousPreviewGrowth: 0.03, previousRemixGrowth: 0.02 },
  },
  {
    name: "Signal",
    creator: "Aria Stone",
    category: "SaaS",
    pricingType: "paid",
    pricingLabel: "$89",
    previewBase: "linear-gradient(145deg, #101114 0%, #24171a 46%, #e25a4f 100%)",
    previewGlow: "radial-gradient(circle at 80% 18%, rgba(226, 90, 79, 0.22), transparent 30%)",
    week: [6202, 1048, 133, 9],
    month: [22842, 4088, 659, 34],
    revenuePerConversion: 34,
    newUserRate: 0.1,
    ageDays: 9,
    isCurrentlyTrending: true,
    daysInTrending: 1,
    daysSinceLastTrending: null,
    adminOverride: "great",
    explorationCandidate: true,
    momentum: { previewGrowth: 0.37, remixGrowth: 0.44, previousPreviewGrowth: 0.09, previousRemixGrowth: 0.11 },
  },
];

function roundMetricValue(value: number) {
  return Math.max(0, Math.round(value));
}

function buildMetricSet(
  [views, previews, remixes, conversions]: MetricTuple,
  revenuePerConversion: number,
  newUserRate: number,
): RankingMetricSet {
  return {
    views,
    previews,
    remixes,
    conversions,
    revenue: roundMetricValue(conversions * revenuePerConversion),
    newUserActivations: roundMetricValue(remixes * newUserRate),
  };
}

function scaleMetricSet(metrics: RankingMetricSet, multiplier: number): RankingMetricSet {
  return {
    views: roundMetricValue(metrics.views * multiplier),
    previews: roundMetricValue(metrics.previews * multiplier),
    remixes: roundMetricValue(metrics.remixes * multiplier),
    conversions: roundMetricValue(metrics.conversions * multiplier),
    revenue: roundMetricValue(metrics.revenue * multiplier),
    newUserActivations: roundMetricValue(metrics.newUserActivations * multiplier),
  };
}

function blendMetricSets(
  source: RankingMetricSet,
  target: RankingMetricSet,
  progress: number,
): RankingMetricSet {
  return {
    views: roundMetricValue(source.views + (target.views - source.views) * progress),
    previews: roundMetricValue(source.previews + (target.previews - source.previews) * progress),
    remixes: roundMetricValue(source.remixes + (target.remixes - source.remixes) * progress),
    conversions: roundMetricValue(source.conversions + (target.conversions - source.conversions) * progress),
    revenue: roundMetricValue(source.revenue + (target.revenue - source.revenue) * progress),
    newUserActivations: roundMetricValue(
      source.newUserActivations + (target.newUserActivations - source.newUserActivations) * progress,
    ),
  };
}

function capMetricSet(metrics: RankingMetricSet, maxMetrics: RankingMetricSet): RankingMetricSet {
  return {
    views: Math.min(metrics.views, maxMetrics.views),
    previews: Math.min(metrics.previews, maxMetrics.previews),
    remixes: Math.min(metrics.remixes, maxMetrics.remixes),
    conversions: Math.min(metrics.conversions, maxMetrics.conversions),
    revenue: Math.min(metrics.revenue, maxMetrics.revenue),
    newUserActivations: Math.min(metrics.newUserActivations, maxMetrics.newUserActivations),
  };
}

function buildLifetimeMetrics(monthMetrics: RankingMetricSet, ageDays: number) {
  const lifetimeMultiplier = Math.max(1.25, ageDays / 20);
  return scaleMetricSet(monthMetrics, lifetimeMultiplier);
}

function buildDefinitionFromSeed(seed: TemplateSeed, fallbackThumbnail?: string): TemplateDefinition {
  const week = buildMetricSet(seed.week, seed.revenuePerConversion, seed.newUserRate);
  const month = buildMetricSet(seed.month, seed.revenuePerConversion, seed.newUserRate);
  const quarter = seed.quarter
    ? buildMetricSet(seed.quarter, seed.revenuePerConversion, seed.newUserRate)
    : scaleMetricSet(month, 2.75);

  return {
    ...seed,
    thumbnailUrl: seed.thumbnailUrl ?? fallbackThumbnail,
    week,
    month,
    quarter,
    lifetime: buildLifetimeMetrics(month, seed.ageDays),
  };
}

const defaultTemplateDefinitions: TemplateDefinition[] = templateSeeds.map((seed) =>
  buildDefinitionFromSeed(seed, defaultFeedThumbnailAssignments.get(seed.name)),
);

function buildTemplateDefinitions(seeds: TemplateSeed[]): TemplateDefinition[] {
  return seeds.map((seed) =>
    buildDefinitionFromSeed(seed, defaultFeedThumbnailAssignments.get(seed.name)),
  );
}

function getNumericSettingValue(
  settings: SidebarSettingsState,
  section: string,
  label: string,
) {
  return (settings[section][label] as NumericFieldState).value;
}

function getDropdownSettingValue(
  settings: SidebarSettingsState,
  section: string,
  label: string,
) {
  return (settings[section][label] as DropdownFieldState).value;
}

export function getRankingSettings(settings: SidebarSettingsState): RankingSettings {
  return {
    viewsWeight: getNumericSettingValue(settings, "Weight Metrics", "Views"),
    previewsWeight: getNumericSettingValue(settings, "Weight Metrics", "Previews"),
    remixesWeight: getNumericSettingValue(settings, "Weight Metrics", "Remixes"),
    conversionsWeight: getNumericSettingValue(settings, "Weight Metrics", "Conversions"),
    revenueWeight: getNumericSettingValue(settings, "Weight Metrics", "Revenue"),
    previewRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Preview Rate"),
    remixRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Remix Rate"),
    conversionRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Conversion Rate"),
    revenueEfficiencyWeight: getNumericSettingValue(settings, "Rate Metrics", "Revenue Efficiency"),
    paidRemixMultiplier: getNumericSettingValue(settings, "Paid Template Normalization", "Remix Multiplier"),
    paidConversionMultiplier: getNumericSettingValue(settings, "Paid Template Normalization", "Conversion multiplier"),
    newUserBoost: getNumericSettingValue(settings, "New User Activation", "Boost"),
    lookbackWindow: getDropdownSettingValue(settings, "Time Window", "Lookback window") as LookbackWindow,
    recencyWeight: getNumericSettingValue(settings, "Time Window", "Recency weight"),
    lifetimeWeight: getNumericSettingValue(settings, "Time Window", "Lifetime weight"),
    freshTemplateBoost: getNumericSettingValue(settings, "Time Window", "Fresh template boost"),
    freshBoostDuration: getNumericSettingValue(settings, "Time Window", "Fresh boost duration"),
    minPreviews: getNumericSettingValue(settings, "Minimum Statistics", "Min. Previews"),
    minRemixes: getNumericSettingValue(settings, "Minimum Statistics", "Min. Remixes"),
    paidMinPreviews: getNumericSettingValue(settings, "Minimum Statistics", "Paid Min. Previews"),
    paidMinRemixes: getNumericSettingValue(settings, "Minimum Statistics", "Paid Min. Remixes"),
    momentumWindow: getDropdownSettingValue(settings, "Momentum", "Window") as MomentumWindow,
    momentumWeight: getNumericSettingValue(settings, "Momentum", "Weight"),
    accelerationWeight: getNumericSettingValue(settings, "Momentum", "Acceleration"),
    durationDecay: getNumericSettingValue(settings, "Trending Rotation", "Duration decay"),
    maxDays: getNumericSettingValue(settings, "Trending Rotation", "Max Days"),
    cooldown: getNumericSettingValue(settings, "Trending Rotation", "Cooldown"),
    ctrThreshold: getNumericSettingValue(settings, "Trending Rotation", "CTR Threshold"),
    explorationPercent: getNumericSettingValue(settings, "Exploration", "Exploration"),
    creatorCap: getNumericSettingValue(settings, "Diversity", "Creator Cap"),
    categoryCap: getNumericSettingValue(settings, "Diversity", "Category Cap"),
    overrideBoost: getNumericSettingValue(settings, "Overrides", "Boost"),
    overrideDecay: getNumericSettingValue(settings, "Overrides", "Decay"),
  };
}

function resolveRecentMetrics(
  template: TemplateDefinition,
  lookbackWindow: LookbackWindow,
) {
  switch (lookbackWindow) {
    case "7 days":
      return template.week;
    case "30 days":
      return template.month;
    case "90 days":
      return template.quarter;
    default:
      return template.month;
  }
}

function getAdjustedMetrics(
  metrics: RankingMetricSet,
  template: TemplateDefinition,
  settings: RankingSettings,
) {
  const isPaid = template.pricingType === "paid";
  const remixMultiplier = isPaid ? settings.paidRemixMultiplier : 1;
  const conversionMultiplier = isPaid ? settings.paidConversionMultiplier : 1;

  return {
    remixes: metrics.remixes * remixMultiplier,
    conversions: metrics.conversions * conversionMultiplier,
  };
}

function clampGrowth(growth: number) {
  return Math.max(growth, -0.95);
}

function computeMomentumScore(
  template: TemplateDefinition,
  settings: RankingSettings,
) {
  const windowFactor =
    settings.momentumWindow === "3 days"
      ? 1.2
      : settings.momentumWindow === "7 days"
        ? 1
        : settings.momentumWindow === "14 days"
          ? 0.82
          : 0.6;

  const previewGrowth = clampGrowth(template.momentum.previewGrowth * windowFactor);
  const remixGrowth = clampGrowth(template.momentum.remixGrowth * windowFactor);
  const previousPreviewGrowth = clampGrowth(
    template.momentum.previousPreviewGrowth * windowFactor,
  );
  const previousRemixGrowth = clampGrowth(
    template.momentum.previousRemixGrowth * windowFactor,
  );

  const baseMomentumCurrent = 0.4 * previewGrowth + 0.6 * remixGrowth;
  const baseMomentumPrevious = 0.4 * previousPreviewGrowth + 0.6 * previousRemixGrowth;
  const accelerationValue = Math.max(0, baseMomentumCurrent - baseMomentumPrevious);

  return (
    settings.momentumWeight * Math.max(0, baseMomentumCurrent) +
    settings.accelerationWeight * accelerationValue
  );
}

function meetsTrendingMinimums(
  template: TemplateDefinition,
  recentMetrics: RankingMetricSet,
  settings: RankingSettings,
) {
  const isPaid = template.pricingType === "paid";
  const minimumPreviews = isPaid ? settings.paidMinPreviews : settings.minPreviews;
  const minimumRemixes = isPaid ? settings.paidMinRemixes : settings.minRemixes;

  return (
    recentMetrics.previews >= minimumPreviews &&
    recentMetrics.remixes >= minimumRemixes
  );
}

function computeRotationMultiplier(
  template: TemplateDefinition,
  recentMetrics: RankingMetricSet,
  settings: RankingSettings,
) {
  if (template.isCurrentlyTrending && template.daysInTrending > settings.maxDays) {
    return { eligible: false, value: 0 };
  }

  if (
    !template.isCurrentlyTrending &&
    template.daysSinceLastTrending !== null &&
    template.daysSinceLastTrending < settings.cooldown
  ) {
    return { eligible: false, value: 0 };
  }

  const durationMultiplier = Math.max(
    0,
    1 - settings.durationDecay * template.daysInTrending,
  );
  const ctr = recentMetrics.previews / Math.max(recentMetrics.views, 1);
  const ctrMultiplier =
    ctr >= settings.ctrThreshold
      ? 1
      : ctr / Math.max(settings.ctrThreshold, 0.0001);

  return {
    eligible: true,
    value: durationMultiplier * ctrMultiplier,
  };
}

function getOverrideMultiplier(
  adminOverride: TemplateOverride,
  settings: RankingSettings,
) {
  if (adminOverride === "great") {
    return settings.overrideBoost;
  }

  if (adminOverride === "bad") {
    return settings.overrideDecay;
  }

  return 1;
}

type ScoreComponent = {
  label: string;
  score: number;
};

type TemplateScoreDetails = {
  componentRows: ScoreComponent[];
  finalScore: number;
  isFeedEligible: boolean;
};

function getFeedIneligibilityLabel(
  template: TemplateDefinition,
  settings: RankingSettings,
  minimumsMet: boolean,
  rotationEligible: boolean,
) {
  if (!minimumsMet) {
    return "Below Trending Minimums";
  }

  if (!rotationEligible) {
    if (template.isCurrentlyTrending && template.daysInTrending > settings.maxDays) {
      return "Exceeded Max Trending Days";
    }

    if (
      !template.isCurrentlyTrending &&
      template.daysSinceLastTrending !== null &&
      template.daysSinceLastTrending < settings.cooldown
    ) {
      return "Trending Cooldown";
    }

    return "Feed Ineligible";
  }

  return null;
}

function getTemplateScoreDetails(
  template: TemplateDefinition,
  settings: RankingSettings,
): TemplateScoreDetails {
  const recentMetrics = resolveRecentMetrics(template, settings.lookbackWindow);
  const lifetimeMetrics = template.lifetime;
  const adjusted = getAdjustedMetrics(recentMetrics, template, settings);
  const lifetimeAdjusted = getAdjustedMetrics(lifetimeMetrics, template, settings);
  const rw = settings.recencyWeight / 100;
  const lw = settings.lifetimeWeight / 100;
  const blend = (recent: number, lifetime: number) => rw * recent + lw * lifetime;

  const viewsScore = blend(
    settings.viewsWeight * Math.log(recentMetrics.views + 1),
    settings.viewsWeight * Math.log(lifetimeMetrics.views + 1),
  );
  const previewsScore = blend(
    settings.previewsWeight * Math.log(recentMetrics.previews + 1),
    settings.previewsWeight * Math.log(lifetimeMetrics.previews + 1),
  );
  const remixesScore = blend(
    settings.remixesWeight * Math.log(adjusted.remixes + 1),
    settings.remixesWeight * Math.log(lifetimeAdjusted.remixes + 1),
  );
  const conversionsScore = blend(
    settings.conversionsWeight * Math.log(adjusted.conversions + 1),
    settings.conversionsWeight * Math.log(lifetimeAdjusted.conversions + 1),
  );
  const revenueScore = blend(
    settings.revenueWeight * Math.log(recentMetrics.revenue + 1),
    settings.revenueWeight * Math.log(lifetimeMetrics.revenue + 1),
  );

  const previewRate = recentMetrics.previews / Math.max(recentMetrics.views, 1);
  const lifetimePreviewRate = lifetimeMetrics.previews / Math.max(lifetimeMetrics.views, 1);
  const previewRateScore = blend(
    settings.previewRateWeight * previewRate,
    settings.previewRateWeight * lifetimePreviewRate,
  );

  const remixRate = adjusted.remixes / Math.max(recentMetrics.previews, 1);
  const lifetimeRemixRate =
    lifetimeAdjusted.remixes / Math.max(lifetimeMetrics.previews, 1);
  const remixRateScore = blend(
    settings.remixRateWeight * remixRate,
    settings.remixRateWeight * lifetimeRemixRate,
  );

  const conversionRate = adjusted.conversions / Math.max(adjusted.remixes, 1);
  const lifetimeConversionRate =
    lifetimeAdjusted.conversions / Math.max(lifetimeAdjusted.remixes, 1);
  const conversionRateScore = blend(
    settings.conversionRateWeight * conversionRate,
    settings.conversionRateWeight * lifetimeConversionRate,
  );

  const revenueEfficiency = recentMetrics.revenue / Math.max(adjusted.remixes, 1);
  const lifetimeRevenueEfficiency =
    lifetimeMetrics.revenue / Math.max(lifetimeAdjusted.remixes, 1);
  const revenueEfficiencyScore = blend(
    settings.revenueEfficiencyWeight * revenueEfficiency,
    settings.revenueEfficiencyWeight * lifetimeRevenueEfficiency,
  );

  const newUserScore = blend(
    settings.newUserBoost * Math.log(recentMetrics.newUserActivations + 1),
    settings.newUserBoost * Math.log(lifetimeMetrics.newUserActivations + 1),
  );

  const freshDecay = Math.max(
    0,
    1 - template.ageDays / Math.max(settings.freshBoostDuration, 1),
  );
  const freshBoostScore = settings.freshTemplateBoost * freshDecay;
  const momentumScore = computeMomentumScore(template, settings);
  const overrideMultiplier = getOverrideMultiplier(template.adminOverride, settings);
  const minimumsMet = meetsTrendingMinimums(template, recentMetrics, settings);
  const rotation = computeRotationMultiplier(template, recentMetrics, settings);
  const ineligibilityLabel = getFeedIneligibilityLabel(
    template,
    settings,
    minimumsMet,
    rotation.eligible,
  );

  const componentRows: ScoreComponent[] = [
    { label: "Views", score: viewsScore },
    { label: "Previews", score: previewsScore },
    { label: "Remixes", score: remixesScore },
    { label: "Conversions", score: conversionsScore },
    { label: "Revenue", score: revenueScore },
    { label: "Preview Rate", score: previewRateScore },
    { label: "Remix Rate", score: remixRateScore },
    { label: "Conversion Rate", score: conversionRateScore },
    { label: "Revenue Efficiency", score: revenueEfficiencyScore },
    { label: "New User Activation", score: newUserScore },
    { label: "Fresh Template Boost", score: freshBoostScore },
    { label: "Momentum", score: momentumScore },
  ];

  let runningTotal = componentRows.reduce((total, row) => total + row.score, 0);

  if (overrideMultiplier !== 1) {
    const overrideLabel =
      template.adminOverride === "great" ? "Admin Boost" : "Admin Decay";
    const overrideTotal = runningTotal * overrideMultiplier;
    componentRows.push({
      label: overrideLabel,
      score: overrideTotal - runningTotal,
    });
    runningTotal = overrideTotal;
  }

  if (ineligibilityLabel) {
    if (runningTotal !== 0) {
      componentRows.push({
        label: ineligibilityLabel,
        score: -runningTotal,
      });
    }

    return {
      componentRows,
      finalScore: 0,
      isFeedEligible: false,
    };
  }

  if (rotation.value !== 1) {
    const rotatedTotal = runningTotal * rotation.value;
    componentRows.push({
      label: "Trending Rotation",
      score: rotatedTotal - runningTotal,
    });
    runningTotal = rotatedTotal;
  }

  return {
    componentRows,
    finalScore: runningTotal,
    isFeedEligible: true,
  };
}

export function scoreTemplates(settings: RankingSettings, seeds?: TemplateSeed[]): RankedTemplate[] {
  const definitions = seeds ? buildTemplateDefinitions(seeds) : defaultTemplateDefinitions;
  return definitions
    .map((template) => {
      const scoreDetails = getTemplateScoreDetails(template, settings);

      return {
        adminOverride: template.adminOverride,
        ageDays: template.ageDays,
        category: template.category,
        creator: template.creator,
        daysInTrending: template.daysInTrending,
        isCurrentlyTrending: template.isCurrentlyTrending,
        isFeedEligible: scoreDetails.isFeedEligible,
        explorationCandidate: template.explorationCandidate,
        finalScore: scoreDetails.finalScore,
        name: template.name,
        previewBase: template.previewBase,
        previewGlow: template.previewGlow,
        thumbnailUrl: template.thumbnailUrl,
        pricingLabel: template.pricingLabel,
        pricingType: template.pricingType,
        stats: {
          week: {
            views: template.week.views,
            previews: template.week.previews,
            remixes: template.week.remixes,
            conversions: template.week.conversions,
            revenue: template.week.revenue,
            newUserActivations: template.week.newUserActivations,
          },
          month: {
            views: template.month.views,
            previews: template.month.previews,
            remixes: template.month.remixes,
            conversions: template.month.conversions,
            revenue: template.month.revenue,
            newUserActivations: template.month.newUserActivations,
          },
        },
      };
    })
    .sort(
      (left, right) =>
        right.finalScore - left.finalScore || left.name.localeCompare(right.name),
    );
}

export function getAllTemplateSlugs() {
  return Array.from(
    new Set(defaultTemplateDefinitions.map((template) => getTemplateSlug(template.name))),
  );
}

export function hasTemplateSlug(templateSlug: string) {
  return defaultTemplateDefinitions.some(
    (template) => getTemplateSlug(template.name) === templateSlug,
  );
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

function canInsertTemplate(
  template: RankedTemplate,
  creatorCounts: Map<string, number>,
  categoryCounts: Map<string, number>,
  settings: RankingSettings,
) {
  return (
    (creatorCounts.get(template.creator) ?? 0) < settings.creatorCap &&
    (categoryCounts.get(template.category) ?? 0) < settings.categoryCap
  );
}

function takeNextTemplate(
  pool: RankedTemplate[],
  usedNames: Set<string>,
  creatorCounts: Map<string, number>,
  categoryCounts: Map<string, number>,
  settings: RankingSettings,
) {
  return pool.find(
    (template) =>
      !usedNames.has(template.name) &&
      canInsertTemplate(template, creatorCounts, categoryCounts, settings),
  );
}

function registerTemplate(
  template: RankedTemplate,
  selection: RankedTemplate[],
  usedNames: Set<string>,
  creatorCounts: Map<string, number>,
  categoryCounts: Map<string, number>,
) {
  selection.push(template);
  usedNames.add(template.name);
  creatorCounts.set(template.creator, (creatorCounts.get(template.creator) ?? 0) + 1);
  categoryCounts.set(template.category, (categoryCounts.get(template.category) ?? 0) + 1);
}

export function applyFeedRules(
  rankedTemplates: RankedTemplate[],
  settings: RankingSettings,
) {
  const eligibleTemplates = rankedTemplates
    .filter((template) => template.isFeedEligible)
    .toSorted(
      (left, right) =>
        right.finalScore - left.finalScore || left.name.localeCompare(right.name),
    );
  const creatorCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const usedNames = new Set<string>();
  const selection: RankedTemplate[] = [];
  const explorationPool = eligibleTemplates.filter((template) => template.explorationCandidate);
  const explorationSlots = Math.min(
    explorationPool.length,
    Math.round(eligibleTemplates.length * (settings.explorationPercent / 100)),
  );
  const explorationPositions = buildExplorationPositions(
    eligibleTemplates.length,
    explorationSlots,
  );

  for (let position = 0; position < eligibleTemplates.length; position += 1) {
    const preferredPool = explorationPositions.has(position)
      ? explorationPool
      : eligibleTemplates;
    const fallbackPool = explorationPositions.has(position)
      ? eligibleTemplates
      : explorationPool;
    const candidate =
      takeNextTemplate(
        preferredPool,
        usedNames,
        creatorCounts,
        categoryCounts,
        settings,
      ) ??
      takeNextTemplate(
        fallbackPool,
        usedNames,
        creatorCounts,
        categoryCounts,
        settings,
      );

    if (!candidate) {
      break;
    }

    registerTemplate(
      candidate,
      selection,
      usedNames,
      creatorCounts,
      categoryCounts,
    );
  }

  return selection;
}

export type ScoreBreakdownRow = {
  label: string;
  score: number;
  total: number;
};

export function getScoreBreakdown(
  templateName: string,
  settings: RankingSettings,
  seeds?: TemplateSeed[],
): ScoreBreakdownRow[] {
  const definitions = seeds ? buildTemplateDefinitions(seeds) : defaultTemplateDefinitions;
  const template = definitions.find((t) => t.name === templateName);
  if (!template) return [];
  const scoreDetails = getTemplateScoreDetails(template, settings);

  let runningTotal = 0;
  const result: ScoreBreakdownRow[] = scoreDetails.componentRows.map((row) => {
    runningTotal += row.score;
    return { label: row.label, score: row.score, total: runningTotal };
  });

  return result;
}

export function formatMetricValue(value: number) {
  return value.toLocaleString("en-US");
}

export function formatScore(value: number) {
  return value.toFixed(1);
}
