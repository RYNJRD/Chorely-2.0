import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Settings as SettingsIcon, Check } from "lucide-react";
import { useLocation } from "wouter";
import { api, buildUrl } from "../../../shared/routes";
import { queryClient } from "../lib/queryClient";
import { useStore } from "../store/useStore";
import { apiFetch } from "../lib/apiFetch";
import {
  PENGUIN_OUTFITS,
  parseAvatarConfig,
  type AvatarConfig,
} from "../lib/avatar";
import { cn } from "../lib/utils";

export default function Profile() {
  const { currentUser, setCurrentUser, family } = useStore();
  const [, setLocation] = useLocation();

  const [config, setConfig] = useState<AvatarConfig>(() =>
    parseAvatarConfig(currentUser?.avatarConfig),
  );

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
      queryClient.invalidateQueries({
        queryKey: [api.families.getUsers.path, user.familyId],
      });
    },
  });

  if (!currentUser) return null;

  const selectedId = config.outfit ?? "classic";
  const selectedOutfit = useMemo(
    () => PENGUIN_OUTFITS.find((o) => o.id === selectedId) ?? PENGUIN_OUTFITS[0],
    [selectedId],
  );

  return (
    <div className="flex flex-col h-full bg-tab-profile overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex-none flex items-center justify-between px-5 pt-8 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🐧</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-primary uppercase tracking-tight">Taskling</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Character</p>
          </div>
        </div>
      </div>

      {/* ── Character preview (Reduced height to 38%) ── */}
      <div className="flex-none relative flex items-end justify-center bg-gradient-to-b from-primary/5 via-transparent to-transparent mb-2" style={{ height: "35%" }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
           <div className="w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        </div>
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedId}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            src={selectedOutfit.image}
            alt={selectedOutfit.label}
            className="relative z-10 h-[90%] w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          />
        </AnimatePresence>
      </div>

      {/* ── Outfit picker panel (Takes remaining 60%+) ── */}
      <div className="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="flex-none px-6 pt-6 pb-2">
          <h2 className="font-black text-xs text-slate-400 uppercase tracking-widest">Wardrobe</h2>
          <div className="h-1 w-8 bg-primary/20 rounded-full mt-1.5" />
        </div>

        {/* Scrollable area - handles only internal scroll */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 pt-2 no-scrollbar scroll-smooth">
          <div className="grid grid-cols-3 gap-3.5">
            {PENGUIN_OUTFITS.map((outfit, i) => {
              const isSelected = selectedId === outfit.id;
              return (
                <button
                  key={outfit.id}
                  disabled={outfit.comingSoon}
                  onClick={() => {
                    if (!outfit.comingSoon) {
                      const nextConfig = { outfit: outfit.id };
                      setConfig(nextConfig);
                      mutation.mutate(nextConfig);
                    }
                  }}
                  className={cn(
                    "group relative aspect-square rounded-[1.25rem] border-2 transition-all flex flex-col items-center justify-center p-2",
                    outfit.comingSoon
                      ? "border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-zinc-950/20 grayscale opacity-40 cursor-not-allowed"
                      : isSelected
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/30 hover:border-slate-300 dark:hover:border-slate-600 active:scale-95",
                  )}
                >
                  <img
                    src={outfit.image}
                    alt={outfit.label}
                    className="w-full h-full object-contain object-bottom pointer-events-none"
                  />
                  
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                    </div>
                  )}

                  {outfit.comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
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
