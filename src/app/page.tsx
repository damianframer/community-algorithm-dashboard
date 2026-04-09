import { Topbar } from "@/features/marketplace/components/topbar";
import { TemplatesWorkspace } from "@/features/templates/templates-workspace";

export default function Home() {
  return (
    <div className="appShell">
      <Topbar activeCategory="Templates" historyHref="/history" />
      <TemplatesWorkspace variant="template" />
    </div>
  );
}
