import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useStore } from "../store/useStore";

/* ─────────────────────────────────────────────────────────
   LOADUP 2.0 — "Royal Ascension Penguin"
   Premium animated loading screen with crown reward moment
   ───────────────────────────────────────────────────────── */

// ── Colour palette ──────────────────────────────────────
const C = {
  body: "#1e2140",
  bodyDark: "#161830",
  belly: "#f0f0f5",
  beak: "#FFB300",
  feet: "#FFB300",
  eyeWhite: "#ffffff",
  pupil: "#1a1a2e",
  shine: "#ffffff",
  wing: "#181a35",
  blush: "#FFB3B3",
  // Crown colours
  crownGold: "#FFD700",
  crownDark: "#DAA520",
  crownGem: "#E84393",
  crownGemBlue: "#6C5CE7",
};

// ── Spark particle config ───────────────────────────────
function useSparkParticles(count: number) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i + Math.random() * 20 - 10,
      distance: 45 + Math.random() * 30,
      size: 2 + Math.random() * 3,
      delay: i * 0.04,
    })),
  [count]);
}

// ── SVG Crown component ─────────────────────────────────
function Crown() {
  return (
    <g>
      {/* Crown base shadow */}
      <ellipse cx="50" cy="24" rx="22" ry="3" fill="rgba(0,0,0,0.15)" />
      {/* Crown base */}
      <path
        d="M28 14 L32 24 L40 16 L50 26 L60 16 L68 24 L72 14 L74 24 L26 24 Z"
        fill={`url(#crownGradient)`}
        stroke={C.crownDark}
        strokeWidth="0.8"
      />
      {/* Crown band */}
      <rect x="28" y="22" width="44" height="5" rx="1" fill={C.crownDark} />
      <rect x="28" y="22" width="44" height="3" rx="1" fill={C.crownGold} />
      {/* Crown gems */}
      <circle cx="38" cy="18" r="2.2" fill={C.crownGem} />
      <circle cx="50" cy="12" r="2.5" fill={C.crownGemBlue} />
      <circle cx="62" cy="18" r="2.2" fill={C.crownGem} />
      {/* Crown highlights */}
      <path d="M34 18 L36 14" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M64 18 L66 14" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  );
}

// ── Penguin body (Royal edition – no scarf, clean) ──────
function RoyalPenguin() {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx="50" cy="108" rx="22" ry="4.5" fill="rgba(0,0,0,0.1)" />
      {/* Body */}
      <path
        d="M20 68 C20 42 32 20 50 20 C68 20 80 42 80 68 C80 90 68 106 50 106 C32 106 20 90 20 68Z"
        fill={C.body}
      />
      {/* Body subtle gradient highlight */}
      <path
        d="M24 38 C30 24 42 20 50 20 C58 20 64 24 68 30"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Belly */}
      <ellipse cx="50" cy="72" rx="20" ry="25" fill={C.belly} />
      {/* Head highlight */}
      <path
        d="M33 32 Q40 22 52 25"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left wing */}
      <path d="M20 66 C12 62 10 76 16 82 Q20 84 22 82 L22 62Z" fill={C.wing} />
      {/* Right wing */}
      <path d="M80 66 C88 62 90 76 84 82 Q80 84 78 82 L78 62Z" fill={C.wing} />
      {/* Feet */}
      <ellipse cx="38" cy="106" rx="9" ry="4.5" fill={C.feet} />
      <ellipse cx="62" cy="106" rx="9" ry="4.5" fill={C.feet} />
      {/* Eyes */}
      <circle cx="38" cy="52" r="8" fill={C.eyeWhite} />
      <circle cx="62" cy="52" r="8" fill={C.eyeWhite} />
      <circle cx="39" cy="53" r="5" fill={C.pupil} />
      <circle cx="63" cy="53" r="5" fill={C.pupil} />
      <circle cx="41" cy="51" r="1.8" fill={C.shine} />
      <circle cx="65" cy="51" r="1.8" fill={C.shine} />
      {/* Blush */}
      <ellipse cx="28" cy="62" rx="6" ry="3.5" fill={C.blush} opacity="0.5" />
      <ellipse cx="72" cy="62" rx="6" ry="3.5" fill={C.blush} opacity="0.5" />
      {/* Beak */}
      <path d="M45 66 Q50 73 55 66 L54 64 Q50 68 46 64 Z" fill={C.beak} />
    </g>
  );
}

// ── Main Splash ─────────────────────────────────────────
export default function Splash() {
  const [, setLocation] = useLocation();
  const { family, currentUser } = useStore();
  const [showCrown, setShowCrown] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const sparks = useSparkParticles(8);

  // Animation timeline
  useEffect(() => {
    // 1.2s: Crown starts dropping
    const t1 = setTimeout(() => setShowCrown(true), 1200);
    // 2.0s: Reward glow
    const t2 = setTimeout(() => setShowGlow(true), 2000);
    // 2.1s: Spark particles
    const t3 = setTimeout(() => setShowSparks(true), 2100);
    // 2.6s: Reset for loop
    const t4 = setTimeout(() => {
      setShowGlow(false);
      setShowSparks(false);
    }, 2700);
    // 3.0s: Reset crown for seamless loop
    const t5 = setTimeout(() => {
      setShowCrown(false);
      // After brief reset, restart
      setTimeout(() => setShowCrown(true), 300);
      setTimeout(() => setShowGlow(true), 1100);
      setTimeout(() => setShowSparks(true), 1200);
      setTimeout(() => {
        setShowGlow(false);
        setShowSparks(false);
      }, 1800);
    }, 3200);

    // Navigate after ~3.5s
    const navTimer = setTimeout(() => {
      if (family && currentUser) {
        setLocation(`/family/${family.id}/dashboard`);
      } else {
        setLocation("/get-started");
      }
    }, 3500);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(navTimer);
    };
  }, [setLocation, family, currentUser]);

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden touch-none select-none"
      style={{
        background: 'linear-gradient(180deg, hsl(230 60% 18%) 0%, hsl(230 65% 10%) 50%, hsl(230 70% 6%) 100%)',
      }}
    >
      {/* ── Ambient top glow ── */}
      <div
        className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(100, 130, 255, 0.12) 0%, rgba(80, 100, 220, 0.06) 40%, transparent 70%)',
        }}
      />

      {/* ── Subtle pulsing background glow ── */}
      <motion.div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ repeat: Infinity, duration: 3.0, ease: "easeInOut" }}
        style={{
          background: 'radial-gradient(circle, rgba(100, 140, 255, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* ── Edge vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* ── Reward burst glow ── */}
      <AnimatePresence>
        {showGlow && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.8, opacity: 0.5 }}
            exit={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute top-[28%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.35) 0%, rgba(255, 180, 0, 0.1) 40%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Spark particles ── */}
      <AnimatePresence>
        {showSparks && sparks.map((spark) => {
          const radians = (spark.angle * Math.PI) / 180;
          const x = Math.cos(radians) * spark.distance;
          const y = Math.sin(radians) * spark.distance;
          return (
            <motion.div
              key={spark.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: x,
                y: y - 80,
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: spark.delay,
                ease: "easeOut",
              }}
              className="absolute top-[38%] left-1/2 rounded-full pointer-events-none"
              style={{
                width: spark.size,
                height: spark.size,
                background: `radial-gradient(circle, rgba(255, 215, 0, 0.9), rgba(255, 180, 0, 0.5))`,
                boxShadow: `0 0 ${spark.size * 2}px rgba(255, 215, 0, 0.6)`,
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* ── Penguin + Crown Assembly ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Breathing animation wrapper */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        >
          <svg
            width="200"
            height="180"
            viewBox="-5 -30 110 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="crownGradient" x1="28" y1="10" x2="72" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE44D" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#DAA520" />
              </linearGradient>
              <filter id="crownGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Penguin body */}
            <RoyalPenguin />

            {/* Crown with drop animation */}
            <AnimatePresence>
              {showCrown && (
                <motion.g
                  filter="url(#crownGlow)"
                  initial={{ y: -60, opacity: 0, scale: 0.8 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: [0.8, 1.05, 0.97, 1],
                  }}
                  transition={{
                    y: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                    opacity: { duration: 0.3 },
                    scale: {
                      duration: 0.8,
                      times: [0, 0.5, 0.75, 1],
                      ease: "easeOut",
                    },
                  }}
                >
                  <Crown />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Squash/stretch reaction on penguin when crown lands */}
            {showCrown && (
              <motion.g
                initial={{ scaleY: 1, scaleX: 1 }}
                animate={{
                  scaleY: [1, 0.95, 1.03, 1],
                  scaleX: [1, 1.04, 0.98, 1],
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.5,
                  ease: "easeOut",
                }}
                style={{ transformOrigin: "50px 60px" }}
              />
            )}
          </svg>
        </motion.div>

        {/* ── Penguin shadow glow (under character) ── */}
        <motion.div
          className="w-28 h-3 rounded-[100%] -mt-5"
          animate={{ opacity: [0.08, 0.15, 0.08], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          style={{ background: 'rgba(100, 140, 255, 0.2)' }}
        />
      </motion.div>

      {/* ── Title reveal ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="text-center mt-6 relative z-10"
      >
        <h1 className="font-display text-4xl font-bold text-white tracking-tight"
          style={{
            textShadow: '0 0 40px rgba(100, 140, 255, 0.3), 0 0 80px rgba(100, 140, 255, 0.1)',
          }}
        >
          Taskling
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
          className="h-[3px] mx-auto rounded-full mt-2 overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, rgba(100, 140, 255, 0.1), rgba(255, 215, 0, 0.6), rgba(100, 140, 255, 0.1))',
          }}
        />
      </motion.div>

      {/* ── Loading indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-14 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: 'rgba(255, 215, 0, 0.7)',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
            }}
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.0,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
