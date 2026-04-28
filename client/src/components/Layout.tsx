import { useFamilyLive } from "../hooks/use-family-live";
import { NavigationDrawer } from "./NavigationDrawer";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "../store/useStore";
import { BottomNav } from "./BottomNav";
import { cn } from "../lib/utils";
import { WeeklyShowcase } from "./WeeklyShowcase";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { family, isDrawerOpen, setIsDrawerOpen, isNavHidden } = useStore();
  const onboardingPaths = ["/", "/get-started", "/auth", "/verify-email", "/email-action", "/join-family", "/setup-family", "/home"];
  const isOnboarding = onboardingPaths.includes(location) || location.startsWith("/join/");
  useFamilyLive(family?.id);

  const showNav = !isOnboarding && !isNavHidden;
  const isDev = import.meta.env.DEV;
  const [showShowcase, setShowShowcase] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(isDev);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 font-sans text-foreground selection:bg-primary/20">
      <div 
        className="w-full h-[100dvh] sm:w-[390px] sm:h-[844px] overflow-hidden relative bg-animated sm:rounded-[2.5rem] sm:border sm:border-white/10 shadow-2xl shadow-purple-900/30 flex flex-col isolate transform-gpu"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }} // Forces hardware-accelerated clipping on rounded borders
      >
        <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        {/* Global Announcement Banner */}
        <AnimatePresence>
          {bannerVisible && !isOnboarding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="relative z-40 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center justify-between shadow-lg"
            >
              <div 
                className="flex-1 flex items-center gap-3 cursor-pointer"
                onClick={() => setShowShowcase(true)}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <span className="text-lg">🎉</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Your Weekly Showcase is here!</p>
                  <p className="text-xs text-white/80">Tap to see your family's stats.</p>
                </div>
              </div>
              <button 
                onClick={() => setBannerVisible(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/80 transition-colors ml-2"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <WeeklyShowcase open={showShowcase} onClose={() => setShowShowcase(false)} />

        <div className="flex-1 min-h-0 relative flex flex-col rounded-[inherit]">
          <main className={cn(
            "flex-1 relative no-scrollbar rounded-[inherit]",
            (location.includes("/profile") || location.includes("/me") || location.includes("/chat")) ? "overflow-hidden touch-none" : "overflow-y-auto pb-28 mask-bottom-fade",
            isOnboarding && "flex flex-col overflow-hidden touch-none h-full !pb-0"
          )}>
            {children}
          </main>
        </div>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
