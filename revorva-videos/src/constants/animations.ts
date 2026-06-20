export const springConfigs = {
  // Fast/energetic — for impact moments
  impact:  { damping: 8,  stiffness: 150, mass: 0.5 },
  snap:    { damping: 10, stiffness: 180, mass: 0.6 },
  punch:   { damping: 6,  stiffness: 200, mass: 0.5 },
  // Natural
  smooth:  { damping: 14, stiffness: 90,  mass: 1   },
  snappy:  { damping: 12, stiffness: 120, mass: 0.8 },
  natural: { damping: 15, stiffness: 100, mass: 1   },
  gentle:  { damping: 22, stiffness: 80,  mass: 0.9 },
  bouncy:  { damping: 8,  stiffness: 100, mass: 0.8 },
  heavy:   { damping: 10, stiffness: 60,  mass: 1.2 },
  burst:   { damping: 18, stiffness: 200, mass: 0.6 },
  smart:   { damping: 14, stiffness: 80,  mass: 1   },
  draw:    { damping: 16, stiffness: 70,  mass: 1   },
  drift:   { damping: 20, stiffness: 50,  mass: 1   },
} as const;

export const STAGGER = {
  word:   9,
  letter: 2,
  card:   5,
  row:    4,
  fast:   3,
  impact: 6,
} as const;
