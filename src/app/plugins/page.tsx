import { Topbar } from "@/features/marketplace/components/topbar";
import { PluginsWorkspace } from "@/features/plugins/plugins-workspace";

export default function PluginsPage() {
  return (
    <div className="appShell">
      <Topbar activeCategory="Plugins" />
      <PluginsWorkspace />
    </div>
  );
}
