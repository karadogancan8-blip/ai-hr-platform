export function slugifyCompanyName(name: string) {
  const ascii = name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "company";
}

export function companyApplyPath(companyName: string, companyId?: string) {
  const slug = slugifyCompanyName(companyName);
  const suffix = companyId ? companyId.replace(/-/g, "").slice(0, 6) : "";
  return `/apply/${suffix ? `${slug}-${suffix}` : slug}`;
}
