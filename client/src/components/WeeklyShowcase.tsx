import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Trophy, Star, Zap, Flame, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiFetch";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";

interface WeeklyShowcaseProps {
  open: boolean;
  onClose: () => void;
}

export function WeeklyShowcase({ open, onClose }: WeeklyShowcaseProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { family } = useStore();

  const { data: report } = useQuery({
    queryKey: ["weekly-showcase", family?.id],
    queryFn: async () => {
      if (!family) return null;
      const res = await apiFetch(`/api/families/${family.id}/weekly-showcase`);
      return res.json();
    },
    enabled: open && !!family,
  });

  useEffect(() => {
    if (open) setCurrentSlide(0);
  }, [open]);

  useEffect(() => {
    if (open && currentSlide === 4) {
      // Trigger confetti on the Star Champion page
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#d946ef', '#f59e0b', '#3b82f6']
      });
    }
  }, [open, currentSlide]);

  if (!open || !report) return null;

  const slides = [
    // Intro
    <div key="intro" className="flex flex-col items-center justify-center h-full text-center px-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
        <Trophy className="w-24 h-24 text-primary mb-6" />
      </motion.div>
      <h2 className="text-4xl font-display font-bold text-white mb-4">Your Family's Weekly Chore Report 🎉</h2>
      <p className="text-lg text-white/80">Let's see how you did!</p>
    </div>,

    // Total Chores
    <div key="chores" className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem]">
      <h3 className="text-2xl font-bold text-white/80 mb-2 uppercase tracking-widest">Total Chores</h3>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl font-black text-white mb-6 drop-shadow-lg">
        {report.totalChores}
      </motion.div>
      <p className="text-xl text-white font-medium">completed this week! 💪</p>
    </div>,

    // Total Stars
    <div key="stars" className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-[2.5rem]">
      <Star className="w-16 h-16 text-white mb-4 animate-pulse" fill="currentColor" />
      <h3 className="text-2xl font-bold text-white/90 mb-2 uppercase tracking-widest">Stars Earned</h3>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-7xl font-black text-white mb-6 drop-shadow-md">
        {report.totalStars}
      </motion.div>
      <p className="text-lg text-white/90 font-medium">Amazing teamwork! ⭐</p>
    </div>,

    // Most Active
    <div key="active" className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-[2.5rem]">
      <Zap className="w-16 h-16 text-white mb-4" fill="currentColor" />
      <h3 className="text-xl font-bold text-white/80 mb-6 uppercase tracking-widest">Most Active</h3>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-black text-white mb-6">
        {report.mostActiveChild}
      </motion.div>
      <p className="text-lg text-white font-medium">Kept the momentum going! 🏃‍♂️</p>
    </div>,

    // Star Champion
    <div key="champion" className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2.5rem] relative overflow-hidden">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_50%)]"
      />
      <Award className="w-20 h-20 text-yellow-300 mb-6 drop-shadow-lg" fill="currentColor" />
      <h3 className="text-2xl font-bold text-white/90 mb-2 uppercase tracking-widest">Star Champion</h3>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-7xl font-black text-white mb-6 drop-shadow-2xl">
        {report.starChampion}
      </motion.div>
      <p className="text-xl text-white font-medium">Raked in the most stars! 🌟</p>
    </div>,

    // Fun Stat
    <div key="fun" className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-[2.5rem]">
      <h3 className="text-xl font-bold text-white/80 mb-6 uppercase tracking-widest">Fun Fact</h3>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-bold text-white mb-6 leading-tight">
        {report.funStat}
      </motion.div>
    </div>,

    // Streak
    <div key="streak" className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-br from-red-500 to-rose-500 rounded-[2.5rem]">
      <Flame className="w-20 h-20 text-yellow-300 mb-6 animate-bounce" fill="currentColor" />
      <h3 className="text-xl font-bold text-white/80 mb-6 uppercase tracking-widest">Consistency</h3>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-black text-white mb-6 leading-tight">
        {report.streakStat}
      </motion.div>
    </div>,

    // Outro
    <div key="outro" className="flex flex-col items-center justify-center h-full text-center px-6">
      <h2 className="text-4xl font-display font-bold text-white mb-6">See you next week! 👋</h2>
      <button 
        onClick={onClose}
        className="px-8 py-4 bg-white text-primary rounded-full font-bold text-lg shadow-xl active:scale-95 transition-transform"
      >
        Close Showcase
      </button>
    </div>
  ];

  const nextSlide = () => setCurrentSlide(s => Math.min(slides.length - 1, s + 1));
  const prevSlide = () => setCurrentSlide(s => Math.max(0, s - 1));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-xl flex flex-col"
        >
          {/* Progress Bar */}
          <div className="pt-[max(1rem,env(safe-area-inset-top))] px-4 flex gap-1 z-10">
            {slides.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ width: i <= currentSlide ? "100%" : "0%" }}
                  className="h-full bg-white"
                />
              </div>
            ))}
            <button onClick={onClose} className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white">
              <X size={14} />
            </button>
          </div>

          {/* Slide Content */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm h-[70vh] max-h-[700px] relative"
              >
                {slides[currentSlide]}
              </motion.div>
            </AnimatePresence>
            
            {/* Invisible Tap Zones for Navigation */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={prevSlide} />
            <div className="absolute inset-y-0 right-0 w-2/3 z-20" onClick={nextSlide} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
