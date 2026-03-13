import { notFound } from "next/navigation";

import { Topbar } from "@/features/marketplace/components/topbar";
import {
  getAllTemplateSlugs,
  hasTemplateSlug,
} from "@/features/templates/lib/template-ranking";
import { TemplatesWorkspace } from "@/features/templates/templates-workspace";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTemplateSlugs().map((templateSlug) => ({ templateSlug }));
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>;
}) {
  const { templateSlug } = await params;

  if (!hasTemplateSlug(templateSlug)) {
    notFound();
  }

  return (
    <div className="appShell">
      <Topbar activeCategory="Templates" />
      <TemplatesWorkspace selectedTemplateSlug={templateSlug} />
    </div>
  );
}
