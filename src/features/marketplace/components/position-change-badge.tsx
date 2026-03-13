import type { PositionChange } from "@/features/marketplace/lib/position-change";

function PositionChangeIcon({ direction }: { direction: PositionChange["direction"] }) {
  if (direction === "stay") {
    return (
      <svg
        width="8"
        height="3"
        viewBox="0 0 8 3"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="8" height="3" rx="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="11"
      viewBox="0 0 12 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={direction === "down" ? "positionChangeIcon down" : "positionChangeIcon"}
    >
      <path
        d="M6 0.75L11.25 10.25H0.75L6 0.75Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getPositionChangeLabel(change: PositionChange) {
  if (change.direction === "stay") {
    return `Stayed at position ${change.currentPosition} since the last saved change`;
  }

  const directionLabel = change.direction === "up" ? "up" : "down";
  const positionWord = change.delta === 1 ? "position" : "positions";

  return `Moved ${directionLabel} ${change.delta} ${positionWord} from ${change.previousPosition} to ${change.currentPosition} since the last saved change`;
}

export function PositionChangeBadge({
  change,
}: {
  change: PositionChange | undefined;
}) {
  if (!change) {
    return null;
  }

  return (
    <span
      className={`positionChangeBadge ${change.direction}`}
      aria-label={getPositionChangeLabel(change)}
      title={getPositionChangeLabel(change)}
    >
      <span className="positionChangeBadgeIcon">
        <PositionChangeIcon direction={change.direction} />
      </span>
      {change.direction === "stay" ? null : (
        <span className="positionChangeBadgeValue">{change.delta}</span>
      )}
    </span>
  );
}
