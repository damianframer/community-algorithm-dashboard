import type { SettingSection } from "@/features/settings/lib/settings-state";

export const templatesSidebarSections: SettingSection[] = [
  {
    title: "Weight Metrics",
    settings: [
      { label: "Views", description: "How many people opened the template page. Higher value: gives more importance to traffic, so templates with lots of page visits rise in ranking.", kind: "stepper", initialValue: 2, min: 0, max: 20, step: 1, mode: "integer" },
      { label: "Previews", description: "How many people opened the live preview or demo. Higher value: prioritizes templates that users actively check out after opening the page.", kind: "stepper", initialValue: 6, min: 0, max: 20, step: 1, mode: "integer" },
      { label: "Remixes", description: "How many people copied the template into their workspace. Higher value: makes actual template usage more important for ranking.", kind: "stepper", initialValue: 18, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Active Sites", description: "How many remixed templates became active sites. Higher value: favors templates that lead to real launched usage, not just duplication.", kind: "stepper", initialValue: 14, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Conversions", description: "How many users purchased a Framer plan after using the template. Higher value: prioritizes templates that lead to plan upgrades.", kind: "stepper", initialValue: 2, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Revenue", description: "Total revenue generated from conversions. Higher value: favors templates that generate more revenue overall.", kind: "stepper", initialValue: 2, min: 0, max: 30, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Rate Metrics",
    defaultOpen: true,
    settings: [
      { label: "Preview Rate", description: "How many people who visited the page opened the preview. Higher value: favors templates that quickly attract user interest.", kind: "slider", initialValue: 10, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Remix Rate", description: "How many people who previewed the template decided to use it. Higher value: favors templates that people actually want to use after seeing them.", kind: "slider", initialValue: 24, min: 0, max: 40, step: 1, mode: "integer" },
      { label: "Active Site Rate", description: "How many remixes turned into active sites. Higher value: favors templates that actually get launched after they are duplicated.", kind: "slider", initialValue: 10, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Conversion Rate", description: "How many users who remixed the template became paying customers. Higher value: favors templates that help users build real projects and upgrade.", kind: "slider", initialValue: 2, min: 0, max: 40, step: 1, mode: "integer" },
      { label: "Revenue Efficiency", description: "How much revenue the template generates per remix. Higher value: favors templates that generate more value per user.", kind: "slider", initialValue: 2, min: 0, max: 30, step: 1, mode: "integer" },
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
        initialValue: "7 days",
        options: ["7 days", "30 days", "90 days"],
      },
      {
        label: "Lifetime source",
        description: "Which long-range bucket is used when lifetime weight is applied. Higher value: choosing all-time makes established templates retain their long-term history.",
        kind: "dropdown",
        initialValue: "90d",
        options: ["90d", "all-time"],
      },
      { label: "Recency weight", description: "Controls how strongly recent activity affects ranking. Higher value: recent performance matters more; the remainder weights lifetime performance.", kind: "slider", initialValue: 90, min: 0, max: 100, step: 5, mode: "integer" },
      { label: "Fresh template boost", description: "New templates receive a temporary boost when first published. Higher value: newly added templates appear higher in ranking.", effectNote: "Effect: Adds directly to the freshness score component.", kind: "slider", initialValue: 20, min: 0, max: 30, step: 1, mode: "integer" },
      { label: "Fresh boost multiplier", description: "Multiplies the total score for fresh templates near the end of the ranking calculation. Higher value: fresh templates get a stronger overall boost on top of the additive freshness score.", effectNote: "Effect: Multiplies the running score for templates still inside the fresh boost duration.", kind: "stepper", initialValue: 1, min: 1, max: 3, step: 0.05, mode: "decimal" },
      { label: "Fresh boost duration", description: "How long the fresh boost lasts. Higher value: new templates stay boosted for a longer time.", kind: "stepper", initialValue: 28, min: 1, max: 30, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Age Priority",
    defaultOpen: true,
    settings: [
      {
        label: "Prefer templates newer than",
        description: "Templates at or below this age get the age-priority boost. Example: 90 means templates up to 90 days old are preferred. Older templates can still rank, but they do not receive the boost.",
        effectNote: "Effect: Sets the age window used for both score boosting and reserved Spotlight spots.",
        kind: "slider",
        initialValue: 90,
        min: 0,
        max: 360,
        step: 10,
        mode: "integer",
      },
      {
        label: "Boost strength",
        description: "How strongly newer templates inside the preferred age window are boosted. Higher value: more aggressive promotion of newer templates.",
        effectNote: "Effect: Multiplies the final ranking score for templates inside the preferred age window.",
        kind: "slider",
        initialValue: 30,
        min: 0,
        max: 100,
        step: 5,
        mode: "integer",
      },
      {
        label: "Reserved share",
        description: "How much of the Spotlight can be reserved for templates inside the preferred age window. Higher value: more newer templates are guaranteed placement when available.",
        effectNote: "Effect: Reserves a percentage of eligible Spotlight positions for newer templates.",
        kind: "slider",
        initialValue: 20,
        min: 0,
        max: 50,
        step: 5,
        mode: "integer",
      },
    ],
  },
  {
    title: "Minimum Statistics",
    settings: [
      { label: "Min. Previews", description: "Minimum previews required across the selected lookback window before a free template can appear in the Spotlight. Higher value: free templates need stronger recent interest to be Spotlight-eligible.", kind: "slider", initialValue: 100, min: 0, max: 5000, step: 25, mode: "integer" },
      { label: "Min. Remixes", description: "Minimum remixes required across the selected lookback window before a free template can appear in the Spotlight. Higher value: free templates need stronger recent usage to be Spotlight-eligible.", kind: "stepper", initialValue: 6, min: 0, max: 1000, step: 1, mode: "integer" },
      { label: "Paid Min. Previews", description: "Minimum previews required across the selected lookback window before a paid template can appear in the Spotlight. Higher value: paid templates need more recent interest to be Spotlight-eligible.", kind: "slider", initialValue: 50, min: 0, max: 2500, step: 10, mode: "integer" },
      { label: "Paid Min. Remixes", description: "Minimum remixes required across the selected lookback window before a paid template can appear in the Spotlight. Higher value: paid templates need more recent usage to be Spotlight-eligible.", kind: "stepper", initialValue: 3, min: 0, max: 500, step: 1, mode: "integer" },
    ],
  },
  {
    title: "Spotlight Lifecycle",
    settings: [
      { label: "Spotlight size", description: "How many top-ranked eligible templates make it into the Spotlight. Higher value: more templates appear in the Spotlight.", kind: "stepper", initialValue: 21, min: 1, max: 100, step: 1, mode: "integer" },
      { label: "Feature count threshold", description: "How many times a template can appear in the Spotlight before repeat penalties begin. Higher value: templates get more free repeat appearances before decay starts.", kind: "stepper", initialValue: 3, min: 0, max: 20, step: 1, mode: "integer" },
      {
        label: "Feature count window",
        description: "How far back the system looks when counting past Spotlight appearances. Higher value: repeat penalties consider a longer history.",
        kind: "dropdown",
        initialValue: "90d",
        options: ["30d", "90d", "lifetime"],
      },
      { label: "Repeat feature decay", description: "How strongly templates are pushed down once they exceed the feature count threshold. Lower value: repeated appearances decay faster.", kind: "stepper", initialValue: 0.9, min: 0.1, max: 1, step: 0.05, mode: "decimal" },
      { label: "Duration decay", description: "Gradually lowers a template’s ranking the longer it stays in the Spotlight. At default settings, templates retain ~30% strength at the Max Days cutoff. Higher value: templates drop out of the Spotlight faster.", kind: "stepper", initialValue: 0.10, min: 0, max: 0.5, step: 0.01, mode: "decimal" },
      { label: "Max Days", description: "Maximum number of days a template can stay in the Spotlight. Higher value: templates can remain in the Spotlight longer.", kind: "stepper", initialValue: 7, min: 1, max: 14, step: 1, mode: "integer" },
      { label: "Cooldown", description: "How long a template must wait before it can re-enter the Spotlight. Higher value: templates take longer before they can appear again.", kind: "stepper", initialValue: 3, min: 0, max: 14, step: 1, mode: "integer" },
      { label: "CTR Threshold", description: "Minimum engagement required to stay in the Spotlight. Higher value: templates need stronger engagement to remain in the Spotlight.", kind: "stepper", initialValue: 0.05, min: 0.01, max: 0.2, step: 0.01, mode: "decimal" },
    ],
  },
  {
    title: "Diversity",
    settings: [
      { label: "Creator Cap", description: "Limits how many templates from the same creator can appear at once. Higher value: creators can have more templates in the Spotlight.", kind: "stepper", initialValue: 2, min: 1, max: 10, step: 1, mode: "integer" },
      { label: "Category Cap", description: "Limits how many templates from the same category can appear. Higher value: more templates from the same category can appear together.", kind: "stepper", initialValue: 5, min: 1, max: 20, step: 1, mode: "integer" },
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
