import { motion } from "framer-motion";
import { Users, UserPlus, Sparkles, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useStore } from "@/store/useStore";
import { useDemoSetup } from "@/hooks/use-families";
import { ChorlyMascot } from "@/components/ChorlyMascot";

export default function GetStarted() {
  const [, setLocation] = useLocation();
  const { setOnboardingIntent, setFamily, setCurrentUser } = useStore();
  const demoMutation = useDemoSetup();

  const handleCreate = () => {
    setOnboardingIntent("create");
    setLocation("/auth");
  };

  const handleJoin = () => {
    setOnboardingIntent("join");
    setLocation("/auth");
  };

  const handleDemo = async () => {
    try {
      const demo = await demoMutation.mutateAsync();
      setFamily(demo.family);
      setCurrentUser(demo.user);
      setLocation(`/family/${demo.family.id}/dashboard`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-onboarding">
      <div className="blob-primary absolute w-80 h-80 top-[-12%] left-[-14%]" />
      <div className="blob-accent absolute w-72 h-72 bottom-[-10%] right-[-12%]" />

      <button
        data-testid="button-back-get-started"
        onClick={() => setLocation("/")}
        className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white active:scale-90 transition-all shadow-sm z-20 border border-border/50"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="mb-4 relative"
        >
          <ChorlyMascot pose="point" size={130} bounce={true} />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
            className="absolute -top-2 -right-1 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
          >
            Pick one! 👇
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-1"
        >
          <h1 className="font-display text-4xl font-bold">
            <span style={{ color: "hsl(262 83% 58%)" }} className="logo-glow">Chore</span>
            <span style={{ color: "hsl(43 96% 50%)" }} className="logo-accent-glow">Quest</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground font-semibold mb-8 text-sm max-w-[260px]"
        >
          Turn boring chores into an epic family adventure!
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="w-full space-y-3"
        >
          <button
            data-testid="button-create-family"
            onClick={handleCreate}
            className="w-full py-4 rounded-2xl font-display font-bold text-lg text-primary-foreground flex items-center justify-center gap-3 group btn-glow-primary shimmer"
            style={{ background: "linear-gradient(135deg, hsl(262 83% 60%) 0%, hsl(280 75% 62%) 100%)" }}
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Create New Family
          </button>

          <button
            data-testid="button-join-family"
            onClick={handleJoin}
            className="w-full py-4 rounded-2xl bg-white font-display font-bold text-lg text-foreground flex items-center justify-center gap-3 group btn-glow-white border-2 border-border/60"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform text-primary" />
            Join Existing Family
          </button>

          <div className="flex items-center gap-4 py-1.5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            data-testid="button-demo"
            onClick={handleDemo}
            disabled={demoMutation.isPending}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-2 border-accent/30"
            style={{ background: "hsl(43 96% 56% / 0.12)", color: "hsl(43 70% 30%)" }}
          >
            {demoMutation.isPending ? "Setting up..." : (
              <><Sparkles className="w-4 h-4" /> Try Demo Family</>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
