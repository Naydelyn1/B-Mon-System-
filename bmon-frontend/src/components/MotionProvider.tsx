'use client';

import { MotionConfig } from 'motion/react';

// reducedMotion="user": si el sistema pide menos movimiento, Motion omite
// las animaciones de transform y deja solo los cambios de opacidad.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
