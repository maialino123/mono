'use client';
import Image from 'next/image';
import type { Product } from '@/entities/product';

interface LinkCardProps {
  product: Product;
  index: number;
  onClick?: () => void;
}

export function LinkCard({ product, index, onClick }: LinkCardProps) {
  const delay = 0.6 + index * 0.1;

  return (
    <button
      type="button"
      aria-label={`View ${product.title}`}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/30 hover:bg-white/40 border border-white/40 hover:border-white/50 transition-all"
      data-testid="link-card"
      style={{
        animation: `sora-fade-in 0.6s ease ${delay}s both`,
      }}
    >
      {/* Thumbnail */}
      <Image
        src={product.image} width={48} height={48}
        alt={product.title}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 text-left">
        <h4 className="text-sora-text-primary font-medium text-sm mb-0.5">
          {product.title}
        </h4>
        <p className="text-sora-text-secondary text-xs">
          {product.description.length > 60
            ? `${product.description.slice(0, 60)}...`
            : product.description}
        </p>
      </div>

      {/* Arrow Icon */}
      <svg aria-hidden="true"
        className="w-5 h-5 text-sora-text-secondary flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}
