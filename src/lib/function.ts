export function slugify(text: string): string {
  return text
    .toString() // ensure it's a string
    .normalize("NFD") // split accented characters into base + diacritics
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace to dashes
    .replace(/-+/g, "-"); // collapse multiple dashes
}
