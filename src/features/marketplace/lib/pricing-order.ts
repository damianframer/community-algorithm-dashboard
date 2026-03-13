type PricedItem = {
  pricingType: "free" | "paid";
};

export function interleaveByPricing<T extends PricedItem>(items: readonly T[]) {
  const freeItems = items.filter((item) => item.pricingType === "free");
  const paidItems = items.filter((item) => item.pricingType === "paid");
  const orderedItems: T[] = [];
  const longestGroupLength = Math.max(freeItems.length, paidItems.length);

  for (let index = 0; index < longestGroupLength; index += 1) {
    const freeItem = freeItems[index];

    if (freeItem) {
      orderedItems.push(freeItem);
    }

    const paidItem = paidItems[index];

    if (paidItem) {
      orderedItems.push(paidItem);
    }
  }

  return orderedItems;
}
