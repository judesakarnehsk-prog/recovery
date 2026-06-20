import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';

// Scene 2: frames 0–194 (6.5s local)
// Word-by-word reveal → 45-frame hold → choreographed dissolve-upward exit.

// --- Entrance stagger constants ---
const S_WHAT_IF   = 18; // 600ms between "What" and "if"
const S_LINE2     = 14; // 450ms between words in line 2
const S_LINE2_GAP = 18; // 600ms pause after "What if" before line 2
const S_LINE3_GAP = 24; // 800ms pause before line 3
const S_LINE3     = 14; // 450ms between "recovered" and "itself?"

// Word start frames (entrance)
const W_WHAT      = 8;
const W_IF        = W_WHAT + S_WHAT_IF;      // 26
const W_EVERY     = W_IF   + S_LINE2_GAP;    // 44
const W_FAILED    = W_EVERY  + S_LINE2;       // 58
const W_PAYMENT   = W_FAILED + S_LINE2;       // 72
const W_RECOVERED = W_PAYMENT + S_LINE3_GAP;  // 96
const W_ITSELF    = W_RECOVERED + S_LINE3;    // 110

// Hold + exit timing
// Last word settled by ~118. Hold 45 frames → exit starts at 163.
const EXIT_LINE1 = 163;       // "What if" begins dissolving
const EXIT_LINE2 = 166;       // "every failed payment" (+3 frames / 100ms)
const EXIT_LINE3 = 169;       // "recovered itself?" (+6 frames / 200ms)
const EXIT_DUR   = 14;        // each line dissolves in 14 frames (~0.47s)

// Bezier easing for exit (ease-in — accelerates as it dissolves)
const EXIT_EASE = Easing.bezier(0.4, 0, 1, 1);

// ─── Exit progress helper ────────────────────────────────────────────────────
function exitProgress(frame: number, exitStart: number): number {
  return interpolate(frame, [exitStart, exitStart + EXIT_DUR], [0, 1], {
    easing: EXIT_EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// ─── Floating exit particle ──────────────────────────────────────────────────
interface ExitParticleProps {
  seed: number;
  spawnFrame: number; // absolute local frame when it spawns
  baseX: number;      // % horizontal position
}

const ExitParticle: React.FC<ExitParticleProps> = ({ seed, spawnFrame, baseX }) => {
  const frame = useCurrentFrame();
  const lf = frame - spawnFrame;
  if (lf < 0) return null;

  const LIFE = 24; // 800ms
  const x = baseX + ((seed * 73.1) % 12) - 6;
  const size = 3 + (seed % 2);
  const speed = 2.2 + (seed % 3) * 0.4;

  const ty   = -lf * speed;
  const opacity = interpolate(lf, [0, 6, LIFE - 6, LIFE], [0, 0.6, 0.4, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: '50%',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: colors.accent,
        opacity,
        transform: `translateY(${ty}px)`,
        filter: 'blur(0.8px)',
        pointerEvents: 'none',
      }}
    />
  );
};

// ─── Text line with entrance + exit ─────────────────────────────────────────
interface LineProps {
  children: React.ReactNode;
  exitStart: number;
  isGradientLine?: boolean;
}

const ExitLine: React.FC<LineProps> = ({ children, exitStart, isGradientLine }) => {
  const frame = useCurrentFrame();
  const ep = exitProgress(frame, exitStart);

  const ty    = interpolate(ep, [0, 1], [0, -40]);
  const scale = interpolate(ep, [0, 1], [1, 1.05]);
  const blur  = interpolate(ep, [0, 1], [0, 8]);
  const opacity = interpolate(ep, [0, 1], [1, 0]);

  // Gradient line gets an additional warm glow as it ascends
  const glowFilter = isGradientLine
    ? `drop-shadow(0 0 ${8 + ep * 16}px rgba(201, 74, 31, ${0.3 + ep * 0.3}))`
    : '';
  const blurFilter = blur > 0.05 ? `blur(${blur}px)` : '';
  const filterStr  = [glowFilter, blurFilter].filter(Boolean).join(' ');

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${ty}px) scale(${scale})`,
        filter: filterStr || undefined,
        display: 'flex',
        flexWrap: 'wrap' as const,
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
};

// ─── Individual word (entrance only — exit handled by parent ExitLine) ───────
interface WordProps {
  text: string;
  startFrame: number;
  fontSize: number;
  fontWeight: number;
  color?: string;
  gradient?: boolean;
}

const Word: React.FC<WordProps> = ({
  text, startFrame, fontSize, fontWeight, color = colors.ink, gradient,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 14, stiffness: 80, mass: 1 } });
  const opacity = interpolate(Math.min(lf, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const ty      = interpolate(progress, [0, 1], [20, 0]);
  const scale   = interpolate(progress, [0, 1], [0.95, 1]);

  const gradStyle: React.CSSProperties = gradient
    ? {
        background: 'linear-gradient(135deg, #C94A1F 0%, #E66B3F 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
      }
    : {};

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily,
        fontSize,
        fontWeight,
        color: gradient ? undefined : color,
        lineHeight: 1.15,
        opacity,
        transform: `translateY(${ty}px) scale(${scale})`,
        marginRight: 12,
        ...gradStyle,
      }}
    >
      {text}
    </span>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────
export const Scene2Question: React.FC = () => {
  const frame = useCurrentFrame();

  // Camera drift upward over scene
  const drift = interpolate(frame, [0, 195], [0, -28], { extrapolateRight: 'clamp' });

  // Bottom glow grows during hold, then intensifies as text exits
  const glowOpacity = interpolate(
    frame,
    [20, 90, EXIT_LINE1, EXIT_LINE1 + EXIT_DUR],
    [0, 0.08, 0.08, 0.14],
    { extrapolateRight: 'clamp' }
  );

  // Exit particles — 4 per line, spawn when that line's exit begins
  const line1ParticleX = [38, 44, 50, 56];
  const line2ParticleX = [34, 42, 50, 58];
  const line3ParticleX = [36, 44, 52, 60];

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={30}
        orangeY={60}
        orangeOpacity={glowOpacity + 0.02}
        orangeBlur={140}
        orangeSize={580}
        gridOpacity={0.03}
        gradientAngleStart={177}
        gradientAngleEnd={184}
        gradientDuration={160}
      />

      {/* Growing bottom glow */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '30%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(201,74,31,0.5) 0%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: glowOpacity,
          }}
        />
      </AbsoluteFill>

      {/* Exit particles */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {line1ParticleX.map((x, i) => (
          <ExitParticle key={`l1-${i}`} seed={i + 1} spawnFrame={EXIT_LINE1 + 10} baseX={x} />
        ))}
        {line2ParticleX.map((x, i) => (
          <ExitParticle key={`l2-${i}`} seed={i + 5} spawnFrame={EXIT_LINE2 + 10} baseX={x} />
        ))}
        {line3ParticleX.map((x, i) => (
          <ExitParticle key={`l3-${i}`} seed={i + 9} spawnFrame={EXIT_LINE3 + 10} baseX={x} />
        ))}
      </AbsoluteFill>

      {/* Text content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
          transform: `translateY(${drift}px)`,
          gap: 8,
        }}
      >
        {/* Line 1: "What if" */}
        <ExitLine exitStart={EXIT_LINE1}>
          <Word text="What" startFrame={W_WHAT} fontSize={56} fontWeight={500} color={colors.ink} />
          <Word text="if"   startFrame={W_IF}   fontSize={56} fontWeight={500} color={colors.ink} />
        </ExitLine>

        {/* Line 2: "every failed payment" */}
        <ExitLine exitStart={EXIT_LINE2}>
          <Word text="every"   startFrame={W_EVERY}   fontSize={56} fontWeight={500} color={colors.inkMid} />
          <Word text="failed"  startFrame={W_FAILED}  fontSize={56} fontWeight={500} color={colors.inkMid} />
          <Word text="payment" startFrame={W_PAYMENT} fontSize={56} fontWeight={500} color={colors.inkMid} />
        </ExitLine>

        {/* Line 3: "recovered itself?" — gradient + exit glow */}
        <ExitLine exitStart={EXIT_LINE3} isGradientLine>
          <Word text="recovered" startFrame={W_RECOVERED} fontSize={72} fontWeight={700} gradient />
          <Word text="itself?"   startFrame={W_ITSELF}    fontSize={72} fontWeight={700} gradient />
        </ExitLine>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
