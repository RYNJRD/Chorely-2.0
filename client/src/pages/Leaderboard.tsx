import { useParams } from "wouter";
import { useFamilyLeaderboard } from "../hooks/use-families";
import { useStore } from "../store/useStore";
import { Trophy, Star, MessageCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { UserAvatar } from "../components/UserAvatar";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { useState } from "react";
import type { User } from "../../../shared/schema";

const RANK_META = [
  { emoji: "🥇", label: "1st", gradient: "from-yellow-400 to-amber-500", glow: "shadow-amber-300/50", size: "scale-110", border: "border-amber-300" },
  { emoji: "🥈", label: "2nd", gradient: "from-slate-300 to-slate-400", glow: "shadow-slate-200/50", size: "scale-100", border: "border-slate-300" },
  { emoji: "🥉", label: "3rd", gradient: "from-amber-600 to-orange-600", glow: "shadow-orange-300/50", size: "scale-100", border: "border-orange-400" },
];

export default function Leaderboard() {
  const { familyId } = useParams();
  const id = Number(familyId || "0");
  const { data: leaderboard, isLoading, error } = useFamilyLeaderboard(id);
  const { currentUser } = useStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (error) {
    return (
      <div className="min-h-screen bg-tab-leaderboard flex items-center justify-center p-6 text-center">
        <div className="p-6 bg-red-100 text-red-900 rounded-3xl border-2 border-red-200">
          <p className="font-bold">Error loading leaderboard</p>
          <p className="text-xs mt-1">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !leaderboard || !currentUser) {
    return (
      <div className="min-h-screen bg-tab-leaderboard flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
          <Trophy className="w-8 h-8 text-primary" strokeWidth={3} />
        </div>
        <p className="text-lg font-bold text-primary animate-pulse">Ranking the family...</p>
      </div>
    );
  }

  const visibleUsers = (leaderboard || [])
    .filter((u) => !u.hideFromLeaderboard)
    .sort((a, b) => b.points - a.points);
  
  const maxPoints = Math.max(...visibleUsers.map((u) => u.points), 1);

  return (
    <div className="flex flex-col min-h-full bg-tab-leaderboard">
      {/* ── Fixed Header ── */}
      <div className="px-5 pt-10 pb-6 text-center">
        <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {visibleUsers.length === 0 ? "No one's ranked yet!" : `${visibleUsers.length} active members`}
        </p>
      </div>

      {/* ── Scrollable List ── */}
      <div className="flex-1 px-5 space-y-3 pb-32">
        {visibleUsers.length === 0 && (
           <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <div className="text-4xl mb-2">🏆</div>
             <p className="text-slate-500 font-bold">Complete chores to start ranking!</p>
           </div>
        )}

        {visibleUsers.map((user, index) => {
          const isMe = user.id === currentUser.id;
          
          return (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-4 border-2 transition-colors cursor-pointer",
                isMe ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm",
                index === 0 && "border-amber-400 bg-amber-50/50 dark:bg-amber-950/10"
              )}
            >
              <div className="w-8 text-center font-display font-black text-lg text-slate-400">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
              </div>
              <UserAvatar user={user} size="sm" className="border-2 border-background" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {user.username} {isMe && <span className="text-primary font-black">(ME)</span>}
                </p>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                   <div 
                     className={cn(
                       "h-full rounded-full transition-all duration-1000",
                       index === 0 ? "bg-amber-400" : "bg-primary"
                     )}
                     style={{ width: `${(user.points / maxPoints) * 100}%` }}
                   />
                </div>
              </div>
              <div className="flex items-center gap-1 font-black text-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-slate-700 dark:text-slate-300">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {user.points}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-xs rounded-[2.5rem] p-6 border-2 border-slate-300 dark:border-slate-700 text-center gap-0 shadow-xl overflow-hidden">
          {selectedUser && (
            <>
              <div className="mx-auto mb-4 border-4 border-primary/20 p-1 rounded-full">
                <UserAvatar user={selectedUser} size="lg" />
              </div>
              <h2 className="font-display text-2xl font-bold">{selectedUser.username}</h2>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1 mb-5">
                {selectedUser.role === 'admin' ? 'Parent' : 'Child'} • Rank #{visibleUsers.findIndex(u => u.id === selectedUser.id) + 1}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl py-3 px-2 flex flex-col items-center">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400 mb-1" />
                  <span className="font-bold text-lg leading-none">{selectedUser.points}</span>
                  <span className="text-[10px] text-amber-900/60 font-bold uppercase mt-1">Stars</span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-2xl py-3 px-2 flex flex-col items-center">
                  <div className="text-lg leading-none mb-1 mt-0.5">🔥</div>
                  <span className="font-bold text-lg leading-none">{selectedUser.streak}</span>
                  <span className="text-[10px] text-orange-900/60 font-bold uppercase mt-1">Streak</span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-2xl"
              >
                Close
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
