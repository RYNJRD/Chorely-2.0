import penguinBaseImg from "@assets/base_penguin.png";
import penguinCoatImg from "@assets/coat_penguin.png";
import penguinSuitImg from "@assets/suit_penguin.png";
import penguinPirateImg from "@assets/pirate_penguin.png";
import penguinAstronautImg from "@assets/astronaut_penguin.png";

export type Rarity = "common" | "rare" | "mythic" | "legendary";

export type PenguinOutfit = {
  id: string;
  label: string;
  image: string;
  rarity: Rarity;
  price: number;
  comingSoon?: boolean;
};

export const RARITY_META: Record<Rarity, { label: string, color: string, bg: string, border: string }> = {
  common: { 
    label: "Common", 
    color: "text-slate-500", 
    bg: "bg-slate-500", 
    border: "border-slate-400" 
  },
  rare: { 
    label: "Rare", 
    color: "text-blue-500", 
    bg: "bg-blue-500", 
    border: "border-blue-400" 
  },
  mythic: { 
    label: "Mythic", 
    color: "text-purple-500", 
    bg: "bg-purple-500", 
    border: "border-purple-400" 
  },
  legendary: { 
    label: "Legendary", 
    color: "text-amber-500", 
    bg: "bg-amber-500", 
    border: "border-amber-400" 
  },
};

export const PENGUIN_OUTFITS: PenguinOutfit[] = [
  { id: "astronaut",  label: "Astronaut",  image: penguinAstronautImg, rarity: "legendary", price: 1 },
  { id: "pirate",     label: "Pirate",     image: penguinPirateImg,    rarity: "mythic",    price: 1 },
  { id: "fancy",      label: "Formal",     image: penguinSuitImg,      rarity: "rare",      price: 1 },
  { id: "winter",     label: "Winter",     image: penguinCoatImg,      rarity: "rare",      price: 1 },
  { id: "classic",    label: "Classic",    image: penguinBaseImg,      rarity: "common",    price: 0 },
];

export const OUTFIT_MAP: Record<string, string> = Object.fromEntries(
  PENGUIN_OUTFITS.map((o) => [o.id, o.image]),
);

export type AvatarConfig = { outfit?: string | null };

export function parseAvatarConfig(raw?: string | null): AvatarConfig {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as AvatarConfig;
  } catch {
    return {};
  }
}

export function getOutfitImage(avatarConfig?: string | null): string {
  const config = parseAvatarConfig(avatarConfig);
  if (config.outfit && OUTFIT_MAP[config.outfit]) {
    return OUTFIT_MAP[config.outfit];
  }
  return penguinBaseImg;
}
