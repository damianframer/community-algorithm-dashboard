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
  homeHref: string;
  isCurrentEntry: boolean;
  onCheckVersion: (entryId: string) => void;
  onRollback: (entryId: string) => void;
  selectedEntry: TemplateHistoryEntry | null;
  touchedSections: string[];
};

export function TemplatesHistoryView({
  changeDetails,
  homeHref,
  isCurrentEntry,
  onCheckVersion,
  onRollback,
  selectedEntry,
  touchedSections,
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
          <div className="historyDetailCard historyDetailEmptyState">
            <div className="historyDetailEmptyStateCopy">
              <h1 className="historyDetailTitle">No saved versions yet</h1>
              <p className="historyDetailEmptyText">
                Save changes from the ranking workspace to build a recoverable history.
              </p>
            </div>
            <button
              type="button"
              className="historyDetailButton primary"
              onClick={() => router.push(homeHref)}
            >
              Open Ranking
            </button>
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
              <span className="historyDetailEyebrow">Saved Version</span>
              <h1 className="historyDetailTitle">{selectedEntry.title}</h1>
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
                  router.push(homeHref);
                }}
              >
                Preview in Ranking
              </button>
              <button
                type="button"
                className="historyDetailButton primary"
                onClick={() => setIsRollbackModalOpen(true)}
                disabled={isCurrentEntry}
              >
                Restore Live
              </button>
            </div>
          </div>

          <div className="historySummaryGrid">
            <div className="historySummaryCard">
              <span className="historySummaryLabel">Changed Settings</span>
              <strong className="historySummaryValue">{changeDetails.length}</strong>
            </div>
            <div className="historySummaryCard">
              <span className="historySummaryLabel">Sections Touched</span>
              <strong className="historySummaryValue">{touchedSections.length}</strong>
            </div>
            <div className="historySummaryCard">
              <span className="historySummaryLabel">Status</span>
              <strong className="historySummaryValue">
                {isCurrentEntry ? "Live" : "Historical"}
              </strong>
            </div>
          </div>

          {touchedSections.length > 0 ? (
            <div className="historySectionTags" aria-label="Sections touched">
              {touchedSections.map((section) => (
                <span key={section} className="historySectionTag">
                  {section}
                </span>
              ))}
            </div>
          ) : null}

          <div className="historyChangesTable" role="table" aria-label="Ranking changes">
            <div className="historyChangesHeader" role="row">
              <span className="historyChangesHeading" role="columnheader">
                Setting
              </span>
              <span className="historyChangesHeading value" role="columnheader">
                Previous
              </span>
              <span className="historyChangesHeading value" role="columnheader">
                Saved
              </span>
            </div>

            {changeDetails.length === 0 ? (
              <div className="historyChangesEmpty" role="note">
                This version was saved without any setting value changes.
              </div>
            ) : (
              changeDetails.map((detail) => (
                <div
                  key={`${detail.section}-${detail.label}`}
                  className="historyChangesRow"
                  role="row"
                >
                  <span
                    className="historyChangesCell historyChangesSettingCell"
                    role="cell"
                  >
                    <span className="historySectionTag subtle">{detail.section}</span>
                    <span className="historyChangesSettingLabel">{detail.label}</span>
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
