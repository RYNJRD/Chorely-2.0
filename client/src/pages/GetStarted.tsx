import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Sparkles, ChevronLeft, Crown, Star, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useStore } from "../store/useStore";
import { PenguinMascot } from "../components/PenguinMascot";

export default function GetStarted() {
  const [, setLocation] = useLocation();
  const { setOnboardingIntent } = useStore();

  const handleCreate = () => {
    setOnboardingIntent("create");
    setLocation("/auth");
  };

  const handleJoin = () => {
    setOnboardingIntent("join");
    setLocation("/auth");
  };



  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-onboarding overflow-hidden touch-none relative">
      <div className="blob-primary absolute w-80 h-80 top-[-12%] left-[-14%] pointer-events-none" />
      <div className="blob-accent absolute w-72 h-72 bottom-[-10%] right-[-12%] pointer-events-none" />



      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <AnimatePresence mode="wait">
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="mb-4 relative"
              >
                <PenguinMascot mood="waving" size={130} />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                  className="absolute -top-2 -right-1 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
                >
                  Pick one! 👇
                </motion.div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="mb-1">
                <h1 className="font-display text-4xl font-bold text-primary logo-glow">
                  Taskling
                </h1>
              </motion.div>

              <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 font-semibold mb-8 text-sm max-w-[260px]">
                Make chores fun — reward your whole family! ⭐
              </motion.p>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.28 }} className="w-full space-y-3">
                <button
                  data-testid="button-create-family"
                  onClick={handleCreate}
                  className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white flex items-center justify-center gap-3 group btn-neon-primary shimmer"
                >
                  <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Create New Family
                </button>

                <button
                  data-testid="button-join-family"
                  onClick={handleJoin}
                  className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white flex items-center justify-center gap-3 group btn-glass"
                >
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(var(--glow-primary), 0.4))' }} />
                  Join Existing Family
                </button>

              </motion.div>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
