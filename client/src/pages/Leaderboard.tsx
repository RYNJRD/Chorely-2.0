import { useParams } from "wouter";
import { useFamilyLeaderboard } from "@/hooks/use-families";
import { useStore } from "@/store/useStore";
import { Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";

const RANK_META = [
  { emoji: "🥇", label: "1st", gradient: "from-yellow-400 to-amber-500", glow: "shadow-amber-300/50", size: "scale-110", border: "border-amber-300" },
  { emoji: "🥈", label: "2nd", gradient: "from-slate-300 to-slate-400",  glow: "shadow-slate-200/50",  size: "scale-100", border: "border-slate-300" },
  { emoji: "🥉", label: "3rd", gradient: "from-amber-600 to-orange-600", glow: "shadow-orange-300/50", size: "scale-100", border: "border-orange-400" },
];

export default function Leaderboard() {
  const { familyId } = useParams();
  const id = parseInt(familyId || "0");
  const { data: leaderboard, isLoading } = useFamilyLeaderboard(id);
  const { currentUser } = useStore();

  if (isLoading || !leaderboard || !currentUser) return null;

  const visibleUsers = leaderboard
    .filter((u) => !u.hideFromLeaderboard)
    .sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(...visibleUsers.map((u) => u.points), 1);
  const myRank = visibleUsers.findIndex((u) => u.id === currentUser.id) + 1;

  const topThree = visibleUsers.slice(0, 3);
  const rest = visibleUsers.slice(3);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* ── Gradient header ── */}
      <div className="relative overflow-hidden pt-8 pb-6 px-5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-accent/8 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative text-center">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-br from-accent/30 to-amber-400/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-accent/20"
          >
            <Trophy className="w-8 h-8 text-accent" strokeWidth={2.5} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-3xl font-bold"
            data-testid="text-leaderboard-title"
          >
            Leaderboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mt-1"
          >
            {visibleUsers.length === 0 ? "Be the first to earn stars!" : `${visibleUsers.length} family members competing`}
          </motion.p>
        </div>
      </div>

      <div className="px-5">
        {/* ── Podium (top 3) ── */}
        {topThree.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            {topThree.map((user, index) => {
              const meta = RANK_META[index];
              const isMe = user.id === currentUser.id;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                  className={cn(
                    "flex items-center gap-4 rounded-[1.75rem] p-4 mb-3 border-2 relative overflow-hidden",
                    isMe
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card shadow-sm",
                    index === 0 && "border-amber-300/60 bg-gradient-to-r from-amber-50/80 to-card dark:from-amber-950/20",
                  )}
                >
                  {/* Subtle gradient overlay for #1 */}
                  {index === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent pointer-events-none" />
                  )}

                  {/* Rank */}
                  <div className={cn("text-2xl w-10 text-center flex-none", meta.size)}>
                    {meta.emoji}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={cn("rounded-full p-0.5 shadow-lg", meta.glow, index === 0 && "shadow-lg")}>
                      <UserAvatar user={user} size="md" />
                    </div>
                    {user.role === "admin" && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm text-[10px]">
                        👑
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={cn("font-display font-bold truncate", index === 0 ? "text-lg" : "text-base")}>
                        {user.username} {isMe && <span className="text-primary text-sm">(You)</span>}
                      </span>
                      <div className="flex items-center gap-1 bg-muted/80 rounded-xl px-2 py-1 shrink-0">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className="font-bold text-sm tabular-nums">{user.points}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(user.points / maxPoints) * 100}%` }}
                        transition={{ duration: 1.2, delay: 0.4 + index * 0.1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          index === 0 ? "from-amber-400 to-yellow-500" : "from-primary to-violet-500",
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Rest of leaderboard ── */}
        {rest.length > 0 && (
          <div className="space-y-2.5">
            {rest.map((user, index) => {
              const isMe = user.id === currentUser.id;
              const actualRank = index + 4;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.06 }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-3.5 border-2",
                    isMe
                      ? "border-primary/40 bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border/60 bg-card shadow-sm",
                  )}
                >
                  <span className="text-sm font-black text-muted-foreground w-6 text-center flex-none">
                    {actualRank}
                  </span>
                  <div className="relative flex-shrink-0">
                    <UserAvatar user={user} size="sm" />
                    {user.role === "admin" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px]">
                        👑
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-sm flex-1 truncate">
                    {user.username} {isMe && <span className="text-primary text-xs">(You)</span>}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span className="tabular-nums">{user.points}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {visibleUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="font-display text-xl font-bold mb-2">No one's ranked yet</h3>
            <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
              Complete chores to earn stars and climb to the top of the leaderboard!
            </p>
          </motion.div>
        )}

        {/* Motivational footer */}
        {visibleUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8 py-4"
          >
            <p className="text-sm text-muted-foreground">
              {currentUser.points === 0
                ? "✨ Complete your first chore to get on the board!"
                : myRank === 1
                  ? "🥇 You're leading — keep it up!"
                  : "💪 Every chore brings you closer to the top!"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
