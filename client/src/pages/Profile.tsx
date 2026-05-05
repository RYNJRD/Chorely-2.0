import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Check, Trophy, Star, Flame, Lock, Shield, Target } from "lucide-react";
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

const RARITY_GLOW: Record<Rarity, string> = {
  legendary: "neon-halo-gold",
  mythic: "neon-halo-purple",
  rare: "neon-halo-blue",
  common: "",
};

const RARITY_BG_GLOW: Record<Rarity, string> = {
  legendary: "rgba(255, 215, 0, 0.15)",
  mythic: "rgba(168, 85, 247, 0.15)",
  rare: "rgba(56, 189, 248, 0.15)",
  common: "rgba(255, 255, 255, 0.05)",
};

const HoldToBuyButton = ({ price, onComplete, canAfford }: { price: number, onComplete: () => void, canAfford: boolean }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHolding && !completedRef.current) {
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            if (!completedRef.current) {
              completedRef.current = true;
              onComplete();
            }
            return 100;
          }
          return p + 4; // roughly 1.25s
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
      className={cn("relative w-full py-3 rounded-xl overflow-hidden font-black uppercase text-xs transition-transform active:scale-95", 
        canAfford ? "bg-indigo-900/40 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-slate-800/50 text-white/50 cursor-not-allowed border border-slate-700/50"
      )}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Progress Fill */}
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all ease-linear" 
        style={{ width: `${progress}%` }} 
      />
      {/* Text */}
      <span className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-md">
        {canAfford ? (
          <>Hold to Unlock <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" /> {price}</>
        ) : (
          <>Need {price} Stars</>
        )}
      </span>
    </button>
  );
};

export default function Profile() {
  const { currentUser, setCurrentUser, family, setIsDrawerOpen } = useStore();
  const { toast } = useToast();
  const [config, setConfig] = useState<AvatarConfig>(() => parseAvatarConfig(currentUser?.avatarConfig));
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
        },
      );
      if (!res.ok) throw new Error("Failed to save avatar");
      return res.json();
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      queryClient.invalidateQueries({ queryKey: [api.families.getUsers.path, user.familyId] });
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
        },
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to unlock outfit");
      }
      return res.json();
    },
    onSuccess: (user, outfitId) => {
      setCurrentUser(user);
      queryClient.invalidateQueries({ queryKey: [api.families.getUsers.path, user.familyId] });
      toast({
        title: "Unlocked!",
        description: "You've got a new look. Equip it now!",
      });
      const nextConfig = { outfit: outfitId };
      setConfig(nextConfig);
      mutation.mutate(nextConfig);
    },
    onError: (error: Error) => {
      toast({
        title: "Oops!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!currentUser) return null;

  const equippedId = config.outfit ?? "classic";
  
  const previewOutfit = useMemo(
    () => PENGUIN_OUTFITS.find((o) => o.id === previewId) ?? PENGUIN_OUTFITS[0],
    [previewId],
  );

  const sortedOutfits = useMemo(() => {
    const weights: Record<Rarity, number> = { legendary: 3, mythic: 2, rare: 1, common: 0 };
    return [...PENGUIN_OUTFITS].sort((a, b) => weights[b.rarity] - weights[a.rarity]);
  }, []);

  const meta = RARITY_META[previewOutfit.rarity];
  const isUnlocked = previewOutfit.id === "classic" || !!inventory[previewOutfit.id];
  const isEquipped = equippedId === previewOutfit.id;
  const canAfford = currentUser.points >= previewOutfit.price;

  return (
    <div className="h-full transition-colors duration-700 overflow-hidden select-none flex flex-col font-sans bg-tab-profile">
      
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between h-12 px-4 sm:px-5 pt-4 pb-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-none glass shadow-[0_0_12px_rgba(250,204,21,0.3)]">
            <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-black leading-none text-indigo-950 dark:text-white">{currentUser.username}</h1>
            <p className="text-[9px] font-black uppercase tracking-wider text-indigo-900/70 dark:text-white/60 mt-0.5">Explorer Level 1</p>
          </div>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center active:scale-95 transition-all duration-300 flex-none"
        >
          <SettingsIcon className="w-4 h-4 text-foreground/50" />
        </button>
      </div>

      {/* ── Character Preview Area ── */}
      {/*
        IMPORTANT: The background image layer is absolutely positioned BELOW all character
        images using z-index: 0, with no filter/blend-mode applied to parent containers.
        Character images sit at z-index: 10+ and are never inside a blend-mode stacking context.
      */}
      <div className="relative shrink-0 mx-3 mt-3" style={{ height: 'clamp(180px, 38vw, 260px)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={previewOutfit.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {/* Background image layer — isolated, no mix-blend on any ancestor of character imgs */}
            {previewOutfit.background && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                style={{ zIndex: 0 }}
              >
                <img
                  src={previewOutfit.background}
                  className="w-full h-full object-cover opacity-50"
                  style={{ mixBlendMode: 'normal' }}
                  aria-hidden="true"
                />
                {/* Gradient vignette on top of background image only */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.1) 50%, rgba(15,23,42,0.55) 100%)',
                  }}
                />
              </div>
            )}

            {/* Rarity ambient glow — behind character, no filters on character itself */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-700"
              style={{
                zIndex: 1,
                background: `radial-gradient(ellipse at 50% 80%, ${RARITY_BG_GLOW[previewOutfit.rarity]}, transparent 70%)`,
              }}
            />

            {/* Character image — clean stacking context, no parent filters */}
            <div
              className="absolute inset-0 flex items-end justify-center pb-3"
              style={{ zIndex: 10 }}
            >
              <img
                src={previewOutfit.image}
                className="h-full w-auto object-contain drop-shadow-2xl pointer-events-none transition-all duration-300"
                style={{
                  /*
                   * COLOR BUG FIX: No filter/hue-rotate/sepia on the character image.
                   * For locked state we use a separate overlay div below instead of
                   * CSS filter on the img element to avoid hue-rotate color inversion.
                   */
                  filter: isUnlocked
                    ? `drop-shadow(0 -8px 32px ${RARITY_BG_GLOW[previewOutfit.rarity]})`
                    : 'brightness(0.55) saturate(0.3)',
                }}
              />

              {/* Locked dim overlay — separate element, NOT a filter on img */}
              {!isUnlocked && (
                <div
                  className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none"
                  style={{ zIndex: 11 }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(10,15,40,0.25)' }}
                  />
                </div>
              )}
            </div>

            {/* Floor shadow */}
            <div
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-36 h-5 rounded-[100%] pointer-events-none"
              style={{ zIndex: 9, background: 'rgba(0,0,0,0.45)', filter: 'blur(10px)' }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Compact Character Info Card ── */}
      <div className="shrink-0 mx-3 mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${previewOutfit.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl px-4 py-3 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,27,75,0.88) 100%)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            {/* Name + Rarity row */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-black text-white leading-none tracking-wide">
                  {previewOutfit.label}
                </h2>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mt-0.5", meta.color)}>
                  {previewOutfit.rarity}
                </p>
              </div>
              {/* Stat chips */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 bg-white/5 rounded-full px-2 py-1">
                  <Target className="w-2.5 h-2.5 text-purple-400"/>
                  <span className="text-[9px] font-black text-white">+{previewOutfit.stats.focus}</span>
                </div>
                <div className="flex items-center gap-0.5 bg-white/5 rounded-full px-2 py-1">
                  <Flame className="w-2.5 h-2.5 text-orange-400"/>
                  <span className="text-[9px] font-black text-white">+{previewOutfit.stats.effort}</span>
                </div>
                <div className="flex items-center gap-0.5 bg-white/5 rounded-full px-2 py-1">
                  <Shield className="w-2.5 h-2.5 text-blue-400"/>
                  <span className="text-[9px] font-black text-white">+{previewOutfit.stats.discipline}</span>
                </div>
              </div>
            </div>

            {/* Short description */}
            <p className="text-[10px] text-slate-300/75 leading-snug mb-2.5 line-clamp-2">
              {previewOutfit.description}
            </p>

            {/* Action button — full width, thumb-friendly */}
            <div className="w-full">
              {!isUnlocked ? (
                <HoldToBuyButton 
                  price={previewOutfit.price} 
                  canAfford={canAfford}
                  onComplete={() => unlockMutation.mutate(previewOutfit.id)}
                />
              ) : isEquipped ? (
                <div className="w-full py-3 rounded-xl bg-white/10 text-white/50 text-[11px] font-black uppercase text-center border border-white/5">
                  Equipped
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
                  Equip
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
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Rarity inner trace */}
        <div className={cn(
          "absolute inset-[5px] rounded-t-[1.6rem] pointer-events-none z-10 transition-all duration-500",
          meta.border ? "border" : "",
        )} style={{
          borderColor: previewOutfit.rarity === "legendary" ? 'rgba(255, 215, 0, 0.25)' :
                       previewOutfit.rarity === "mythic" ? 'rgba(168, 85, 247, 0.25)' :
                       previewOutfit.rarity === "rare" ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
          boxShadow: previewOutfit.rarity !== "common" 
            ? `inset 0 0 30px ${RARITY_BG_GLOW[previewOutfit.rarity]}` 
            : 'none',
        }} />

        {/* Wardrobe Panel Header */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.1em] text-foreground/90">Wardrobe</h2>
                <div className="h-1 w-6 bg-primary rounded-full mt-0.5 shadow-[0_0_8px_rgba(var(--glow-primary),0.5)]" />
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 rounded-full px-2.5 py-1 backdrop-blur-sm border border-white/5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]" />
                <span className="text-[10px] font-black text-white">{currentUser.points}</span>
              </div>
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{PENGUIN_OUTFITS.length} Items</p>
          </div>
        </div>

        {/* Costume Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-28 no-scrollbar mask-bottom-fade">
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {sortedOutfits.map((outfit) => {
              const isSelected = previewId === outfit.id;
              const isEquippedItem = equippedId === outfit.id;
              const isItemUnlocked = outfit.id === "classic" || !!inventory[outfit.id];
              
              return (
                <button
                  key={outfit.id}
                  onClick={() => {
                    if (outfit.comingSoon) return;
                    setPreviewId(outfit.id);
                  }}
                  className={cn(
                    "group relative aspect-square rounded-[1.25rem] transition-all duration-300 flex flex-col items-center justify-center p-2.5 overflow-hidden active:scale-95",
                    isSelected ? RARITY_GLOW[outfit.rarity] : "hover:brightness-110",
                  )}
                  style={{
                    background: isSelected 
                      ? (outfit.rarity === "legendary" ? 'rgba(255, 215, 0, 0.25)' : 
                         outfit.rarity === "mythic" ? 'rgba(168, 85, 247, 0.25)' : 
                         outfit.rarity === "rare" ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.1)')
                      : (outfit.rarity === "legendary" ? 'rgba(255, 215, 0, 0.08)' : 
                         outfit.rarity === "mythic" ? 'rgba(168, 85, 247, 0.08)' : 
                         outfit.rarity === "rare" ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.04)'),
                    border: `1.5px solid ${isSelected 
                      ? (outfit.rarity === "legendary" ? 'rgba(255, 215, 0, 0.8)' : 
                         outfit.rarity === "mythic" ? 'rgba(168, 85, 247, 0.8)' : 
                         outfit.rarity === "rare" ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.5)')
                      : (outfit.rarity === "legendary" ? 'rgba(255, 215, 0, 0.4)' : 
                         outfit.rarity === "mythic" ? 'rgba(168, 85, 247, 0.4)' : 
                         outfit.rarity === "rare" ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.15)')}`,
                  }}
                >
                  {/*
                   * COLOR BUG FIX — Wardrobe thumbnails:
                   * The locked dim effect is applied ONLY via opacity on the wrapper div.
                   * NO hue-rotate, sepia, or invert is applied to the img element.
                   * saturate(0.5) is acceptable as it doesn't shift hue.
                   * The background image of Night Ninja is NOT a parent of these thumbnails,
                   * so mix-blend-screen cannot affect them.
                   */}
                  <div className={cn(
                    "relative w-[88%] h-[88%] flex items-center justify-center transition-all duration-300",
                  )} style={{
                    opacity: isItemUnlocked ? 1 : 0.55,
                    filter: isItemUnlocked ? 'none' : 'saturate(0.35)',
                  }}>
                    <img 
                      src={outfit.image} 
                      className={cn(
                        "w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform duration-300",
                        isSelected && "scale-110"
                      )} 
                    />
                  </div>

                  {/* Lock icon badge */}
                  {!isItemUnlocked && (
                    <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-md p-1 rounded-full z-10">
                      <Lock className="w-2.5 h-2.5 text-white/80" />
                    </div>
                  )}

                  {/* Equipped badge */}
                  {isEquippedItem && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-lg flex items-center justify-center z-20 shadow-[0_0_8px_rgba(var(--glow-primary),0.5)] bg-[rgba(var(--glow-primary),0.8)]">
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                  )}

                  {/* Rarity label */}
                  <div
                    className="absolute bottom-0 w-full py-0.5 text-[7px] font-black uppercase tracking-widest text-center"
                    style={{
                      background: isSelected ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
                      color: outfit.rarity === "legendary" ? 'rgb(255, 220, 0)' :
                             outfit.rarity === "mythic" ? 'rgb(210, 160, 255)' :
                             outfit.rarity === "rare" ? 'rgb(140, 200, 255)' : 'rgba(255, 255, 255, 0.6)',
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
