export function extractTag(text: string): Set<string> {
  function applySeparator(parts: string[], separator: string) {
    return parts.flatMap((part) =>
      part
        .split(separator)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
    );
  }
  let parts = [text];
  parts = applySeparator(parts, "\n");
  parts = applySeparator(parts, "#");
  parts = applySeparator(parts, ",");
  parts = applySeparator(parts, "，");
  parts = applySeparator(parts, "、");
  parts = parts.map((part) => part.replace(/ /g, "-"));
  return new Set(parts);
}
