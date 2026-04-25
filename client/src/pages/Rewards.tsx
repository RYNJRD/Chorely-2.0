import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Lock, Minus, Plus, ShieldCheck, Star } from "lucide-react";
import { useParams } from "wouter";
import confetti from "canvas-confetti";
import { api, buildUrl } from "../../../shared/routes";
import { queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useRewards } from "../hooks/use-rewards";
import { useStore } from "../store/useStore";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const EMOJI_MAP: Record<string, string> = {
  robux: "🎮",
  movie: "🎬",
  bedtime: "🌙",
  pizza: "🍕",
  game: "🕹️",
  ice: "🍦",
  trip: "🚗",
};

function getRewardEmoji(title: string, fallback?: string | null) {
  if (fallback) return fallback;
  const match = Object.entries(EMOJI_MAP).find(([key]) => title.toLowerCase().includes(key));
  return match?.[1] ?? "🎁";
}

export default function Rewards() {
  const { familyId } = useParams();
  const id = Number(familyId || 0);
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useStore();
  const { data: rewards = [], isLoading } = useRewards(id);
  const [activeRewardId, setActiveRewardId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser || isLoading) return null;

  const handleClaim = async (rewardId: number) => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch(buildUrl(api.rewards.claim.path, { id: rewardId }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not claim reward");

      setCurrentUser(data.user);
      queryClient.invalidateQueries({ queryKey: [api.families.getActivity.path, id] });

      if (data.claim?.status === "submitted") {
        toast({
          title: "Request sent",
          description: "A parent or admin will review your reward request.",
        });
      } else {
        confetti({
          particleCount: 180,
          spread: 120,
          origin: { y: 0.5 },
          colors: ["#FFD700", "#FDB931", "#FF8C00"],
        });
        toast({
          title: "Reward claimed",
          description: "Enjoy it. You earned it.",
        });
      }

      setActiveRewardId(null);
      setQuantity(1);
    } catch (error) {
      toast({
        title: "Could not claim reward",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-8 px-5 pb-32 min-h-screen bg-tab-rewards">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-3 -rotate-6"
            style={{ background: 'rgba(var(--glow-secondary), 0.15)', border: '1px solid rgba(var(--glow-secondary), 0.2)' }}>
            <Gift className="w-7 h-7 text-cyan-400" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.5))' }} />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Rewards</h1>
          <p className="text-sm text-white/40 mt-1">Turn your stars into something fun.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white/40 mb-1">Your balance</p>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl glass"
            style={{ boxShadow: '0 0 12px rgba(var(--glow-accent), 0.15)' }}>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.5))' }} />
            <span className="font-display font-bold text-xl text-white">{currentUser.points}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rewards.map((reward, index) => {
          const isActive = activeRewardId === reward.id;
          const totalCost = reward.costPoints * (isActive ? quantity : 1);
          const canAfford = currentUser.points >= totalCost;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={cn(
                "rounded-[1.75rem] p-4 transition-all duration-300",
                !canAfford && !reward.requiresApproval && "opacity-60",
              )}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${canAfford ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)'}`,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-[1.5rem] flex items-center justify-center text-3xl shrink-0"
                  style={{ background: 'rgba(var(--glow-primary), 0.08)' }}>
                  {getRewardEmoji(reward.title, reward.emoji)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-bold leading-tight text-white">{reward.title}</h2>
                      {reward.description ? <p className="text-sm text-white/40 mt-1">{reward.description}</p> : null}
                    </div>
                    {!canAfford && !reward.requiresApproval && <Lock className="w-5 h-5 text-white/20 shrink-0" />}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
                      style={{ background: 'rgba(var(--glow-accent), 0.1)', color: 'rgb(250, 204, 21)' }}>
                      <Star className="w-3 h-3 fill-amber-400" />
                      {reward.costPoints} each
                    </span>
                    {reward.requiresApproval && (
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
                        style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'rgb(251, 191, 36)' }}>
                        <ShieldCheck className="w-3 h-3" />
                        Needs approval
                      </span>
                    )}
                  </div>

                  {isActive ? (
                    <div className="mt-4 rounded-2xl p-3 glass">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button className="h-9 w-9 rounded-xl btn-glass flex items-center justify-center" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                            <Minus size={16} className="text-white/70" />
                          </button>
                          <span className="min-w-8 text-center font-bold text-lg text-white">{quantity}</span>
                          <button className="h-9 w-9 rounded-xl btn-glass flex items-center justify-center" onClick={() => setQuantity((value) => value + 1)}>
                            <Plus size={16} className="text-white/70" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Total</p>
                          <p className="font-display text-lg font-bold text-white">{totalCost} stars</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button 
                          className="flex-1 min-h-[48px] rounded-2xl font-bold text-white btn-neon-primary disabled:opacity-50" 
                          disabled={!canAfford && !reward.requiresApproval || isSubmitting} 
                          onClick={() => handleClaim(reward.id)}
                        >
                          {reward.requiresApproval ? "Request reward" : "Claim reward"}
                        </button>
                        <button className="rounded-2xl px-4 btn-glass font-bold text-white/60" onClick={() => { setActiveRewardId(null); setQuantity(1); }}>
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-white/30 mt-2">
                        {reward.requiresApproval
                          ? "Stars are deducted only if this request gets approved."
                          : `You will have ${Math.max(0, currentUser.points - totalCost)} stars left after claiming.`}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveRewardId(reward.id); setQuantity(1); }}
                      disabled={!canAfford && !reward.requiresApproval}
                      className={cn(
                        "mt-4 rounded-full font-bold py-3 px-6 mx-auto block transition-all duration-300 active:scale-95 text-sm",
                        !canAfford && !reward.requiresApproval && "opacity-50 cursor-not-allowed",
                      )}
                      style={{
                        background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(280, 75%, 60%))',
                        boxShadow: '0 0 16px rgba(var(--glow-primary), 0.3)',
                        color: 'white',
                      }}
                    >
                      {reward.requiresApproval ? "Request this reward" : `Claim for ${reward.costPoints} ⭐`}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
