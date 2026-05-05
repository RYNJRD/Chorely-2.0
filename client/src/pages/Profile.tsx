import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  Check,
  Star,
  Flame,
  Lock,
  Shield,
  Target,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import { api, buildUrl } from "../../../shared/routes";
import { queryClient } from "../lib/queryClient";
import { useStore } from "../store/useStore";
import { apiFetch } from "../lib/apiFetch";
import { useToast } from "../hooks/use-toast";
import {
  PENGUIN_OUTFITS,
  parseAvatarConfig,
  type AvatarConfig,
  RARITY_META,
  type Rarity,
} from "../lib/avatar";
import { cn } from "../lib/utils";

/* ─── Rarity tokens ─────────────────────────────────────── */
const RARITY_GLOW: Record<Rarity, string> = {
  legendary: "neon-halo-gold",
  mythic: "neon-halo-purple",
  rare: "neon-halo-blue",
  common: "",
};

const RARITY_BG_GLOW: Record<Rarity, string> = {
  legendary: "rgba(255, 200, 0, 0.22)",
  mythic: "rgba(168, 85, 247, 0.22)",
  rare: "rgba(56, 189, 248, 0.22)",
  common: "rgba(255, 255, 255, 0.06)",
};

const RARITY_BORDER_COLOR: Record<Rarity, string> = {
  legendary: "rgba(255, 200, 0, 0.9)",
  mythic: "rgba(200, 100, 255, 0.9)",
  rare: "rgba(56, 189, 248, 0.9)",
  common: "rgba(255, 255, 255, 0.25)",
};

const RARITY_BADGE_COLOR: Record<Rarity, string> = {
  legendary: "rgb(255, 215, 0)",
  mythic: "rgb(210, 140, 255)",
  rare: "rgb(100, 210, 255)",
  common: "rgba(255, 255, 255, 0.55)",
};

/** Per-rarity CSS animation class applied to the wardrobe card border. */
const RARITY_CARD_ANIM: Record<Rarity, string> = {
  legendary: "rarity-anim-legendary",
  mythic:    "rarity-anim-mythic",
  rare:      "rarity-anim-rare",
  common:    "",
};

/* ─── Hold-to-Buy button ─────────────────────────────────── */
const HoldToBuyButton = ({
  price,
  onComplete,
  canAfford,
}: {
  price: number;
  onComplete: () => void;
  canAfford: boolean;
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHolding && !completedRef.current) {
      timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            if (!completedRef.current) {
              completedRef.current = true;
              onComplete();
            }
            return 100;
          }
          return p + 4;
        });
      }, 50);
    } else if (!isHolding) {
      setProgress(0);
      completedRef.current = false;
    }
    return () => clearInterval(timer);
  }, [isHolding, onComplete]);

  return (
    <button
      onPointerDown={() => canAfford && setIsHolding(true)}
      onPointerUp={() => setIsHolding(false)}
      onPointerLeave={() => setIsHolding(false)}
      className={cn(
        "relative w-full py-3 rounded-xl overflow-hidden font-black uppercase text-xs transition-transform active:scale-95",
        canAfford
          ? "bg-indigo-900/40 text-white border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          : "bg-slate-800/50 text-white/50 cursor-not-allowed border border-slate-700/50"
      )}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Progress Fill */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-violet-400 transition-all ease-linear"
        style={{ width: `${progress}%` }}
      />
      <span className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-md">
        {canAfford ? (
          <>
            Hold to Unlock{" "}
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />{" "}
            {price}
          </>
        ) : (
          <>Need {price} Stars</>
        )}
      </span>
    </button>
  );
};

/* ─── Main component ─────────────────────────────────────── */
export default function Profile() {
  const { currentUser, setCurrentUser, setIsDrawerOpen } = useStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [config, setConfig] = useState<AvatarConfig>(() =>
    parseAvatarConfig(currentUser?.avatarConfig)
  );
  const [previewId, setPreviewId] = useState<string>(config.outfit ?? "classic");

  useEffect(() => {
    setConfig(parseAvatarConfig(currentUser?.avatarConfig));
  }, [currentUser?.avatarConfig]);

  const inventory = useMemo(() => {
    try {
      return JSON.parse(currentUser?.avatarInventory || "{}");
    } catch {
      return {};
    }
  }, [currentUser?.avatarInventory]);

  const mutation = useMutation({
    mutationFn: async (nextConfig: AvatarConfig) => {
      const res = await apiFetch(
        buildUrl(api.users.updateAvatar.path, { id: currentUser?.id || 0 }),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarConfig: JSON.stringify(nextConfig) }),
        }
      );
      if (!res.ok) throw new Error("Failed to save avatar");
      return res.json();
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      queryClient.invalidateQueries({
        queryKey: [api.families.getUsers.path, user.familyId],
      });
      toast({ title: "Equipped!", description: "Your new look is saved." });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async (outfitId: string) => {
      const res = await apiFetch(
        buildUrl(api.users.unlockAvatar.path, { id: currentUser?.id || 0 }),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outfitId }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to unlock outfit");
      }
      return res.json();
    },
    onSuccess: (user, outfitId) => {
      setCurrentUser(user);
      queryClient.invalidateQueries({
        queryKey: [api.families.getUsers.path, user.familyId],
      });
      toast({ title: "Unlocked!", description: "You've got a new look. Equip it now!" });
      const nextConfig = { outfit: outfitId };
      setConfig(nextConfig);
      mutation.mutate(nextConfig);
    },
    onError: (error: Error) => {
      toast({ title: "Oops!", description: error.message, variant: "destructive" });
    },
  });

  if (!currentUser) return null;

  const equippedId = config.outfit ?? "classic";

  const previewOutfit = useMemo(
    () => PENGUIN_OUTFITS.find((o) => o.id === previewId) ?? PENGUIN_OUTFITS[0],
    [previewId]
  );

  const sortedOutfits = useMemo(() => {
    const weights: Record<Rarity, number> = {
      legendary: 3,
      mythic: 2,
      rare: 1,
      common: 0,
    };
    return [...PENGUIN_OUTFITS].sort((a, b) => weights[b.rarity] - weights[a.rarity]);
  }, []);

  const meta = RARITY_META[previewOutfit.rarity];
  const isUnlocked = previewOutfit.id === "classic" || !!inventory[previewOutfit.id];
  const isEquipped = equippedId === previewOutfit.id;
  const canAfford = currentUser.points >= previewOutfit.price;

  return (
    <div className="h-full overflow-hidden select-none flex flex-col font-sans bg-tab-profile relative">

      {/* ── Rarity-coloured ambient background wash ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${previewOutfit.rarity}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${RARITY_BG_GLOW[previewOutfit.rarity]}, transparent 65%)`,
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {/* ── Top Header ── */}
      <div className="relative flex items-center justify-between h-12 px-4 pt-4 pb-0 shrink-0" style={{ zIndex: 10 }}>
        {/* Back arrow */}
        <button
          onClick={() => {
            if (currentUser?.familyId) {
              setLocation(`/family/${currentUser.familyId}/dashboard`);
            }
          }}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center active:scale-90 transition-all duration-200 flex-none"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-white/80" />
        </button>

        {/* Username centred */}
        <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
          <h1 className="text-base font-black leading-none text-white drop-shadow-md">
            {currentUser.username}
          </h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-white/50 mt-0.5">
            Explorer · Level 1
          </p>
        </div>

        {/* Settings */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center active:scale-90 transition-all duration-200 flex-none"
        >
          <SettingsIcon className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* ── Character Preview — full bleed, no card wrapper ── */}
      <div
        className="relative shrink-0 w-full"
        style={{ height: "clamp(200px, 46vw, 290px)", zIndex: 5 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={previewOutfit.id}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Outfit background — isolated layer, no blending on character ancestor */}
            {previewOutfit.background && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ zIndex: 0 }}
              >
                <img
                  src={previewOutfit.background}
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.55, mixBlendMode: "normal" }}
                  aria-hidden="true"
                />
                {/* Bottom fade so it blends into the section below */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(10,10,25,0.25) 0%, rgba(10,10,25,0.05) 45%, rgba(10,10,25,0.7) 100%)",
                  }}
                />
              </div>
            )}

            {/* Rarity ground glow */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-700"
              style={{
                zIndex: 2,
                width: "160%",
                height: "55%",
                background: `radial-gradient(ellipse at 50% 100%, ${RARITY_BG_GLOW[previewOutfit.rarity]}, transparent 65%)`,
                filter: "blur(4px)",
              }}
            />

            {/* Character image — sits in clean context above background */}
            <div
              className="absolute inset-0 flex items-end justify-center"
              style={{ zIndex: 10, paddingBottom: "4px" }}
            >
              <img
                src={previewOutfit.image}
                className="h-full w-auto object-contain pointer-events-none"
                style={{
                  /*
                   * COLOR BUG FIX:
                   * Locked state uses ONLY brightness + saturate (no hue-rotate/sepia/invert).
                   * drop-shadow provides the rarity halo for unlocked characters.
                   */
                  filter: isUnlocked
                    ? `drop-shadow(0 0 28px ${RARITY_BG_GLOW[previewOutfit.rarity]}) drop-shadow(0 -4px 20px ${RARITY_BG_GLOW[previewOutfit.rarity]})`
                    : "brightness(0.45) saturate(0.25)",
                  transition: "filter 0.4s ease",
                }}
              />

              {/* Locked overlay tint — separate from img */}
              {!isUnlocked && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "rgba(5,10,30,0.35)",
                    zIndex: 11,
                  }}
                />
              )}
            </div>

            {/* Floor shadow ellipse */}
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                zIndex: 9,
                bottom: 2,
                width: 120,
                height: 14,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                filter: "blur(10px)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Compact Info + Action Card ── */}
      <div className="shrink-0 mx-3 mt-1.5" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${previewOutfit.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl px-4 py-2.5 border relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(12,18,45,0.88) 0%, rgba(22,20,60,0.92) 100%)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              borderColor: RARITY_BORDER_COLOR[previewOutfit.rarity],
              boxShadow: `0 0 24px ${RARITY_BG_GLOW[previewOutfit.rarity]}, inset 0 0 16px rgba(255,255,255,0.025)`,
            }}
          >
            {/* Rarity shimmer line at top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${RARITY_BORDER_COLOR[previewOutfit.rarity]} 40%, transparent 100%)`,
                opacity: 0.9,
              }}
            />

            {/* Name row + stats */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white leading-none tracking-wide">
                  {previewOutfit.label}
                </h2>
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{
                    color: RARITY_BADGE_COLOR[previewOutfit.rarity],
                    background: `${RARITY_BG_GLOW[previewOutfit.rarity]}`,
                    border: `1px solid ${RARITY_BORDER_COLOR[previewOutfit.rarity]}`,
                    textShadow: `0 0 8px ${RARITY_BADGE_COLOR[previewOutfit.rarity]}`,
                  }}
                >
                  {previewOutfit.rarity}
                </span>
              </div>
              {/* Stat chips */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full px-1.5 py-0.5">
                  <Target className="w-2.5 h-2.5 text-purple-400" />
                  <span className="text-[9px] font-black text-white">
                    +{previewOutfit.stats.focus}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-1.5 py-0.5">
                  <Flame className="w-2.5 h-2.5 text-orange-400" />
                  <span className="text-[9px] font-black text-white">
                    +{previewOutfit.stats.effort}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-1.5 py-0.5">
                  <Shield className="w-2.5 h-2.5 text-blue-400" />
                  <span className="text-[9px] font-black text-white">
                    +{previewOutfit.stats.discipline}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[10px] text-slate-300/70 leading-snug mb-2.5 line-clamp-2">
              {previewOutfit.description}
            </p>

            {/* Action button */}
            <div className="w-full">
              {!isUnlocked ? (
                <HoldToBuyButton
                  price={previewOutfit.price}
                  canAfford={canAfford}
                  onComplete={() => unlockMutation.mutate(previewOutfit.id)}
                />
              ) : isEquipped ? (
                <div className="w-full py-3 rounded-xl bg-white/8 text-white/40 text-[11px] font-black uppercase text-center border border-white/8">
                  ✓ Equipped
                </div>
              ) : (
                <button
                  onClick={() => {
                    const nextConfig = { outfit: previewOutfit.id };
                    setConfig(nextConfig);
                    mutation.mutate(nextConfig);
                  }}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[11px] font-black uppercase shadow-lg active:scale-95 transition-transform"
                >
                  Equip Now
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Wardrobe Panel ── */}
      <div
        className="flex-1 relative rounded-t-[2rem] flex flex-col overflow-hidden mx-1 mt-2 mb-[-4px]"
        style={{
          background: "rgba(8, 10, 30, 0.72)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
          zIndex: 10,
        }}
      >
        {/* Rarity inner trace */}
        <div
          className="absolute inset-[4px] rounded-t-[1.6rem] pointer-events-none transition-all duration-500"
          style={{
            zIndex: 11,
            border: `1px solid ${RARITY_BG_GLOW[previewOutfit.rarity]}`,
            boxShadow:
              previewOutfit.rarity !== "common"
                ? `inset 0 0 40px ${RARITY_BG_GLOW[previewOutfit.rarity]}`
                : "none",
          }}
        />

        {/* Wardrobe header */}
        <div className="px-5 pt-4 pb-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-white/80">
                  Wardrobe
                </h2>
                <div className="h-[3px] w-6 bg-primary rounded-full mt-0.5 shadow-[0_0_8px_rgba(var(--glow-primary),0.6)]" />
              </div>
              <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                <span className="text-[10px] font-black text-amber-300">
                  {currentUser.points}
                </span>
              </div>
            </div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
              {PENGUIN_OUTFITS.length} items
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {sortedOutfits.map((outfit) => {
              const isSelected = previewId === outfit.id;
              const isEquippedItem = equippedId === outfit.id;
              const isItemUnlocked =
                outfit.id === "classic" || !!inventory[outfit.id];

              return (
                <button
                  key={outfit.id}
                  onClick={() => {
                    if (outfit.comingSoon) return;
                    setPreviewId(outfit.id);
                  }}
                  className={cn(
                    "group relative aspect-square rounded-[1.1rem] flex flex-col items-center justify-center overflow-hidden active:scale-92 transition-transform duration-150",
                    /* Per-rarity glow animation on the selected card */
                    isSelected ? RARITY_CARD_ANIM[outfit.rarity] : ""
                  )}
                  style={{
                    background: isSelected
                      ? outfit.rarity === "legendary"
                        ? "rgba(255, 200, 0, 0.18)"
                        : outfit.rarity === "mythic"
                        ? "rgba(168, 85, 247, 0.20)"
                        : outfit.rarity === "rare"
                        ? "rgba(56, 189, 248, 0.18)"
                        : "rgba(255, 255, 255, 0.1)"
                      : outfit.rarity === "legendary"
                      ? "rgba(255, 200, 0, 0.05)"
                      : outfit.rarity === "mythic"
                      ? "rgba(168, 85, 247, 0.06)"
                      : outfit.rarity === "rare"
                      ? "rgba(56, 189, 248, 0.05)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: `1.5px solid ${
                      isSelected
                        ? RARITY_BORDER_COLOR[outfit.rarity]
                        : outfit.rarity === "legendary"
                        ? "rgba(255, 200, 0, 0.35)"
                        : outfit.rarity === "mythic"
                        ? "rgba(168, 85, 247, 0.35)"
                        : outfit.rarity === "rare"
                        ? "rgba(56, 189, 248, 0.35)"
                        : "rgba(255, 255, 255, 0.12)"
                    }`,
                  }}
                >
                  {/*
                   * COLOR FIX: locked thumbnails use opacity + saturate on the wrapper.
                   * No hue-rotate. No invert. No sepia. No parent blend-mode.
                   */}
                  <div
                    className="relative w-[80%] h-[78%] flex items-center justify-center"
                    style={{
                      opacity: isItemUnlocked ? 1 : 0.45,
                      filter: isItemUnlocked ? "none" : "saturate(0.2)",
                      transform: isSelected ? "scale(1.08)" : "scale(1)",
                      transition: "transform 0.25s ease, opacity 0.2s, filter 0.2s",
                    }}
                  >
                    <img
                      src={outfit.image}
                      className="w-full h-full object-contain pointer-events-none"
                      style={{
                        filter: isSelected && isItemUnlocked
                          ? `drop-shadow(0 0 8px ${RARITY_BG_GLOW[outfit.rarity]})`
                          : "none",
                      }}
                    />
                  </div>

                  {/* Lock badge */}
                  {!isItemUnlocked && (
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm p-1 rounded-full z-10">
                      <Lock className="w-2.5 h-2.5 text-white/70" />
                    </div>
                  )}

                  {/* Equipped check */}
                  {isEquippedItem && (
                    <div
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-lg flex items-center justify-center z-20"
                      style={{
                        background: `rgba(var(--glow-primary), 0.85)`,
                        boxShadow: `0 0 8px rgba(var(--glow-primary), 0.6)`,
                      }}
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                    </div>
                  )}

                  {/* Rarity strip */}
                  <div
                    className="absolute bottom-0 left-0 right-0 py-[3px] text-[6.5px] font-black uppercase tracking-widest text-center"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: RARITY_BADGE_COLOR[outfit.rarity],
                      textShadow: isSelected
                        ? `0 0 6px ${RARITY_BADGE_COLOR[outfit.rarity]}`
                        : "none",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {outfit.rarity}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
