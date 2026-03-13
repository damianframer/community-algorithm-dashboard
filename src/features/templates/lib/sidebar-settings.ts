import type { SettingSection } from "@/features/settings/lib/settings-state";

export const templatesSidebarSections: SettingSection[] = [
  {
    title: "Weight Metrics",
    settings: [
      { label: "Views", description: "How many people opened the template page. Higher value: gives more importance to traffic, so templates with lots of page visits rise in ranking.", kind: "stepper", initialValue: 4, min: 0, max: 20, step: 1, mode: "integer" },
      { label: "Previews", description: "How many people opened the live preview or demo. Higher value: prioritizes templates that users actively check out after opening the page.", kind: "stepper", initialValue: 8, min: 0, max: 20, step: 1, mode: "integer" },
      { label: "Remixes", description: "How many people copied the template into their workspace. Higher value: makes actual template usage more important for ranking.", kind: "stepper", initialValue: 15, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Conversions", description: "How many users purchased a Framer plan after using the template. Higher value: prioritizes templates that lead to plan upgrades.", kind: "stepper", initialValue: 18, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Revenue", description: "Total revenue generated from conversions. Higher value: favors templates that generate more revenue overall.", kind: "stepper", initialValue: 12, min: 0, max: 30, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Rate Metrics",
    defaultOpen: true,
    settings: [
      { label: "Preview Rate", description: "How many people who visited the page opened the preview. Higher value: favors templates that quickly attract user interest.", kind: "slider", initialValue: 12, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Remix Rate", description: "How many people who previewed the template decided to use it. Higher value: favors templates that people actually want to use after seeing them.", kind: "slider", initialValue: 20, min: 0, max: 40, step: 1, mode: "integer" },
      { label: "Conversion Rate", description: "How many users who remixed the template became paying customers. Higher value: favors templates that help users build real projects and upgrade.", kind: "slider", initialValue: 18, min: 0, max: 40, step: 1, mode: "integer" },
      { label: "Revenue Efficiency", description: "How much revenue the template generates per remix. Higher value: favors templates that generate more value per user.", kind: "slider", initialValue: 10, min: 0, max: 30, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Paid Template Normalization",
    defaultOpen: true,
    settings: [
      { label: "Remix Multiplier", description: "Boosts the remix signal for paid templates. Higher value: paid remixes count more, helping paid templates rank higher.", kind: "stepper", initialValue: 2, min: 1, max: 5, step: 0.1, mode: "decimal" },
      { label: "Conversion multiplier", description: "Boosts conversion signals for paid templates. Higher value: conversions from paid templates contribute more to ranking.", kind: "stepper", initialValue: 1.5, min: 1, max: 4, step: 0.1, mode: "decimal" },
    ],
  },
  {
    title: "New User Activation",
    defaultOpen: true,
    settings: [
      { label: "Boost", description: "Adds extra ranking for templates that activate new users. Higher value: favors beginner-friendly templates that bring new users into Framer.", effectNote: "Effect: Adds directly to the score component.", kind: "slider", initialValue: 8, min: 0, max: 25, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Time Window",
    defaultOpen: true,
    settings: [
      {
        label: "Lookback window",
        description: "How far back the system looks when calculating activity. Higher value: older activity counts more.",
        kind: "dropdown",
        initialValue: "30 days",
        options: ["7 days", "14 days", "30 days", "60 days", "90 days"],
      },
      { label: "Recency weight", description: "Controls how strongly recent activity affects ranking. Higher value: recent performance matters more.", kind: "slider", initialValue: 65, min: 0, max: 100, step: 5, mode: "integer" },
      { label: "Lifetime weight", description: "Controls how much long-term historical performance affects ranking. Higher value: established templates stay visible longer.", kind: "slider", initialValue: 35, min: 0, max: 100, step: 5, mode: "integer" },
      { label: "Fresh template boost", description: "New templates receive a temporary boost when first published. Higher value: newly added templates appear higher in ranking.", effectNote: "Effect: Adds directly to the freshness score component.", kind: "slider", initialValue: 12, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Fresh boost duration", description: "How long the fresh boost lasts. Higher value: new templates stay boosted for a longer time.", kind: "stepper", initialValue: 14, min: 1, max: 30, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Minimum Statistics",
    settings: [
      { label: "Min. Previews", description: "Minimum previews required across the selected lookback window before a free template can appear in Trending. Higher value: free templates need stronger recent interest to become eligible.", kind: "slider", initialValue: 150, min: 0, max: 5000, step: 25, mode: "integer" },
      { label: "Min. Remixes", description: "Minimum remixes required across the selected lookback window before a free template can appear in Trending. Higher value: free templates need stronger recent usage to become eligible.", kind: "stepper", initialValue: 10, min: 0, max: 1000, step: 1, mode: "integer" },
      { label: "Paid Min. Previews", description: "Minimum previews required across the selected lookback window before a paid template can appear in Trending. Higher value: paid templates need more recent interest to become eligible.", kind: "slider", initialValue: 80, min: 0, max: 2500, step: 10, mode: "integer" },
      { label: "Paid Min. Remixes", description: "Minimum remixes required across the selected lookback window before a paid template can appear in Trending. Higher value: paid templates need more recent usage to become eligible.", kind: "stepper", initialValue: 5, min: 0, max: 500, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Momentum",
    settings: [
      {
        label: "Window",
        description: "Time period used to measure growth. Higher value: growth is measured over a longer period.",
        kind: "dropdown",
        initialValue: "7 days",
        options: ["3 days", "7 days", "14 days", "30 days"],
      },
      { label: "Weight", description: "Controls how strongly growth affects ranking. Higher value: fast-growing templates rise in ranking more quickly.", kind: "stepper", initialValue: 12, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Acceleration", description: "Boosts templates whose growth is speeding up, not just growing. Higher value: templates with rapidly increasing momentum get a stronger boost.", kind: "stepper", initialValue: 8, min: 0, max: 20, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Trending Rotation",
    settings: [
      { label: "Duration decay", description: "Gradually lowers a template’s ranking the longer it stays in Trending. Higher value: templates drop out of Trending faster.", kind: "stepper", initialValue: 0.15, min: 0, max: 0.5, step: 0.01, mode: "decimal" },
      { label: "Max Days", description: "Maximum number of days a template can stay in Trending. Higher value: templates can remain in Trending longer.", kind: "stepper", initialValue: 7, min: 1, max: 14, step: 1, mode: "integer" },
      { label: "Cooldown", description: "How long a template must wait before it can appear in Trending again. Higher value: templates take longer before they can trend again.", kind: "stepper", initialValue: 3, min: 0, max: 14, step: 1, mode: "integer" },
      { label: "CTR Threshold", description: "Minimum engagement required to stay in Trending. Higher value: templates need stronger engagement to remain trending.", kind: "stepper", initialValue: 0.05, min: 0.01, max: 0.2, step: 0.01, mode: "decimal" },
    ],
  },
  {
    title: "Exploration",
    settings: [
      { label: "Exploration", description: "Maximum percentage of Trending slots reserved for newer or under-exposed templates. Higher value: more new templates appear in Trending.", kind: "stepper", initialValue: 20, min: 0, max: 40, step: 5, mode: "integer" },
    ],
  },
  {
    title: "Diversity",
    settings: [
      { label: "Creator Cap", description: "Limits how many templates from the same creator can appear at once. Higher value: creators can have more templates in the feed.", kind: "stepper", initialValue: 3, min: 1, max: 10, step: 1, mode: "integer" },
      { label: "Category Cap", description: "Limits how many templates from the same category can appear. Higher value: more templates from the same category can appear together.", kind: "stepper", initialValue: 6, min: 1, max: 20, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Overrides",
    settings: [
      { label: "Boost", description: "Adds a multiplier boost to the template’s ranking score. Higher value: manually boosted templates appear higher in the ranking.", effectNote: "Effect: Multiplies the final score upward.", kind: "stepper", initialValue: 1.2, min: 1, max: 2, step: 0.05, mode: "decimal" },
      { label: "Decay", description: "Reduces the ranking score for templates with issues. Lower value: the template is pushed further down the ranking.", effectNote: "Effect: Multiplies the final score downward.", kind: "stepper", initialValue: 0.8, min: 0.1, max: 1, step: 0.05, mode: "decimal" },
    ],
  },
];
