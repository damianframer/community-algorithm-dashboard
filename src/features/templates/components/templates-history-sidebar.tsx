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
      <div className="historySidebarHeader">
        <span className="historySidebarEyebrow">Template Ranking</span>
        <div className="historySidebarHeaderRow">
          <h1 className="historySidebarTitle">History</h1>
          <span className="historySidebarCount">{historyEntries.length}</span>
        </div>
        <p className="historySidebarDescription">
          Saved snapshots of the ranking controls that can be previewed or restored.
        </p>
      </div>
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
                  aria-pressed={isSelected}
                  onClick={() => onSelectEntry(entry.id)}
                >
                  <div className="historySidebarRowContent">
                    <div className="historySidebarRowTop">
                      <span className="historySidebarEntryTitle">{entry.title}</span>
                      {isCurrent ? <span className="historyLiveBadge">LIVE</span> : null}
                    </div>
                    <span className="historySidebarDate">
                      {formatTemplateHistoryDate(entry.savedAt)}
                    </span>
                    <span className="historySidebarRowMeta">
                      {entry.changedSettings.length === 1
                        ? "1 setting changed"
                        : `${entry.changedSettings.length} settings changed`}
                    </span>
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
