import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, useInView } from 'motion/react';

interface ForceNode {
  label: string;
  color: string;
  angle: number;
}

const forces: ForceNode[] = [
  { label: 'Momentum', color: '#1de2c4', angle: 270 },
  { label: 'Friction', color: '#ef4444', angle: 330 },
  { label: 'Surface Area', color: '#60a5fa', angle: 30 },
  { label: 'Mass', color: '#f59e0b', angle: 90 },
  { label: 'Escape Velocity', color: '#c084fc', angle: 150 },
  { label: 'Inflection Points', color: '#06b6d4', angle: 210 },
];

interface Props {
  size?: 'default' | 'large';
}

export default function ForcesDiagram({ size = 'default' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
  const shouldReduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || !isInView) return;
    let frame: number;
    const animate = () => {
      setTick((t) => t + 1);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [shouldReduceMotion, isInView]);

  const viewBox = size === 'large' ? 500 : 400;
  const cx = viewBox / 2;
  const cy = viewBox / 2;
  const orbitRadius = size === 'large' ? 175 : 140;
  const nodeRadius = size === 'large' ? 10 : 8;
  const time = tick * 0.008;

  const getNodePos = (angle: number, index: number) => {
    const wobble = shouldReduceMotion ? 0 : Math.sin(time + index * 1.2) * 4;
    const rad = ((angle + (shouldReduceMotion ? 0 : time * 3)) * Math.PI) / 180;
    return {
      x: cx + (orbitRadius + wobble) * Math.cos(rad),
      y: cy + (orbitRadius + wobble) * Math.sin(rad),
    };
  };

  const connections: [number, number][] = [
    [0, 1], // Momentum <-> Friction
    [0, 3], // Momentum <-> Mass
    [0, 4], // Momentum <-> Escape Velocity
    [1, 0], // Friction <-> Momentum (already covered, use different pair)
    [2, 3], // Surface Area <-> Mass
    [3, 4], // Mass <-> Escape Velocity
    [4, 5], // Escape Velocity <-> Inflection Points
    [5, 0], // Inflection Points <-> Momentum
    [1, 2], // Friction <-> Surface Area
  ];

  // Deduplicate
  const uniqueConnections: [number, number][] = [
    [0, 1], [0, 3], [0, 4], [0, 5],
    [1, 2], [2, 3], [3, 4], [4, 5],
  ];

  return (
    <div ref={ref} className="forces-diagram-wrap" style={{ width: '100%', aspectRatio: '1', maxWidth: size === 'large' ? 500 : 400, margin: '0 auto' }}>
      <motion.svg
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : undefined}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Orbit ring */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
          strokeDasharray="4 6"
        />

        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius * 0.5}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={1}
        />

        {/* Connection lines */}
        {uniqueConnections.map(([a, b], i) => {
          const posA = getNodePos(forces[a].angle, a);
          const posB = getNodePos(forces[b].angle, b);
          const pulseOpacity = shouldReduceMotion ? 0.12 : 0.08 + Math.sin(time * 2 + i) * 0.06;
          return (
            <line
              key={`conn-${a}-${b}`}
              x1={posA.x}
              y1={posA.y}
              x2={posB.x}
              y2={posB.y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              opacity={pulseOpacity / 0.15}
            />
          );
        })}

        {/* Center glow */}
        <circle cx={cx} cy={cy} r={6} fill="rgba(29,226,196,0.3)" />
        <circle cx={cx} cy={cy} r={3} fill="#1de2c4" />

        {/* Force nodes */}
        {forces.map((force, i) => {
          const pos = getNodePos(force.angle, i);
          const pulseR = shouldReduceMotion ? nodeRadius : nodeRadius + Math.sin(time * 1.5 + i * 0.8) * 2;
          const labelOffset = size === 'large' ? 22 : 18;
          const labelAngleRad = ((force.angle + (shouldReduceMotion ? 0 : time * 3)) * Math.PI) / 180;
          const labelX = pos.x + Math.cos(labelAngleRad) * labelOffset;
          const labelY = pos.y + Math.sin(labelAngleRad) * labelOffset;

          return (
            <g key={force.label}>
              {/* Glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pulseR * 2.5}
                fill={force.color}
                opacity={0.08}
              />
              {/* Node */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pulseR}
                fill={force.color}
                opacity={0.9}
              />
              {/* Label */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#afafb6"
                fontSize={size === 'large' ? 11 : 9.5}
                fontFamily="system-ui, sans-serif"
                fontWeight={500}
              >
                {force.label}
              </text>
            </g>
          );
        })}
      </motion.svg>
    </div>
  );
}
