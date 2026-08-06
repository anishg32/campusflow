"use client";

import { ReactLenis } from 'lenis/react';
import { ReactNode, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setIsNative(true);
      // Force cleanup of any Lenis styles that might get stuck on the HTML tag during hydration
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');
    }
  }, []);

  if (isNative) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
