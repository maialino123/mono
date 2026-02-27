'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/entities/product';

interface ShowcaseCardProps {
  product: Product;
  onCTAClick?: () => void;
}

export function ShowcaseCard({ product, onCTAClick }: ShowcaseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop || !cardRef.current) return;

    const card = cardRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDesktop]);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-6 mb-8 transition-transform duration-200 ease-out animate-sora-showcase-entrance"
      data-testid="showcase-card"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full">
        <span className="text-xs font-medium text-gray-800">✦ Top Pick</span>
      </div>

      {/* Pulse Ring SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-50" aria-hidden="true">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="url(#pulse-gradient)"
            strokeWidth="2"
            rx="16"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Product Image */}
      <div className="relative aspect-[4/3] mb-4 rounded-xl overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <h3 className="font-playfair text-2xl font-semibold text-white mb-2">
        {product.title}
      </h3>
      <p className="text-sora-text-secondary text-sm mb-4">
        {product.description}
      </p>

      {/* CTA Button */}
      <button
        type="button"
        onClick={onCTAClick}
        className="w-full bg-white text-gray-900 py-3 px-6 rounded-xl font-medium hover:bg-white/90 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}
