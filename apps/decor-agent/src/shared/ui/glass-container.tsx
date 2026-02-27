"use client";

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface GlassContainerProps {
  children: ReactNode;
  className?: string;
}

export function GlassContainer({ children, className }: GlassContainerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/5 p-4 backdrop-blur-lg",
        "border border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}
