import { useMemo } from "react";
import { motion } from "framer-motion";
import { Home, TrendingUp } from "lucide-react";
import { startOfWeek, isAfter } from "date-fns";
import type { Chore } from "../../../shared/schema";

interface HouseholdProgressProps {
  chores: Chore[];
  currentUserId?: number;
}

function getWeeklyCompletionRate(chores: Chore[]): number {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Only count active chores that have recurring schedules
  const actionableChores = chores.filter(
    (c) => c.isActive && (c.type === "daily" || c.type === "weekly" || c.type === "monthly" || c.type === "box")
  );

  if (actionableChores.length === 0) return 100;

  const completedThisWeek = actionableChores.filter(
    (c) => c.lastCompletedAt && isAfter(new Date(c.lastCompletedAt), weekStart)
  ).length;

  return Math.round((completedThisWeek / actionableChores.length) * 100);
}

function getProgressMessage(percent: number): string {
  if (percent >= 90) return "Household running like clockwork! 🏠✨";
  if (percent >= 75) return "Household running smoothly 🏠";
  if (percent >= 50) return "Halfway there — keep it up! 💪";
  if (percent >= 25) return "Getting started — nice work! 🌱";
  return "Let's get the house buzzing! 🐝";
}

function getProgressColor(percent: number): string {
  if (percent >= 80) return "linear-gradient(90deg, #22c55e, #4ade80)";
  if (percent >= 50) return "linear-gradient(90deg, #eab308, #facc15)";
  if (percent >= 25) return "linear-gradient(90deg, #f97316, #fb923c)";
  return "linear-gradient(90deg, #ef4444, #f87171)";
}

function getProgressGlow(percent: number): string {
  if (percent >= 80) return "rgba(34, 197, 94, 0.4)";
  if (percent >= 50) return "rgba(234, 179, 8, 0.4)";
  if (percent >= 25) return "rgba(249, 115, 22, 0.4)";
  return "rgba(239, 68, 68, 0.4)";
}

export function HouseholdProgress({ chores }: HouseholdProgressProps) {
  const percent = useMemo(() => getWeeklyCompletionRate(chores), [chores]);
  const message = useMemo(() => getProgressMessage(percent), [percent]);
  const gradientBg = useMemo(() => getProgressColor(percent), [percent]);
  const glowColor = useMemo(() => getProgressGlow(percent), [percent]);

  return (
    <div className="rounded-[1.5rem] p-4 glass-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <Home className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-white/70">{message}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-slate-400 dark:text-white/30" />
          <span className="text-xs font-black text-slate-800 dark:text-white/80">{percent}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="h-full rounded-full relative"
          style={{
            background: gradientBg,
            boxShadow: `0 0 12px ${glowColor}`,
          }}
        >
          {/* Shimmer on the bar */}
          {percent > 10 && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 animate-shimmer" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer-slide 2.5s infinite',
              }} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Weekly label */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-widest">
          All chores combined
        </p>
        <p className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-widest">
          Weekly Family Score
        </p>
      </div>
    </div>
  );
}
