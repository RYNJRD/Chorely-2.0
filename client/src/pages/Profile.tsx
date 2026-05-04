import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Check, Trophy, Star, Flame, Lock, Shield, Zap, Target } from "lucide-react";
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
      className={cn("relative w-full py-2.5 rounded-xl overflow-hidden font-black uppercase text-[10px] sm:text-xs transition-transform active:scale-95", 
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
      // Optionally auto-equip upon unlock
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
      
      {/* ── Top Section (flex: 2.5) ── */}
      <div className="flex-[2.5] flex flex-col pt-5 px-4 sm:px-5 min-h-0">
        {/* Top Header */}
        <div className="flex items-center justify-between h-10 mb-4">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none glass shadow-[0_0_12px_rgba(250,204,21,0.3)]">
                <Trophy className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-black leading-none text-indigo-950 dark:text-white">{currentUser.username}</h1>
                <p className="text-[9px] font-black uppercase tracking-wider text-indigo-900/70 dark:text-white/60 mt-1">Explorer Level 1</p>
              </div>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-95 transition-all duration-300 flex-none"
          >
              <SettingsIcon className="w-5 h-5 text-foreground/50" />
          </button>
        </div>

        {/* Character Preview Card (RPG Style) */}
        <div className="flex-1 relative flex items-center justify-center min-h-0 w-full max-w-lg mx-auto mb-4 mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={previewOutfit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full max-h-[220px] rounded-[1.5rem] p-3 sm:p-4 flex gap-3 sm:gap-4 overflow-hidden relative shadow-2xl border border-white/5"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.95) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Background Glow inside card */}
              <div 
                className="absolute inset-0 opacity-30 blur-2xl pointer-events-none transition-colors duration-700"
                style={{ background: `radial-gradient(circle at 30% 50%, ${RARITY_BG_GLOW[previewOutfit.rarity]}, transparent 70%)` }}
              />

              {/* Character Side */}
              <div className="flex-none w-[40%] relative flex flex-col items-center justify-center">
                <div className="relative w-full h-[85%] flex items-center justify-center z-10 drop-shadow-2xl">
                  <img
                    src={previewOutfit.image}
                    className={cn(
                      "max-h-full w-auto object-contain transition-all duration-300",
                      !isUnlocked && "grayscale brightness-50"
                    )}
                    style={{ filter: isUnlocked ? `drop-shadow(0 10px 15px ${RARITY_BG_GLOW[previewOutfit.rarity]})` : undefined }}
                  />
                </div>
                <div className="w-20 h-2 rounded-[100%] blur-[2px] bg-white/5 absolute bottom-4" />
              </div>

              {/* Info Side */}
              <div className="flex-1 flex flex-col justify-center relative z-10 min-w-0 py-1">
                <div className="mb-auto">
                  <h2 className="text-sm sm:text-base font-black text-white leading-none tracking-wide truncate pr-2">
                    {previewOutfit.label}
                  </h2>
                  <p className={cn("text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-1", meta.color)}>
                    {previewOutfit.rarity}
                  </p>
                </div>
                
                <p className="text-[10px] sm:text-xs text-slate-300/80 leading-snug mt-2 mb-3 line-clamp-3">
                  {previewOutfit.description}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-purple-400" />
                    <div className="flex flex-col">
                      <span className="text-white text-[10px] font-black leading-none">+{previewOutfit.stats.focus}</span>
                      <span className="text-purple-400/60 text-[6px] font-black uppercase tracking-wider leading-none mt-0.5">Focus</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <div className="flex flex-col">
                      <span className="text-white text-[10px] font-black leading-none">+{previewOutfit.stats.effort}</span>
                      <span className="text-orange-400/60 text-[6px] font-black uppercase tracking-wider leading-none mt-0.5">Effort</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <div className="flex flex-col">
                      <span className="text-white text-[10px] font-black leading-none">+{previewOutfit.stats.discipline}</span>
                      <span className="text-blue-400/60 text-[6px] font-black uppercase tracking-wider leading-none mt-0.5">Discip.</span>
                    </div>
                  </div>
                </div>

                {/* Action Button Area */}
                <div className="mt-auto">
                  {!isUnlocked ? (
                    <HoldToBuyButton 
                      price={previewOutfit.price} 
                      canAfford={canAfford}
                      onComplete={() => unlockMutation.mutate(previewOutfit.id)}
                    />
                  ) : isEquipped ? (
                    <div className="w-full py-2.5 rounded-xl bg-white/10 text-white/50 text-[10px] sm:text-xs font-black uppercase text-center border border-white/5">
                      Equipped
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const nextConfig = { outfit: previewOutfit.id };
                        setConfig(nextConfig);
                        mutation.mutate(nextConfig);
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] sm:text-xs font-black uppercase shadow-lg active:scale-95 transition-transform"
                    >
                      Equip
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom Section (flex: 2.5) ── */}
      <div className="flex-[2.5] relative rounded-t-[2.5rem] flex flex-col overflow-hidden mx-1 mb-[-4px]"
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
        {/* Inside Trace - rarity glow (based on previewed item) */}
        <div className={cn(
          "absolute inset-[5px] rounded-t-[2.1rem] pointer-events-none z-10 transition-all duration-500",
          meta.border ? "border" : "",
        )} style={{
          borderColor: previewOutfit.rarity === "legendary" ? 'rgba(255, 215, 0, 0.25)' :
                       previewOutfit.rarity === "mythic" ? 'rgba(168, 85, 247, 0.25)' :
                       previewOutfit.rarity === "rare" ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
          boxShadow: previewOutfit.rarity !== "common" 
            ? `inset 0 0 30px ${RARITY_BG_GLOW[previewOutfit.rarity]}` 
            : 'none',
        }} />

        {/* Panel Header */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
        <div className="flex-1 overflow-y-auto px-5 pb-28 no-scrollbar mask-bottom-fade">
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {sortedOutfits.map((outfit) => {
              const isSelected = previewId === outfit.id;
              const isEquipped = equippedId === outfit.id;
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
                  {/* Item Image */}
                  <div className={cn(
                    "relative w-[88%] h-[88%] flex items-center justify-center transition-all duration-300",
                    !isItemUnlocked && "grayscale opacity-50 blur-[1px]"
                  )}>
                    <img 
                      src={outfit.image} 
                      className={cn(
                        "w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform duration-300",
                        isSelected && "scale-110"
                      )} 
                    />
                  </div>

                  {/* Lock Overlay */}
                  {!isItemUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all group-hover:bg-black/20">
                      <Lock className="w-5 h-5 text-white/90 drop-shadow-lg" />
                    </div>
                  )}

                  {/* Equipped Badge */}
                  {isEquipped && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-lg flex items-center justify-center z-20 shadow-[0_0_8px_rgba(var(--glow-primary),0.5)] bg-[rgba(var(--glow-primary),0.8)]">
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                  )}

                  {/* Rarity Label (Bottom) */}
                  <div className="absolute bottom-0 w-full py-1 text-[7px] font-black uppercase tracking-widest text-center backdrop-blur-[4px]"
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

