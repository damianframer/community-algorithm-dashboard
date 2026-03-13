import { Topbar } from "@/features/marketplace/components/topbar";
import { VectorsWorkspace } from "@/features/vectors/vectors-workspace";

export default function VectorsPage() {
  return (
    <div className="appShell">
      <Topbar activeCategory="Vectors" />
      <VectorsWorkspace />
    </div>
  );
}
