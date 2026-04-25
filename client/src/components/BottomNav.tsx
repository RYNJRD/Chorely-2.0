import { Link, useLocation } from "wouter";
import { Home, Trophy, Gift, Crown, MessageSquare, User } from "lucide-react";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();
  const { family, currentUser } = useStore();

  if (!family || !currentUser) return null;

  const navItems = [
    { href: `/family/${family.id}/dashboard`, icon: Home, label: "Home" },
    { href: `/family/${family.id}/leaderboard`, icon: Trophy, label: "Rank" },
    { href: `/family/${family.id}/chat`, icon: MessageSquare, label: "Chat" },
    { href: `/family/${family.id}/rewards`, icon: Gift, label: "Rewards" },
    { href: `/family/${family.id}/profile`, icon: User, label: "Me" },
  ];

  if (currentUser.role === "admin") {
    navItems.push({ href: `/family/${family.id}/admin`, icon: Crown, label: "Parent" });
  }

  return (
    <div
      className="absolute bottom-0 w-full z-50"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
    >
      <div className="mx-4 mb-2">
        <div className="max-w-md mx-auto rounded-[2rem] px-2 py-1.5"
          style={{
            background: 'rgba(15, 15, 25, 0.7)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex items-center">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex-1 min-w-0 flex flex-col items-center py-1.5 gap-0.5"
                >
                  <div className="relative flex items-center justify-center w-11 h-9 rounded-2xl">
                    {/* Active glow pill */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: item.label === "Parent" 
                            ? 'rgba(245, 158, 11, 0.15)' 
                            : 'rgba(139, 92, 246, 0.15)',
                          boxShadow: item.label === "Parent"
                            ? '0 0 12px rgba(245, 158, 11, 0.3)'
                            : '0 0 12px rgba(139, 92, 246, 0.3)',
                        }}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    {/* Icon */}
                    <motion.div
                      animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative z-10 transition-all duration-300"
                      style={isActive ? {
                        filter: item.label === "Parent"
                          ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))'
                          : 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))',
                      } : undefined}
                    >
                      <Icon
                        size={isActive ? 21 : 20}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={cn(
                          "transition-colors duration-300",
                          isActive
                            ? item.label === "Parent" ? "text-amber-400" : "text-primary"
                            : "text-white/40",
                          item.label === "Parent" && !isActive && "text-amber-400/40",
                        )}
                      />
                    </motion.div>
                  </div>

                  <motion.span
                    animate={isActive ? { opacity: 1 } : { opacity: 0.45 }}
                    className={cn(
                      "text-[9px] font-bold tracking-wide uppercase truncate max-w-full px-0.5 leading-none transition-colors duration-300",
                      isActive
                        ? item.label === "Parent" ? "text-amber-400" : "text-primary"
                        : "text-white/35",
                      item.label === "Parent" && !isActive && "text-amber-400/35",
                    )}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
