import { useFamilyLive } from "../hooks/use-family-live";
import { NavigationDrawer } from "./NavigationDrawer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "../store/useStore";
import { BottomNav } from "./BottomNav";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { family, isDrawerOpen, setIsDrawerOpen, isNavHidden, currentUser } = useStore();
  const onboardingPaths = ["/", "/get-started", "/auth", "/verify-email", "/email-action", "/join-family", "/setup-family", "/home"];
  const isOnboarding = onboardingPaths.includes(location) || location.startsWith("/join/");

  useFamilyLive(family?.id);

  // Subscription Gate Logic
  const isPremium = family?.subscriptionStatus === "active" || family?.subscriptionStatus === "trialing";
  const isSubscriptionPage = location.includes("/subscription");
  const isInactive = family && !isPremium;

  useEffect(() => {
    // Subscription Gate Disabled for now as per user request
    /*
    if (isInactive && !isSubscriptionPage && !isOnboarding) {
      setLocation(`/family/${family.id}/subscription`);
    }
    */
  }, [isInactive, isSubscriptionPage, isOnboarding, family?.id, setLocation]);

  // Hide nav on profile page — use location-based check so there's never
  // a flash caused by async state; the nav slides out smoothly via AnimatePresence.
  const isProfilePage = location.includes("/profile");
  const showNav = !isOnboarding && !isNavHidden && !isProfilePage;

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 font-sans text-foreground selection:bg-primary/20">
      <div 
        className="w-full h-[100dvh] sm:w-[390px] sm:h-[844px] overflow-hidden relative bg-animated sm:rounded-[2.5rem] sm:border sm:border-white/10 shadow-2xl shadow-purple-900/30 flex flex-col isolate transform-gpu"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }} // Forces hardware-accelerated clipping on rounded borders
      >
        <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        <div className="flex-1 min-h-0 relative flex flex-col rounded-[inherit]">
          <main className={cn(
            "flex-1 relative no-scrollbar rounded-[inherit]",
            (location.includes("/profile") || location.includes("/me") || location.includes("/chat")) ? "overflow-hidden touch-none" : "overflow-y-auto pb-28 mask-bottom-fade",
            isOnboarding && "flex flex-col overflow-hidden touch-none h-full !pb-0"
          )}>
            {children}
          </main>
        </div>

        {/* Bottom nav slides down off-screen when on profile, up when on other pages */}
        <AnimatePresence initial={false}>
          {showNav && (
            <motion.div
              key="bottom-nav"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
              style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "auto" }}
            >
              <BottomNav />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
