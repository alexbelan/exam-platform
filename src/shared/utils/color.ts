export const normalizeHex = (
  value: string | undefined | null
): string | null => {
  if (!value) return null;
  let hex = value.trim();
  if (!hex) return null;
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) return null;
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }
  if (hex.length !== 6) return null;
  return `#${hex.toLowerCase()}`;
};

export const resolveThemeToken = (
  value: string | null | undefined,
  themePrimitivePalette: Record<string, Record<string, string>>
): string | null => {
  if (!value) return null;

  const normalized = normalizeHex(value);
  if (normalized) return normalized;

  const sanitized = value.replace(/[{}]/g, "").trim();
  if (!sanitized) return null;

  const [family, rawShade] = sanitized.split(".");
  if (!family) return null;

  const shade = rawShade ?? "600";
  const familyPalette = themePrimitivePalette[family];
  if (!familyPalette) return null;

  const candidate = familyPalette[shade];
  return normalizeHex(candidate);
};
