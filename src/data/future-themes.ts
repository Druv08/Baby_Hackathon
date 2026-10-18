import type { CharacterSlug } from "@/types/character";

/**
 * Presentation-only data for each character: colors, a decorative icon,
 * and alt text describing the locked artwork (never changes the art itself).
 */
export interface CharacterTheme {
  /** Short world name, e.g. "Blossom". */
  label: string;
  icon: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  /** Describes `/characters/{id}.png` for screen readers. */
  portraitAlt: string;
}

export const CHARACTER_THEMES: Record<CharacterSlug, CharacterTheme> = {
  normal: {
    label: "The Beginning",
    icon: "🐾",
    accent: "#c2386f",
    accentSoft: "#fde3ee",
    accentGlow: "rgba(247, 168, 196, 0.6)",
    portraitAlt: "Maria, a fluffy baby red panda wearing a pink knitted scarf, waving hello.",
  },
  blossom: {
    label: "Blossom",
    icon: "🌸",
    accent: "#c2386f",
    accentSoft: "#fde3ee",
    accentGlow: "rgba(247, 168, 196, 0.65)",
    portraitAlt: "Blossom Maria in a pink flowered bonnet and cape, holding a basket of blossoms beside a butterfly.",
  },
  star: {
    label: "Star",
    icon: "⭐",
    accent: "#6d4fb8",
    accentSoft: "#ece4fb",
    accentGlow: "rgba(150, 120, 230, 0.55)",
    portraitAlt: "Star Maria in a starry purple hooded cloak, holding a glowing jar of stars.",
  },
  cloud: {
    label: "Cloud",
    icon: "☁️",
    accent: "#2f6fb0",
    accentSoft: "#e2f0fc",
    accentGlow: "rgba(120, 180, 240, 0.55)",
    portraitAlt: "Cloud Maria in aviator goggles and a fluffy sky-blue cloud outfit, ready to explore the skies.",
  },
  aqua: {
    label: "Aqua",
    icon: "💧",
    accent: "#1d7f8c",
    accentSoft: "#dff5f5",
    accentGlow: "rgba(90, 200, 210, 0.5)",
    portraitAlt: "Aqua Maria in a sea-blue seashell bonnet and pearls, hugging a baby sea turtle.",
  },
  inventor: {
    label: "Inventor",
    icon: "⚙️",
    accent: "#a5531a",
    accentSoft: "#fdebd8",
    accentGlow: "rgba(246, 170, 90, 0.55)",
    portraitAlt: "Inventor Maria in brass goggles and a leather tool apron, holding up a glowing star.",
  },
  forest: {
    label: "Forest",
    icon: "🍃",
    accent: "#3d7a3a",
    accentSoft: "#e5f3df",
    accentGlow: "rgba(130, 190, 110, 0.5)",
    portraitAlt: "Forest Maria in a leafy green hooded cloak with flowers, holding a hand-drawn map.",
  },
  melody: {
    label: "Melody",
    icon: "🎵",
    accent: "#8a3f9e",
    accentSoft: "#f4e4f8",
    accentGlow: "rgba(200, 140, 220, 0.55)",
    portraitAlt: "Melody Maria in a lavender flowered bonnet and frilly dress, playing a little guitar.",
  },
  luna: {
    label: "Luna",
    icon: "🌙",
    accent: "#4b3a9c",
    accentSoft: "#e7e3fa",
    accentGlow: "rgba(130, 110, 220, 0.55)",
    portraitAlt: "Luna Maria in a purple wizard hat with a crescent moon and a starry cape, holding a glowing star.",
  },
};

/** CSS custom properties that re-theme a section for one character. */
export function themeStyle(slug: CharacterSlug): React.CSSProperties {
  const t = CHARACTER_THEMES[slug];
  return {
    "--accent": t.accent,
    "--accent-soft": t.accentSoft,
    "--accent-glow": t.accentGlow,
  } as React.CSSProperties;
}

/** "02" style number used across the site. */
export const formNumber = (id: number) => String(id).padStart(2, "0");
