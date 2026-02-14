const { lightTheme } = require("../src/theme/lightTheme");
const { darkTheme } = require("../src/theme/darkTheme");

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
function relativeLuminance(rgb) {
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function getContrastRatio(fg, bg) {
  const L1 = relativeLuminance(hexToRgb(fg));
  const L2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function auditTheme(theme, themeName) {
  const pairs = [
    { name: "Primary text on primary bg", fg: theme.colors.text?.primary, bg: theme.colors.background?.primary, size: 16 },
    { name: "Secondary text on primary bg", fg: theme.colors.text?.secondary, bg: theme.colors.background?.primary, size: 14 },
    { name: "Error text on elevated", fg: theme.colors.error, bg: theme.colors.background?.elevated, size: 14 },
    { name: "Link on primary bg", fg: theme.colors.text?.link || theme.colors.accent?.blue, bg: theme.colors.background?.primary, size: 16 },
  ].filter((p) => p.fg && p.bg);

  const issues = [];
  for (const pair of pairs) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const isLarge = pair.size >= 18;
    const required = isLarge ? 3 : 4.5;
    if (ratio < required) {
      issues.push({ name: pair.name, ratio: ratio.toFixed(2), required });
    }
  }
  if (issues.length) {
    console.log(`❌ Contrast Issues for ${themeName}:`);
    for (const i of issues) {
      console.log(`  ${i.name}: ${i.ratio}:1 (need ${i.required}:1)`);
    }
    process.exitCode = 1;
  } else {
    console.log(`✅ ${themeName}: All contrast requirements met`);
  }
}

function main() {
  auditTheme(lightTheme, "lightTheme");
  auditTheme(darkTheme, "darkTheme");
  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
}

main();
