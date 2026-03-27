import { Topbar } from "@/features/marketplace/components/topbar";
import { TemplatesHistoryWorkspace } from "@/features/templates/templates-history-workspace";

export default function HistoryPage() {
  return (
    <div className="appShell">
      <Topbar
        activeCategory="Templates"
        historyHref="/history"
        isHistoryActive
      />
      <TemplatesHistoryWorkspace />
    </div>
  );
}
