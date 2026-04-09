import { notFound } from "next/navigation";

import { Topbar } from "@/features/marketplace/components/topbar";
import { getTemplateSlug } from "@/features/templates/lib/template-paths";
import { fetchTemplateSeeds } from "@/features/templates/lib/template-seeds.server";
import { TemplatesWorkspace } from "@/features/templates/templates-workspace";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>;
}) {
  const { templateSlug } = await params;
  const seeds = await fetchTemplateSeeds();
  const hasMatchingTemplate = seeds.some(
    (template) => getTemplateSlug(template.name) === templateSlug,
  );

  if (!hasMatchingTemplate) {
    notFound();
  }

  return (
    <div className="appShell">
      <Topbar activeCategory="Templates" historyHref="/history" />
      <TemplatesWorkspace
        initialSeeds={seeds}
        selectedTemplateSlug={templateSlug}
        variant="template"
      />
    </div>
  );
}
