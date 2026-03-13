import { Topbar } from "@/features/marketplace/components/topbar";
import { TemplatesWorkspace } from "@/features/templates/templates-workspace";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>;
}) {
  const { templateSlug } = await params;

  return (
    <div className="appShell">
      <Topbar activeCategory="Templates" />
      <TemplatesWorkspace selectedTemplateSlug={templateSlug} />
    </div>
  );
}
