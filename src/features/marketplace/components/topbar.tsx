import Link from "next/link";

import {
  marketplaceCategories,
  type MarketplaceCategory,
} from "@/features/marketplace/lib/categories";

function CommunityMark() {
  return (
    <svg
      aria-hidden="true"
      width="31"
      height="31"
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.63623 6.38232H18.7877V12.7645H12.212L5.63623 6.38232ZM5.63623 12.7645H12.212L18.7877 19.1469H5.63623V12.7645ZM5.63623 19.1469H12.212V25.5294L5.63623 19.1469Z"
        fill="white"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g clipPath="url(#topbar-history-clip)">
        <mask
          id="topbar-history-mask"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
        >
          <path d="M16 0H0V16H16V0Z" fill="white" />
        </mask>
        <g mask="url(#topbar-history-mask)">
          <path
            d="M7.99967 15.1668C4.04634 15.1668 0.833008 11.9535 0.833008 8.00016C0.833008 4.04683 4.04634 0.833496 7.99967 0.833496C11.953 0.833496 15.1663 4.04683 15.1663 8.00016C15.1663 11.9535 11.953 15.1668 7.99967 15.1668ZM7.99967 1.8335C4.59967 1.8335 1.83301 4.60016 1.83301 8.00016C1.83301 11.4002 4.59967 14.1668 7.99967 14.1668C11.3997 14.1668 14.1663 11.4002 14.1663 8.00016C14.1663 4.60016 11.3997 1.8335 7.99967 1.8335Z"
            fill="white"
          />
          <path
            d="M10.4731 10.6202C10.3864 10.6202 10.2998 10.6002 10.2198 10.5469L8.1531 9.31352C7.63977 9.00686 7.25977 8.33352 7.25977 7.74019V5.00684C7.25977 4.7335 7.48643 4.50684 7.75977 4.50684C8.0331 4.50684 8.25977 4.7335 8.25977 5.00684V7.74019C8.25977 7.98019 8.45977 8.33352 8.66643 8.45352L10.7331 9.68686C10.9731 9.82686 11.0464 10.1335 10.9064 10.3735C10.8064 10.5335 10.6398 10.6202 10.4731 10.6202Z"
            fill="white"
          />
        </g>
      </g>
      <defs>
        <clipPath id="topbar-history-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

type TopbarProps = {
  activeCategory: MarketplaceCategory;
  homeHref?: string;
  historyHref?: string;
  isHistoryActive?: boolean;
};

const categoryHrefs: Partial<Record<MarketplaceCategory, string>> = {
  Templates: "/",
  Plugins: "/plugins",
  Components: "/components",
  Vectors: "/vectors",
  Tutorials: "/tutorials",
};

export function Topbar({
  activeCategory,
  homeHref = "/",
  historyHref,
  isHistoryActive = false,
}: TopbarProps) {
  return (
    <header className="topbar">
      <Link className="logoWrap" href={homeHref}>
        <div className="logoLockup">
          <CommunityMark />
          <span className="logoLabel">Community Algorithm</span>
        </div>
      </Link>
      <div className="topbarNavWrap">
        <nav aria-label="Marketplace categories" className="topbarNav">
          {marketplaceCategories.map((category) => {
            const isActive = category === activeCategory;
            const href = categoryHrefs[category];

            if (!href) {
              return (
                <span key={category} className="categoryTab disabled">
                  {category}
                </span>
              );
            }

            return (
              <Link
                key={category}
                href={href}
                className={isActive ? "categoryTab active" : "categoryTab"}
                aria-current={isActive ? "page" : undefined}
              >
                {category}
              </Link>
            );
          })}
        </nav>
      </div>
      {historyHref ? (
        <div className="topbarActions">
          <Link
            href={historyHref}
            className={isHistoryActive ? "topbarIconLink active" : "topbarIconLink"}
            aria-label="Open templates history"
          >
            <HistoryIcon />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
