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

type TopbarProps = {
  activeCategory: MarketplaceCategory;
};

const categoryHrefs: Partial<Record<MarketplaceCategory, string>> = {
  Templates: "/",
  Plugins: "/plugins",
  Components: "/components",
  Vectors: "/vectors",
  Tutorials: "/tutorials",
};

export function Topbar({ activeCategory }: TopbarProps) {
  return (
    <header className="topbar">
      <Link className="logoWrap" href="/">
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
    </header>
  );
}
