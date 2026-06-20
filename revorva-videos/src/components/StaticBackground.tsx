import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors } from '../constants/colors';

// Pure cream. No movement. No gradient. No decoration.
export const StaticBackground: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg }} />
);
