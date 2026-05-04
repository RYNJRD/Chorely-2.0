import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Sparkles } from "lucide-react";
import { format, startOfWeek, isAfter } from "date-fns";
import { useFamilyActivity } from "../hooks/use-families";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import type { ActivityEvent } from "../../../shared/schema";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { family, currentUser } = useStore();
  const { data: activity = [] } = useFamilyActivity(family?.id);

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);

  // Filter to only chore completion events this week
  const choreCompletions = useMemo(() => {
    return (activity as ActivityEvent[])
      .filter(
        (e) =>
          (e.type === "chore_completed" || e.type === "chore_approved") &&
          isAfter(new Date(e.createdAt), weekStart)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);
  }, [activity, weekStart]);

  // Count unseen (simple: any from this week)
  const count = choreCompletions.length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 active:scale-95 shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg"
            style={{ boxShadow: '0 0 12px rgba(var(--glow-primary), 0.5)' }}
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[80]"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="absolute right-0 top-12 w-[300px] max-h-[380px] z-[81] rounded-[1.5rem] overflow-hidden flex flex-col"
              style={{
                background: 'rgba(18, 18, 36, 0.92)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(var(--glow-primary), 0.1)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(var(--glow-primary), 0.5))' }} />
                  <h3 className="font-display text-sm font-bold text-white">This Week's Wins</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {choreCompletions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="text-4xl mb-3">🧹</div>
                    <p className="font-display text-sm font-bold text-white/80 mb-1">No chores completed yet</p>
                    <p className="text-xs text-white/40 leading-relaxed">
                      This week is just getting started! Complete a chore to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {choreCompletions.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: event.type === "chore_approved"
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(var(--glow-primary), 0.1)',
                            border: `1px solid ${event.type === "chore_approved"
                              ? 'rgba(34, 197, 94, 0.25)'
                              : 'rgba(var(--glow-primary), 0.2)'}`,
                          }}
                        >
                          <span className="text-sm">
                            {event.type === "chore_approved" ? "✅" : "⭐"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white/90 leading-snug truncate">{event.title}</p>
                          <p className="text-[11px] text-white/40 leading-snug mt-0.5 truncate">{event.body}</p>
                          <p className="text-[10px] text-white/25 mt-1 font-medium">
                            {format(new Date(event.createdAt), "EEE h:mm a")}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                  Resets every Monday
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
