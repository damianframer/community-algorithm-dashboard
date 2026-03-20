type PricedItem = {
  pricingType: "free" | "paid";
};

export function interleaveByPricing<T extends PricedItem>(
  items: readonly T[],
  startWith: "free" | "paid" = "free",
) {
  const freeItems = items.filter((item) => item.pricingType === "free");
  const paidItems = items.filter((item) => item.pricingType === "paid");
  const orderedItems: T[] = [];
  const longestGroupLength = Math.max(freeItems.length, paidItems.length);

  for (let index = 0; index < longestGroupLength; index += 1) {
    for (const pricingType of [startWith, startWith === "free" ? "paid" : "free"] as const) {
      const item =
        pricingType === "free"
          ? freeItems[index]
          : paidItems[index];

      if (item) {
        orderedItems.push(item);
      }
    }
  }

  return orderedItems;
}
