import { useEffect, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, Check, X, Lock, Shirt, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import { apiFetch } from "@/lib/apiFetch";
import {
  useFamilyActivity,
  useFamilyAchievements,
  useFamilyChores,
  useFamilyMonthlyWinners,
} from "@/hooks/use-families";
import {
  PENGUIN_OUTFITS,
  parseAvatarConfig,
  type AvatarConfig,
} from "@/lib/avatar";
import { cn } from "@/lib/utils";
import type { Chore } from "@shared/schema";
import { ChoreCard } from "@/components/ChoreCard";

type PanelTab = "outfits" | "stats";

function getDaysSinceCompleted(chore: Chore) {
  if (!chore.lastCompletedAt) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(chore.lastCompletedAt).getTime()) / (1000 * 60 * 60 * 24);
}

export default function Profile() {
  const { currentUser, setCurrentUser } = useStore();
  const { toast } = useToast();

  const [config, setConfig] = useState<AvatarConfig>(() =>
    parseAvatarConfig(currentUser?.avatarConfig),
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("outfits");

  useEffect(() => {
    setConfig(parseAvatarConfig(currentUser?.avatarConfig));
  }, [currentUser?.avatarConfig]);

  const familyId = currentUser?.familyId ?? 0;
  const { data: chores = [] } = useFamilyChores(familyId);
  const { data: activity = [] } = useFamilyActivity(familyId);
  const { data: achievements = [] } = useFamilyAchievements(familyId);
  const { data: winners = [] } = useFamilyMonthlyWinners(familyId);

  const myChores = useMemo(
    () => chores.filter((c) => c.assigneeId === currentUser?.id || c.assigneeId === null),
    [chores, currentUser?.id],
  );

  const bucketed = useMemo(() => {
    const out: Record<"upcoming" | "recent", Chore[]> = { upcoming: [], recent: [] };
    myChores.forEach((c) => {
      const days = getDaysSinceCompleted(c);
      if (days <= 1) out.recent.push(c);
      else if (c.type === "weekly" && days <= 7) out.upcoming.push(c);
      else if (c.type === "monthly" && days <= 30) out.upcoming.push(c);
    });
    return out;
  }, [myChores]);

  const myAchievements = useMemo(
    () => achievements.filter((a) => a.userId === currentUser?.id).slice(0, 5),
    [achievements, currentUser?.id],
  );

  const latestWinner = winners[0];

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
      toast({ title: "Character saved!", description: "Your penguin is ready." });
    },
    onError: () => {
      toast({ title: "Could not save", description: "Try again in a moment.", variant: "destructive" });
    },
  });

  if (!currentUser) return null;

  const selectedId = config.outfit ?? "classic";
  const selectedOutfit = PENGUIN_OUTFITS.find((o) => o.id === selectedId) ?? PENGUIN_OUTFITS[0];

  function handleReset() {
    setConfig({});
    setConfirmReset(false);
    toast({ title: "Character reset", description: "Back to your classic penguin." });
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background">

      {/* ── Top bar ── */}
      <div className="flex-none flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-base font-black text-primary tracking-tight">Me</h1>

        {panelTab === "outfits" && (
          <AnimatePresence mode="wait">
            {confirmReset ? (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Reset look?</span>
                <button data-testid="button-confirm-reset" onClick={handleReset} className="flex items-center gap-1 bg-destructive text-destructive-foreground rounded-xl h-8 px-3 text-xs font-bold">
                  <Check className="w-3.5 h-3.5" /> Yes
                </button>
                <button data-testid="button-cancel-reset" onClick={() => setConfirmReset(false)} className="flex items-center gap-1 bg-muted text-muted-foreground rounded-xl h-8 px-3 text-xs font-bold hover:bg-muted/80">
                  <X className="w-3.5 h-3.5" /> No
                </button>
              </motion.div>
            ) : (
              <motion.div key="actions" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-2">
                <button data-testid="button-undo-avatar" onClick={() => setConfirmReset(true)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground rounded-xl h-8 px-3 text-xs font-bold border border-border/60 hover:bg-muted/60 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Undo
                </button>
                <Button size="sm" data-testid="button-save-avatar" onClick={() => mutation.mutate(config)} disabled={mutation.isPending} className="rounded-xl font-bold h-8 px-3 text-xs">
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Character preview ── */}
      <div className="flex-none relative flex items-end justify-center bg-gradient-to-b from-primary/8 via-background/50 to-background overflow-hidden" style={{ height: "38vh" }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-primary/10 rounded-full blur-3xl" />
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedId}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            src={selectedOutfit.image}
            alt={selectedOutfit.label}
            draggable={false}
            className="relative z-10 h-full w-auto object-contain object-bottom select-none pointer-events-none drop-shadow-2xl"
          />
        </AnimatePresence>
      </div>

      {/* ── Panel with tabs ── */}
      <div className="flex-1 min-h-0 flex flex-col bg-card rounded-t-[2rem] shadow-2xl border-t border-border/60 overflow-hidden">

        {/* Tab switcher */}
        <div className="flex-none px-4 pt-4 pb-0">
          <div className="flex gap-2 bg-muted/60 rounded-2xl p-1">
            <button
              data-testid="tab-outfits"
              onClick={() => setPanelTab("outfits")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all",
                panelTab === "outfits" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Shirt className="w-4 h-4" /> Outfits
            </button>
            <button
              data-testid="tab-stats"
              onClick={() => setPanelTab("stats")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all",
                panelTab === "stats" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BarChart2 className="w-4 h-4" /> My Stats
            </button>
          </div>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <AnimatePresence mode="wait">
            {panelTab === "outfits" ? (
              <motion.div key="outfits" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-sm text-foreground uppercase tracking-widest">Choose Your Penguin</h2>
                  <p className="text-xs text-muted-foreground font-medium">More coming soon!</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PENGUIN_OUTFITS.map((outfit, i) => {
                    const isSelected = selectedId === outfit.id;
                    return (
                      <motion.button
                        key={outfit.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        data-testid={`outfit-${outfit.id}`}
                        disabled={outfit.comingSoon}
                        onClick={() => !outfit.comingSoon && setConfig({ outfit: outfit.id })}
                        className={cn(
                          "relative aspect-square rounded-2xl border-2 overflow-hidden transition-all flex flex-col",
                          outfit.comingSoon
                            ? "border-border/40 bg-muted/20 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                            : "border-border/60 hover:border-primary/40 bg-muted/30 active:scale-[0.97]",
                        )}
                      >
                        <div className="flex-1 flex items-end justify-center px-2 pt-2 overflow-hidden">
                          <img
                            src={outfit.image}
                            alt={outfit.label}
                            className={cn("h-full w-auto object-contain object-bottom select-none pointer-events-none", outfit.comingSoon && "grayscale opacity-50")}
                          />
                        </div>
                        <div className={cn("flex-none py-1.5 px-2 text-center", isSelected ? "bg-primary/10" : "bg-background/60 backdrop-blur-sm")}>
                          <p className={cn("text-[10px] font-black truncate", isSelected ? "text-primary" : "text-foreground/70")}>{outfit.label}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        {outfit.comingSoon && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-background/80 backdrop-blur-sm rounded-xl px-2 py-1 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wide">Soon</span>
                            </div>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="pt-4 space-y-4">

                {/* Upcoming & shared */}
                <section>
                  <h2 className="font-display text-base font-bold mb-2">Upcoming &amp; shared</h2>
                  <div className="space-y-2">
                    {bucketed.upcoming.slice(0, 3).map((chore) => (
                      <ChoreCard
                        key={chore.id}
                        chore={chore}
                        onComplete={() => undefined}
                        isCompleting={false}
                        stateLabel="Coming up"
                        footerNote="Keep the momentum going before it becomes urgent."
                      />
                    ))}
                    {bucketed.upcoming.length === 0 && (
                      <div className="rounded-2xl bg-muted/40 px-4 py-3">
                        <p className="text-sm text-muted-foreground">Nothing upcoming right now.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Recently finished */}
                <section>
                  <h2 className="font-display text-base font-bold mb-2">Recently finished</h2>
                  <div className="space-y-2">
                    {bucketed.recent.slice(0, 3).map((chore) => (
                      <ChoreCard
                        key={chore.id}
                        chore={chore}
                        onComplete={() => undefined}
                        isCompleting={false}
                        completed
                        stateLabel="Recently done"
                        footerNote={`Last wrapped up ${format(new Date(chore.lastCompletedAt || Date.now()), "EEE HH:mm")}.`}
                      />
                    ))}
                    {bucketed.recent.length === 0 && (
                      <div className="rounded-2xl bg-muted/40 px-4 py-3">
                        <p className="text-sm text-muted-foreground">Fresh wins will show up here.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Family activity */}
                <section>
                  <h2 className="font-display text-base font-bold mb-2">Fresh family activity</h2>
                  <div className="space-y-2">
                    {activity.length > 0 ? activity.slice(0, 5).map((event) => (
                      <div key={event.id} className="rounded-2xl bg-muted/50 px-3 py-3">
                        <p className="font-bold text-sm">{event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{event.body}</p>
                      </div>
                    )) : (
                      <div className="rounded-2xl bg-muted/40 px-4 py-3">
                        <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Badges */}
                <section>
                  <h2 className="font-display text-base font-bold mb-2">Your latest badges</h2>
                  <div className="space-y-2">
                    {myAchievements.length > 0 ? myAchievements.map((a) => (
                      <div key={a.id} className="rounded-2xl bg-primary/8 px-3 py-3">
                        <p className="font-bold text-sm">{a.emoji} {a.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                      </div>
                    )) : (
                      <div className="rounded-2xl bg-muted/40 px-4 py-3">
                        <p className="text-sm text-muted-foreground">Your first badge unlocks after your first completed chore.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Monthly spotlight */}
                <section>
                  <h2 className="font-display text-base font-bold mb-2">Monthly spotlight</h2>
                  {latestWinner ? (
                    <div className="rounded-2xl bg-gradient-to-br from-accent/15 to-primary/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">{latestWinner.monthKey}</p>
                      <p className="font-display text-xl font-bold mt-1">{latestWinner.title}</p>
                      <p className="text-sm text-muted-foreground mt-2">{latestWinner.summary}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-muted/40 px-4 py-3">
                      <p className="text-sm text-muted-foreground">Monthly winners appear once your family has a full month of history.</p>
                    </div>
                  )}
                </section>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
