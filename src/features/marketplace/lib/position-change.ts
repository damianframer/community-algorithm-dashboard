export type PositionChangeDirection = "down" | "stay" | "up";

export type PositionChange = {
  currentPosition: number;
  delta: number;
  direction: PositionChangeDirection;
  previousPosition: number;
};

export function getPositionChanges<T extends { name: string }>(
  currentItems: T[],
  previousItems: T[],
) {
  const previousPositions = new Map(
    previousItems.map((item, index) => [item.name, index + 1]),
  );

  return new Map<string, PositionChange>(
    currentItems.map((item, index) => {
      const currentPosition = index + 1;
      const previousPosition =
        previousPositions.get(item.name) ?? currentPosition;
      const rawDelta = previousPosition - currentPosition;
      const direction =
        rawDelta > 0 ? "up" : rawDelta < 0 ? "down" : "stay";

      return [
        item.name,
        {
          currentPosition,
          delta: Math.abs(rawDelta),
          direction,
          previousPosition,
        },
      ];
    }),
  );
}
