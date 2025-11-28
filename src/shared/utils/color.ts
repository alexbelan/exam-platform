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

export const getContrastColor = (
  hexColor: string,
  defaultColor: string = "#3b82f6"
): string => {
  const normalized = normalizeHex(hexColor) || defaultColor;
  const hex = normalized.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const luminance =
    0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
    0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
    0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

  return luminance > 0.5 ? "#1f2937" : "#ffffff";
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
