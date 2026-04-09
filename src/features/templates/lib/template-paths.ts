export function getTemplateSlug(templateName: string) {
  return templateName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getScopedTemplateHref(templateName: string, basePath = "") {
  const normalizedBasePath =
    basePath === "" || basePath === "/"
      ? ""
      : `/${basePath.replace(/^\/+|\/+$/g, "")}`;

  return `${normalizedBasePath}/${getTemplateSlug(templateName)}`;
}

export function getTemplateHref(templateName: string) {
  return getScopedTemplateHref(templateName);
}
