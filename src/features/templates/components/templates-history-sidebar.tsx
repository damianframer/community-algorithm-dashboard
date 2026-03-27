import { formatTemplateHistoryDate, type TemplateHistoryEntry } from "@/features/templates/lib/templates-history";

type TemplatesHistorySidebarProps = {
  historyEntries: TemplateHistoryEntry[];
  isCurrentEntry: (entry: TemplateHistoryEntry) => boolean;
  onSelectEntry: (entryId: string) => void;
  selectedEntryId: string | null;
};

export function TemplatesHistorySidebar({
  historyEntries,
  isCurrentEntry,
  onSelectEntry,
  selectedEntryId,
}: TemplatesHistorySidebarProps) {
  return (
    <aside className="sidebar historySidebar" aria-label="Templates history versions">
      <div className="historySidebarRows">
        {historyEntries.length === 0 ? (
          <div className="historySidebarEmpty">No saved versions yet.</div>
        ) : (
          historyEntries.map((entry) => {
            const isSelected = entry.id === selectedEntryId;
            const isCurrent = isCurrentEntry(entry);

            return (
              <div
                key={entry.id}
                className={
                  isSelected
                    ? "historySidebarRow active"
                    : "historySidebarRow"
                }
              >
                <button
                  type="button"
                  className="historySidebarRowButton"
                  onClick={() => onSelectEntry(entry.id)}
                >
                  <span className="historySidebarDate">
                    {formatTemplateHistoryDate(entry.savedAt)}
                  </span>
                </button>
                {isCurrent ? <span className="historyLiveBadge">LIVE</span> : null}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
