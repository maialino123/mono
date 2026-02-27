"use client";

import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface GlassButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function GlassButton({
  children,
  href,
  onClick,
  className,
  variant = 'primary'
}: GlassButtonProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center",
    "rounded-full px-6 py-3",
    "border backdrop-blur-md transition-all",
    "whitespace-nowrap font-medium text-white",
    variant === 'primary' && "border-white/30 bg-white/20 hover:bg-white/30",
    variant === 'secondary' && "border-white/20 bg-white/10 hover:bg-white/20",
    "hover:scale-[1.02]",
    className
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={baseStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseStyles}>
      {children}
    </button>
  );
}
