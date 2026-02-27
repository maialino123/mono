"use client";

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className, onClick }: GlassCardProps) {
  const baseClasses = cn(
    "relative rounded-3xl p-6",
    "bg-white/10 backdrop-blur-xl",
    "border border-white/20",
    "shadow-purple-500/10 shadow-xl",
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(baseClasses, "cursor-pointer transition-colors hover:bg-white/15 text-left w-full")}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}
