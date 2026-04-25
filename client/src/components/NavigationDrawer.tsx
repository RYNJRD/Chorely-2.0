import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  X, Settings, Home, Trophy, Star, MessageCircle, 
  LogOut, Shield, Moon, Sun, User, LayoutDashboard
} from "lucide-react";
import { useStore } from "../store/useStore";
import { auth } from "../lib/firebase";
import { useSettings } from "../hooks/use-settings";
import { cn } from "../lib/utils";
import { UserAvatar } from "./UserAvatar";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const [, setLocation] = useLocation();
  const { currentUser, family, logout } = useStore();
  const { settings, updateSetting } = useSettings();
  const firebaseUser = auth.currentUser;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: `/family/${family?.id}/dashboard` },
    { label: "Leaderboard", icon: Trophy, path: `/family/${family?.id}/leaderboard` },
    { label: "Rewards", icon: Star, path: `/family/${family?.id}/rewards` },
    { label: "Chat", icon: MessageCircle, path: `/family/${family?.id}/chat` },
    ...(currentUser?.role === "admin" ? [
      { label: "Admin Panel", icon: Shield, path: `/family/${family?.id}/admin` }
    ] : []),
    { label: "Settings", icon: Settings, path: `/family/${family?.id}/settings` },
  ];

  const handleNavigate = (path: string) => {
    setLocation(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    setLocation("/auth");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100]"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-[280px] z-[101] flex flex-col"
            style={{
              background: 'rgba(18, 18, 32, 0.85)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="font-display text-xl font-bold text-gradient-brand">
                Taskling
              </h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl btn-glass active:scale-95"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-white/5 transition-all duration-300 group text-left active:scale-[0.97]"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <item.icon className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="font-bold text-sm text-white/70 group-hover:text-white transition-colors duration-300">
                    {item.label}
                  </span>
                </button>
              ))}

              {/* Dark Mode Toggle */}
              <div className="mt-4 px-4 py-4 rounded-[1.5rem] glass">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {settings.darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">Appearance</span>
                  </div>
                  <button
                    onClick={() => updateSetting("darkMode", !settings.darkMode)}
                    className="relative w-11 h-6 rounded-full transition-colors duration-300"
                    style={{ background: settings.darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.15)' }}
                  >
                    <motion.div
                      animate={{ x: settings.darkMode ? 22 : 2 }}
                      className={cn(
                        "absolute top-1 left-0 w-4 h-4 rounded-full shadow-sm transition-colors",
                        settings.darkMode ? "bg-primary" : "bg-white/80"
                      )}
                      style={settings.darkMode ? { boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)' } : undefined}
                    />
                  </button>
                </div>
                <p className="text-[10px] font-medium text-white/30">
                  {settings.darkMode ? "Dark mode active" : "Bright mode active"}
                </p>
              </div>
            </div>

            {/* Footer / User Info */}
            <div className="p-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div className="flex items-center gap-3 mb-6">
                <UserAvatar user={currentUser} size="md" className="border border-white/10" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white/90 truncate">{currentUser?.username || "Guest"}</p>
                  <p className="text-[11px] text-white/35 truncate">{firebaseUser?.email || "No email linked"}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-[0.96]"
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  color: 'rgb(251, 113, 133)',
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
