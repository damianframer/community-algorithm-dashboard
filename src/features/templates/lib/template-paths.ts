export function getTemplateSlug(templateName: string) {
  return templateName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTemplateHref(templateName: string) {
  return `/${getTemplateSlug(templateName)}`;
}
