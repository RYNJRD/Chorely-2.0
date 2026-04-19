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
    <div className="h-full bg-background text-foreground overflow-hidden select-none relative">
      {/* ── Background Character View ── */}
      <div className="absolute inset-x-0 top-0 bottom-[35%] flex flex-col pt-10 px-6">
        {/* HUD */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Character Center */}
        <div className="flex-1 relative flex flex-col items-center justify-center min-h-0 pointer-events-none overflow-visible mb-12">
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
          <div className="relative w-full h-full flex items-center justify-center z-10 scale-[1.3]">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                src={selectedOutfit.image}
                className="h-full w-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.3)]"
              />
            </AnimatePresence>
          </div>
          <div className="relative -mt-12 w-32 h-6 z-0">
            <div className="absolute inset-0 bg-black/10 rounded-[100%] blur-[2px]" />
          </div>
        </div>

        {/* Stats Grid - Moved above the drawer threshold */}
        <div className="grid grid-cols-3 gap-3 mb-4">
           <div className="bg-white border-[3px] border-black rounded-2xl p-2.5 flex flex-col items-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[8px] font-black text-black uppercase tracking-widest mb-1 opacity-50">Stars</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="font-display font-black text-lg text-black">{currentUser.points}</span>
              </div>
           </div>
           <div className="bg-white border-[3px] border-black rounded-2xl p-2.5 flex flex-col items-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[8px] font-black text-black uppercase tracking-widest mb-1 opacity-50">Streak</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" />
                <span className="font-display font-black text-lg text-black">{currentUser.streak || 0}</span>
              </div>
           </div>
           <div className="bg-white border-[3px] border-black rounded-2xl p-2.5 flex flex-col items-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[8px] font-black text-black uppercase tracking-widest mb-1 opacity-50">Rank</span>
               <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-black">#</span>
                <span className="font-display font-black text-lg text-black">1</span>
              </div>
           </div>
        </div>
      </div>

      {/* ── Wardrobe Section (Resizable Drawer) ── */}
      <motion.div 
        initial={{ y: "62%" }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 600 }}
        dragElastic={0.02}
        className="absolute inset-x-0 top-0 h-[100dvh] z-30 flex flex-col bg-white border-t-[5px] border-black rounded-t-[3.5rem] shadow-[0_-30px_80px_rgba(0,0,0,0.2)] overflow-hidden"
      >
        {/* Massive Drag Handle Area */}
        <div 
          className="flex-none flex flex-col items-center pt-5 pb-6 group cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "none" }}
        >
          <div className="w-16 h-2.5 bg-black/10 rounded-full group-hover:bg-black/20 transition-colors mb-5" />
          <div className="w-full flex items-center justify-between px-8">
             <div>
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black">Wardrobe</h2>
               <div className="h-1.5 w-12 bg-black rounded-full mt-2" />
             </div>
             <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">{PENGUIN_OUTFITS.length} Pieces Found</p>
          </div>
        </div>

        {/* Wardrobe Grid */}
        <div 
          className="flex-1 overflow-y-auto px-8 pb-32 pt-2 no-scrollbar touch-pan-y overscroll-contain"
          onPointerDown={(e) => e.stopPropagation()}
        >
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
      </motion.div>
    </div>
  );
}
