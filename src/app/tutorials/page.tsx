import { Topbar } from "@/features/marketplace/components/topbar";
import { TutorialsWorkspace } from "@/features/tutorials/tutorials-workspace";

export default function TutorialsPage() {
  return (
    <div className="appShell">
      <Topbar activeCategory="Tutorials" />
      <TutorialsWorkspace />
    </div>
  );
}
