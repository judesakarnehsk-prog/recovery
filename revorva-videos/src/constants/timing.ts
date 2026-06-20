// Scene 1: Opening Statement (frames 0–119)
export const S1 = {
  silence:  0,    // 30 frames of pure cream
  label:    30,   // "INTRODUCING" fades in
  headline: 60,   // "A new standard" fades in
  sub:      90,   // "for SaaS payment recovery" fades in
  end:      120,
};

// Scene 2: The Problem (frames 120–239)
export const S2 = {
  start:    120,
  fadeOut:  120,  // Scene 1 fades out over 20 frames
  silence:  140,  // 10 frames empty
  line1:    150,  // "Failed payments cost"
  number:   180,  // "$1,200+ monthly"
  line3:    200,  // "for the average $20k MRR business"
  hold:     220,
  end:      240,
};

// Scene 3: The Number (frames 240–359)
export const S3 = {
  start:    240,
  fadeOut:  240,
  silence:  260,
  stat:     270,  // "70% of those are recoverable"
  sub:      320,  // "with the right system"
  hold:     340,
  end:      360,
};

// Scene 4: Brand Reveal (frames 360–539)
export const S4 = {
  start:    360,
  fadeOut:  360,
  silence:  380,
  wordmark: 400,  // "revorva."
  tagline:  450,  // "Recover what's yours."
  url:      490,  // "revorva.com"
  stillHold:510,  // completely still from here to 539
  end:      540,
};

export const FADE_DUR   = 30; // standard fade duration (frames)
export const SCALE_FROM = 0.97;
export const SCALE_TO   = 1.0;
export const EASE_OUT   = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
