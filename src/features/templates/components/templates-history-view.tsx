"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  formatTemplateHistoryTimestamp,
  type TemplateHistoryChangeDetail,
  type TemplateHistoryEntry,
} from "@/features/templates/lib/templates-history";

type TemplatesHistoryViewProps = {
  changeDetails: TemplateHistoryChangeDetail[];
  isCurrentEntry: boolean;
  onCheckVersion: (entryId: string) => void;
  onRollback: (entryId: string) => void;
  selectedEntry: TemplateHistoryEntry | null;
};

export function TemplatesHistoryView({
  changeDetails,
  isCurrentEntry,
  onCheckVersion,
  onRollback,
  selectedEntry,
}: TemplatesHistoryViewProps) {
  const router = useRouter();
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);

  useEffect(() => {
    setIsRollbackModalOpen(false);
  }, [selectedEntry?.id]);

  if (!selectedEntry) {
    return (
      <section className="historyPane">
        <div className="historyShell">
          <div className="historyDetailCard empty">
            Save changes to create a history version.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="historyPane">
      <div className="historyShell">
        <div className="historyDetailCard">
          <div className="historyDetailTop">
            <div className="historyDetailTitleWrap">
              <h1 className="historyDetailTitle">Ranking Changes</h1>
              <div className="historyDetailMeta">
                <span>{formatTemplateHistoryTimestamp(selectedEntry.savedAt)}</span>
                {isCurrentEntry ? <span className="historyDetailLiveText">Live</span> : null}
              </div>
            </div>
            <div className="historyDetailActions">
              <button
                type="button"
                className="historyDetailButton"
                onClick={() => {
                  onCheckVersion(selectedEntry.id);
                  router.push("/");
                }}
              >
                View Changes
              </button>
              <button
                type="button"
                className="historyDetailButton primary"
                onClick={() => setIsRollbackModalOpen(true)}
                disabled={isCurrentEntry}
              >
                Rollback
              </button>
            </div>
          </div>

          <div className="historyChangesTable" role="table" aria-label="Ranking changes">
            <div className="historyChangesHeader" role="row">
              <span className="historyChangesHeading" role="columnheader">
                Name
              </span>
              <span className="historyChangesHeading value" role="columnheader">
                Old Value
              </span>
              <span className="historyChangesHeading value" role="columnheader">
                New Value
              </span>
            </div>

            {changeDetails.length === 0 ? (
              <div className="historyChangesRow empty" role="row">
                <span className="historyChangesCell" role="cell">
                  {selectedEntry.title}
                </span>
                <span className="historyChangesCell value" role="cell">
                  -
                </span>
                <span className="historyChangesCell value" role="cell">
                  -
                </span>
              </div>
            ) : (
              changeDetails.map((detail) => (
                <div
                  key={`${detail.section}-${detail.label}`}
                  className="historyChangesRow"
                  role="row"
                >
                  <span className="historyChangesCell" role="cell">
                    {detail.section} / {detail.label}
                  </span>
                  <span className="historyChangesCell value" role="cell">
                    {detail.from}
                  </span>
                  <span className="historyChangesCell value" role="cell">
                    {detail.to}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {isRollbackModalOpen ? (
          <div
            className="historyModalOverlay"
            role="presentation"
            onClick={() => setIsRollbackModalOpen(false)}
          >
            <div
              className="historyModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-rollback-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="history-rollback-title" className="historyModalTitle">
                Confirm rollback?
              </h2>
              <p className="historyModalText">
                This will restore the selected ranking version as the current live settings.
              </p>
              <div className="historyModalActions">
                <button
                  type="button"
                  className="historyDetailButton"
                  onClick={() => setIsRollbackModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="historyDetailButton primary"
                  onClick={() => {
                    onRollback(selectedEntry.id);
                    setIsRollbackModalOpen(false);
                  }}
                >
                  Confirm rollback
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
