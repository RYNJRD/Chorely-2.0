import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Check, Trophy, Star, Flame } from "lucide-react";
import { useLocation } from "wouter";
import { api, buildUrl } from "../../../shared/routes";
import { queryClient } from "../lib/queryClient";
import { useStore } from "../store/useStore";
import { apiFetch } from "../lib/apiFetch";
import {
  PENGUIN_OUTFITS,
  parseAvatarConfig,
  type AvatarConfig,
  RARITY_META,
  type Rarity,
} from "../lib/avatar";
import { cn } from "../lib/utils";

export default function Profile() {
  const { currentUser, setCurrentUser, family, setIsDrawerOpen } = useStore();
  const [config, setConfig] = useState<AvatarConfig>(() => parseAvatarConfig(currentUser?.avatarConfig));

  useEffect(() => {
    setConfig(parseAvatarConfig(currentUser?.avatarConfig));
  }, [currentUser?.avatarConfig]);

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
    },
  });

  if (!currentUser) return null;

  const selectedId = config.outfit ?? "classic";
  const selectedOutfit = useMemo(
    () => PENGUIN_OUTFITS.find((o) => o.id === selectedId) ?? PENGUIN_OUTFITS[0],
    [selectedId],
  );

  // Sort outfits by rarity rarity: legendary > mythic > rare > common
  const sortedOutfits = useMemo(() => {
    const weights: Record<Rarity, number> = { legendary: 3, mythic: 2, rare: 1, common: 0 };
    return [...PENGUIN_OUTFITS].sort((a, b) => weights[b.rarity] - weights[a.rarity]);
  }, []);

  const meta = RARITY_META[selectedOutfit.rarity];

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden select-none relative">
      {/* ── Top Section (HUD) ── */}
      <div className="flex-none px-6 pt-10 pb-2 z-10 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <Trophy className="w-6 h-6 text-black" />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">{currentUser.username}</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Explorer Level 1</p>
             </div>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
             <SettingsIcon className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-white border-[3px] border-black rounded-2xl p-3 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5 opacity-60">Stars</span>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="font-display font-black text-xl leading-none text-black">{currentUser.points}</span>
              </div>
           </div>
           <div className="bg-white border-[3px] border-black rounded-2xl p-3 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5 opacity-60">Streak</span>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
                <span className="font-display font-black text-xl leading-none text-black">{currentUser.streak || 0}</span>
              </div>
           </div>
           <div className="bg-white border-[3px] border-black rounded-2xl p-3 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5 opacity-60">Rank</span>
               <div className="flex items-center gap-2">
                <span className="text-sm font-black text-black">#</span>
                <span className="font-display font-black text-xl leading-none text-black">1</span>
              </div>
           </div>
        </div>
      </div>

      {/* ── Character Center-Top (2/5 of screen) ── */}
      <div className="flex-[2] relative flex flex-col items-center justify-center px-6 min-h-0 pointer-events-none overflow-visible">
        {/* Dynamic Rarity Glow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedOutfit.rarity}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-[100px] rounded-full z-0",
              selectedOutfit.rarity === "legendary" ? "bg-amber-400" :
              selectedOutfit.rarity === "mythic" ? "bg-purple-500" :
              selectedOutfit.rarity === "rare" ? "bg-blue-400" : "bg-slate-400"
            )}
          />
        </AnimatePresence>
        
        {/* The Penguin */}
        <div className="relative w-full h-full flex items-center justify-center z-10 scale-125">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedId}
              initial={{ opacity: 0, scale: 1.1, y: 15 }}
              animate={{ opacity: 1, scale: 1.25, y: -20 }}
              exit={{ opacity: 0, scale: 1.1, y: 15 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              src={selectedOutfit.image}
              alt={selectedOutfit.label}
              className="h-full w-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.3)]"
            />
          </AnimatePresence>
        </div>

        {/* Shadow Podium */}
        <div className="relative -mt-16 w-36 h-8 z-0">
          <div className="absolute inset-0 bg-black/10 rounded-[100%] blur-[2px]" />
        </div>

        {/* Rarity Banner (Bottom Left of Preview) */}
        <div className="absolute bottom-4 left-6 z-30 flex flex-col items-start pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedOutfit.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex flex-col items-start"
            >
              <div className={cn(
                "px-3 py-1 rounded-full border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5",
                meta.bg, "text-white"
              )}>
                <span className="text-[10px] font-black uppercase tracking-widest">{meta.label}</span>
              </div>
              <h2 className="text-lg font-black text-black mt-1 drop-shadow-sm">{selectedOutfit.label}</h2>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Wardrobe Section (3/5 of screen) ── */}
      <div className="flex-[3] relative z-20 flex flex-col bg-white border-t-[4px] border-black rounded-t-[3.5rem] shadow-[0_-10px_50px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="flex-none flex items-center justify-between px-8 pt-8 pb-4">
           <div>
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black">Wardrobe</h2>
             <div className="h-1.5 w-10 bg-black rounded-full mt-2" />
           </div>
           <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">{PENGUIN_OUTFITS.length} Pieces Found</p>
        </div>

        {/* Wardrobe Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-32 pt-4 no-scrollbar touch-pan-y overscroll-contain">
          <div className="grid grid-cols-3 gap-5">
            {sortedOutfits.map((outfit) => {
              const isSelected = selectedId === outfit.id;
              const outfitMeta = RARITY_META[outfit.rarity];
              return (
                <button
                  key={outfit.id}
                  onClick={() => {
                    if (!outfit.comingSoon) {
                      const nextConfig = { outfit: outfit.id };
                      setConfig(nextConfig);
                      mutation.mutate(nextConfig);
                    }
                  }}
                  className={cn(
                    "group relative aspect-square rounded-[2rem] border-[3px] transition-all duration-300 flex flex-col items-center justify-center p-3 overflow-hidden",
                    isSelected 
                      ? "border-black bg-white scale-105 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] ring-4 ring-black/5" 
                      : "bg-slate-100 hover:bg-slate-200 active:scale-95",
                    !isSelected && `border-transparent`,
                    isSelected && outfit.rarity !== "common" && `bg-gradient-to-tr ${outfit.rarity === "legendary" ? "from-amber-100 to-white" : outfit.rarity === "mythic" ? "from-purple-100 to-white" : "from-blue-100 to-white"}`
                  )}
                  style={{ borderColor: isSelected ? 'black' : 'transparent' }}
                >
                  {/* Rarity Border Overlay */}
                  <div className={cn(
                      "absolute inset-0 border-[3.5px] rounded-[inherit] pointer-events-none opacity-80",
                      outfitMeta.border
                  )} />

                  <img src={outfit.image} className="w-[85%] h-[85%] object-contain pointer-events-none drop-shadow-sm" />
                  
                  {isSelected && (
                    <div className={cn(
                        "absolute top-2 right-2 w-6 h-6 rounded-full border-[2.5px] border-black flex items-center justify-center shadow-md",
                        outfitMeta.bg
                    )}>
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={5} />
                    </div>
                  )}

                  {/* Faded Rarity Overlay on selection */}
                  {isSelected && (
                    <div className={cn(
                        "absolute inset-0 pointer-events-none opacity-10",
                        outfitMeta.bg
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
