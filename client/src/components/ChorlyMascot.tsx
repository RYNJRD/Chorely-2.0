import { motion } from "framer-motion";

export type ChorlyPose = "wave" | "point" | "celebrate" | "peek" | "sleep" | "think";

interface ChorlyMascotProps {
  pose?: ChorlyPose;
  size?: number;
  className?: string;
  bounce?: boolean;
}

export function ChorlyMascot({ pose = "wave", size = 120, className = "", bounce = true }: ChorlyMascotProps) {
  const height = pose === "peek" ? size * 0.55 : size * 1.1;

  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={bounce ? { y: [0, -8, 0] } : { y: 0 }}
      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
    >
      <svg
        width={size}
        height={height}
        viewBox={pose === "peek" ? "0 0 100 60" : "0 0 100 110"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="chorlyBody" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#0D9488" />
          </radialGradient>
          <radialGradient id="chorlyNub" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0F766E" />
          </radialGradient>
        </defs>

        {pose === "wave" && <WavePose />}
        {pose === "point" && <PointPose />}
        {pose === "celebrate" && <CelebratePose />}
        {pose === "peek" && <PeekPose />}
        {pose === "sleep" && <SleepPose />}
        {pose === "think" && <ThinkPose />}
      </svg>
    </motion.div>
  );
}

function BaseBody() {
  return (
    <>
      <ellipse cx="50" cy="107" rx="28" ry="5" fill="rgba(0,0,0,0.12)" />
      <path d="M15 67C15 40 30 17 50 17C70 17 85 40 85 67C85 90 72 107 50 107C28 107 15 90 15 67Z" fill="url(#chorlyBody)" />
      <path d="M25 42C25 42 35 28 50 28C65 28 75 42 75 42" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="84" rx="19" ry="14" fill="rgba(255,255,255,0.15)" />
    </>
  );
}

function BaseEyes({ leftX = 35, rightX = 65, y = 60, lookUp = false, wide = false, squint = false }: {
  leftX?: number; rightX?: number; y?: number; lookUp?: boolean; wide?: boolean; squint?: boolean;
}) {
  const r = wide ? 13 : 11;
  const pr = wide ? 7.5 : 6.5;
  const pupilOffsetY = lookUp ? -3 : 2;
  const pupilOffsetX = 2;
  const shineOffX = 3;
  const shineOffY = lookUp ? -4 : -3;

  if (squint) {
    return (
      <>
        <ellipse cx={leftX} cy={y} rx={11} ry={7} fill="white" />
        <ellipse cx={leftX + pupilOffsetX} cy={y + 1} rx={6} ry={4} fill="#1e293b" />
        <circle cx={leftX + shineOffX} cy={y - 1} r={2} fill="white" />
        <ellipse cx={rightX} cy={y} rx={11} ry={7} fill="white" />
        <ellipse cx={rightX + pupilOffsetX} cy={y + 1} rx={6} ry={4} fill="#1e293b" />
        <circle cx={rightX + shineOffX} cy={y - 1} r={2} fill="white" />
      </>
    );
  }

  return (
    <>
      <circle cx={leftX} cy={y} r={r} fill="white" />
      <circle cx={leftX + pupilOffsetX} cy={y + pupilOffsetY} r={pr} fill="#1e293b" />
      <circle cx={leftX + shineOffX} cy={y + shineOffY} r={2.5} fill="white" />
      <circle cx={rightX} cy={y} r={r} fill="white" />
      <circle cx={rightX + pupilOffsetX} cy={y + pupilOffsetY} r={pr} fill="#1e293b" />
      <circle cx={rightX + shineOffX} cy={y + shineOffY} r={2.5} fill="white" />
    </>
  );
}

function BaseNubs() {
  return (
    <>
      <circle cx="33" cy="21" r="8" fill="url(#chorlyNub)" />
      <circle cx="67" cy="21" r="8" fill="url(#chorlyNub)" />
    </>
  );
}

function BaseCheeks() {
  return (
    <>
      <ellipse cx="23" cy="72" rx="7" ry="5" fill="rgba(251,113,133,0.38)" />
      <ellipse cx="77" cy="72" rx="7" ry="5" fill="rgba(251,113,133,0.38)" />
    </>
  );
}

function HappySmile() {
  return <path d="M37 79Q50 93 63 79" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />;
}

function BigGrin() {
  return (
    <>
      <path d="M35 78Q50 96 65 78Q50 90 35 78Z" fill="#1e293b" />
      <path d="M35 78Q50 96 65 78" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="88" rx="10" ry="5" fill="white" opacity="0.9" />
    </>
  );
}

function Arm({ x1, y1, x2, y2, handX, handY }: { x1: number; y1: number; x2: number; y2: number; handX: number; handY: number }) {
  return (
    <>
      <path d={`M${x1} ${y1} C${(x1 + x2) / 2 + 4} ${(y1 + y2) / 2} ${x2} ${y2} ${handX} ${handY}`}
        stroke="#0F766E" strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx={handX} cy={handY} r={7} fill="#14B8A6" />
      <circle cx={handX} cy={handY} r={3} fill="#5EEAD4" />
    </>
  );
}

function WavePose() {
  return (
    <>
      <BaseBody />
      <BaseNubs />
      <Arm x1={74} y1={54} x2={86} y2={26} handX={88} handY={18} />
      <Arm x1={26} y1={68} x2={14} y2={86} handX={12} handY={92} />
      <BaseEyes squint={true} y={60} />
      <BaseCheeks />
      <HappySmile />
      <motion.g animate={{ rotate: [-12, 12, -12] }} transition={{ repeat: Infinity, duration: 0.5 }} style={{ transformOrigin: "88px 18px" }}>
        <circle cx="88" cy="18" r="3" fill="#FCD34D" />
        <circle cx="94" cy="12" r="2" fill="#FCD34D" />
        <circle cx="96" cy="20" r="1.5" fill="#F59E0B" />
      </motion.g>
    </>
  );
}

function PointPose() {
  return (
    <>
      <BaseBody />
      <BaseNubs />
      <Arm x1={78} y1={60} x2={96} y2={56} handX={100} handY={54} />
      <Arm x1={22} y1={68} x2={10} y2={72} handX={6} handY={74} />
      <BaseEyes wide={true} y={59} />
      <BaseCheeks />
      <BigGrin />
      <text x="102" y="50" fontSize="12" fill="#7C3AED" fontWeight="bold">!</text>
    </>
  );
}

function CelebratePose() {
  return (
    <>
      <BaseBody />
      <BaseNubs />
      <Arm x1={24} y1={58} x2={10} y2={24} handX={8} handY={16} />
      <Arm x1={76} y1={58} x2={90} y2={24} handX={92} handY={16} />
      <BaseEyes squint={true} y={59} />
      <BaseCheeks />
      <BigGrin />
      {[
        { cx: 18, cy: 12, r: 4, fill: "#F59E0B" },
        { cx: 82, cy: 10, r: 3, fill: "#8B5CF6" },
        { cx: 30, cy: 6, r: 3.5, fill: "#EC4899" },
        { cx: 70, cy: 4, r: 3, fill: "#10B981" },
        { cx: 50, cy: 8, r: 2.5, fill: "#F59E0B" },
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.cx} cy={star.cy} r={star.r} fill={star.fill}
          animate={{ y: [-2, 2, -2], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.18 }}
        />
      ))}
    </>
  );
}

function PeekPose() {
  return (
    <>
      <path d="M15 67C15 40 30 17 50 17C70 17 85 40 85 67C85 90 72 107 50 107C28 107 15 90 15 67Z" fill="url(#chorlyBody)" />
      <path d="M25 42C25 42 35 28 50 28C65 28 75 42 75 42" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="33" cy="21" r="8" fill="url(#chorlyNub)" />
      <circle cx="67" cy="21" r="8" fill="url(#chorlyNub)" />
      <BaseEyes wide={true} lookUp={true} y={56} />
      <ellipse cx="23" cy="66" rx="6" ry="4" fill="rgba(251,113,133,0.4)" />
      <ellipse cx="77" cy="66" rx="6" ry="4" fill="rgba(251,113,133,0.4)" />
      <path d="M40 72 Q50 76 60 72" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </>
  );
}

function SleepPose() {
  return (
    <>
      <g transform="rotate(-12 50 60)">
        <BaseBody />
        <BaseNubs />
        <path d="M26 60 C34 55 36 65 44 60" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M56 60 C64 55 66 65 74 60" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <BaseCheeks />
        <path d="M40 78 Q50 83 60 78" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Arm x1={26} y1={68} x2={14} y2={86} handX={12} handY={92} />
        <Arm x1={74} y1={68} x2={86} y2={86} handX={88} handY={92} />
      </g>
      {["Z", "z", "Z"].map((z, i) => (
        <motion.text
          key={i}
          x={72 + i * 8} y={22 - i * 8}
          fontSize={10 + i * 3} fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif"
          animate={{ opacity: [0, 1, 0], y: [0, -4, -8] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
        >
          {z}
        </motion.text>
      ))}
    </>
  );
}

function ThinkPose() {
  return (
    <>
      <BaseBody />
      <BaseNubs />
      <Arm x1={74} y1={60} x2={78} y2={50} handX={76} handY={44} />
      <Arm x1={26} y1={68} x2={14} y2={82} handX={12} handY={88} />
      <g transform="translate(0, -3)">
        <circle cx="35" cy="60" r="11" fill="white" />
        <circle cx="38" cy="57" r="6.5" fill="#1e293b" />
        <circle cx="41" cy="54" r="2.5" fill="white" />
        <circle cx="65" cy="60" r="11" fill="white" />
        <circle cx="68" cy="57" r="6.5" fill="#1e293b" />
        <circle cx="71" cy="54" r="2.5" fill="white" />
      </g>
      <BaseCheeks />
      <path d="M40 79 Q50 83 60 79" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {[0, 1, 2].map(i => (
        <motion.circle key={i} cx={84 + i * 6} cy={28 - i * 4} r={2 + i * 0.5} fill="#A78BFA"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.3 }}
        />
      ))}
    </>
  );
}
