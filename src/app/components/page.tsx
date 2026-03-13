import { Topbar } from "@/features/marketplace/components/topbar";
import { ComponentsWorkspace } from "@/features/components/components-workspace";

export default function ComponentsPage() {
  return (
    <div className="appShell">
      <Topbar activeCategory="Components" />
      <ComponentsWorkspace />
    </div>
  );
}
