"use client";

import Image from 'next/image';
import { useState } from 'react';
import { GlassCard } from '@/shared/ui/glass-card';
import { GlassButton } from '@/shared/ui/glass-button';
import { useTrackClick } from '@/features/track-click';
import type { Product } from '@/entities/product';

interface ProductCardProps {
  product: Product;
}

function ImagePlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-slate-900/50">
      <svg className="w-12 h-12 text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-white/40 text-xs text-center px-2">{title}</span>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { trackClick } = useTrackClick();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    trackClick({ slug: product.slug, source: 'landing' });
  };

  return (
    <GlassCard className="h-full">
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/5 mb-4">
          {imageError ? (
            <ImagePlaceholder title={product.title} />
          ) : (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-white/70 text-sm mb-4 line-clamp-3 flex-1">
          {product.description}
        </p>

        {/* CTA */}
        <GlassButton href={`/go/${product.slug}`} onClick={handleClick} variant="secondary">
          Xem chi tiết
        </GlassButton>
      </div>
    </GlassCard>
  );
}
