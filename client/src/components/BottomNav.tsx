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
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)" }}
    >
      <div className="rounded-[2.5rem] px-2 py-2 dock-glass">
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
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full">
                    {/* Active circular glow pad */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pad"
                        className="absolute inset-0 m-auto w-[42px] h-[42px] rounded-full bg-primary/20"
                        style={{
                          boxShadow: item.label === "Parent"
                            ? '0 0 16px rgba(245, 158, 11, 0.4)'
                            : '0 0 16px rgba(var(--glow-primary), 0.4)',
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
                          : 'drop-shadow(0 0 6px rgba(var(--glow-primary), 0.6))',
                      } : undefined}
                    >
                      <Icon
                        size={isActive ? 22 : 22}
                        strokeWidth={isActive ? 2.5 : 2}
                        fill="currentColor"
                        fillOpacity={isActive ? 0.8 : 0.15}
                        className={cn(
                          "transition-colors duration-300",
                          isActive
                            ? item.label === "Parent" ? "text-amber-500" : "text-primary"
                            : "text-muted-foreground/70",
                          item.label === "Parent" && !isActive && "text-amber-500/40",
                        )}
                      />
                    </motion.div>
                  </div>

                  <motion.span
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.6, y: -2 }}
                    className={cn(
                      "text-[9px] font-bold tracking-wide uppercase truncate max-w-full px-0.5 leading-none transition-colors duration-300 relative z-20",
                      isActive
                        ? item.label === "Parent" ? "text-amber-500 drop-shadow-md" : "text-primary drop-shadow-md"
                        : "text-muted-foreground",
                      item.label === "Parent" && !isActive && "text-amber-500/60",
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
    );
  }
