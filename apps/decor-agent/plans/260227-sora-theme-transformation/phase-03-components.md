# Phase 03: Component Transformation

**Status:** Pending
**Priority:** High
**Estimated Effort:** Medium
**Blocked By:** Phase 01, Phase 02

## Context Links
- [Design Reference](../../tmpclaude-00e7-cwd)
- [Current ProfileHero](../../src/widgets/profile-hero/ui/profile-hero.tsx)
- [Current ProductCard](../../src/widgets/product-card/ui/product-card.tsx)

## Overview

Chuyển đổi các components hiện tại sang Sora style:
1. ProfileHero → SoraHeader (centered, avatar + name + tagline)
2. ProductCard → ShowcaseCard (featured product với 3D tilt)
3. ProductGrid → LinksContainer (link cards với thumbnails)
4. Header/Footer → Simpler Sora versions

## Key Insights

1. Sora design không có traditional header/footer
2. Layout centered với max-width 600px
3. ShowcaseCard có 3D tilt effect on mouse move
4. LinkCards có staggered animations

## Requirements

### Functional
- SoraHeader: Avatar (96px), name (Playfair), tagline
- ShowcaseCard: Product image, badge, pulse ring, CTA button
- LinkCard: Thumbnail (48px), title, subtitle, arrow icon
- SoraFooter: Simple copyright text

### Non-Functional
- Entrance animations với staggered delays
- 3D tilt effect (desktop only, >768px)
- Touch feedback on mobile

## Architecture

```
src/widgets/sora/
├── sora-header/
│   ├── ui/sora-header.tsx
│   └── index.ts
├── showcase-card/
│   ├── ui/showcase-card.tsx
│   └── index.ts
├── link-card/
│   ├── ui/link-card.tsx
│   └── index.ts
├── sora-footer/
│   ├── ui/sora-footer.tsx
│   └── index.ts
└── index.ts

src/screens/sora/
├── ui/sora-landing-screen.tsx
└── index.ts
```

## Related Code Files

### Files to Create
- `src/widgets/sora/sora-header/ui/sora-header.tsx`
- `src/widgets/sora/showcase-card/ui/showcase-card.tsx`
- `src/widgets/sora/link-card/ui/link-card.tsx`
- `src/widgets/sora/sora-footer/ui/sora-footer.tsx`
- `src/widgets/sora/index.ts`
- `src/screens/sora/ui/sora-landing-screen.tsx`
- `src/screens/sora/index.ts`

### Files to Modify
- `src/app/layout.tsx` - Remove Header/Footer
- `src/app/page.tsx` - Use SoraLandingScreen

## Implementation Steps

### Step 1: Create SoraHeader

```tsx
// src/widgets/sora/sora-header/ui/sora-header.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';

interface SoraHeaderProps {
  name: string;
  tagline: string;
  avatar: string;
}

export function SoraHeader({ name, tagline, avatar }: SoraHeaderProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <header
      className="text-center flex flex-col items-center gap-3 mt-5"
      style={{
        animation: 'sora-fade-in-down 1s var(--ease-out-expo) forwards',
        opacity: 0,
        transform: 'translateY(-20px)',
      }}
    >
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-gray-100 border-2 border-white/60 shadow-lg overflow-hidden">
        {!imageError ? (
          <Image
            src={avatar}
            alt={name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            style={{ filter: 'contrast(0.9) brightness(1.05)' }}
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sora-mint to-sora-lavender" />
        )}
      </div>

      {/* Name */}
      <h1 className="font-playfair text-[28px] font-semibold text-sora-text-primary tracking-tight">
        {name}
      </h1>

      {/* Tagline */}
      <p className="text-[15px] text-sora-text-secondary max-w-[80%] leading-relaxed">
        {tagline}
      </p>
    </header>
  );
}
```

### Step 2: Create ShowcaseCard

```tsx
// src/widgets/sora/showcase-card/ui/showcase-card.tsx
"use client";

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import type { Product } from '@/entities/product';

interface ShowcaseCardProps {
  product: Product;
  onCTAClick?: () => void;
}

export function ShowcaseCard({ product, onCTAClick }: ShowcaseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth <= 768) return;
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'rotateY(0) rotateX(0)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section>
      <div
        className="text-xs uppercase tracking-widest text-sora-text-secondary mb-3 pl-1"
        style={{ animation: 'sora-fade-in 0.8s ease 0.4s forwards', opacity: 0 }}
      >
        Featured Collection
      </div>

      <div className="w-full" style={{ perspective: '1000px' }}>
        <div
          ref={cardRef}
          className="relative rounded-card p-5 cursor-pointer overflow-hidden transition-transform duration-300"
          style={{
            background: `linear-gradient(145deg,
              rgba(255,255,255,0.72) 0%,
              rgba(220,245,230,0.38) 40%,
              rgba(255,255,255,0.18) 100%)`,
            backdropFilter: 'blur(28px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,0.55)',
            borderTop: '1.5px solid rgba(255,255,255,0.85)',
            borderLeft: '1.5px solid rgba(255,255,255,0.75)',
            boxShadow: `
              0 2px 0 0 rgba(255,255,255,0.8) inset,
              0 -1px 0 0 rgba(0,0,0,0.06) inset,
              0 24px 48px -8px rgba(80,110,90,0.18),
              0 8px 16px -4px rgba(80,110,90,0.10)
            `,
            animation: 'sora-showcase-entrance 1.2s var(--ease-out-expo) 0.3s forwards',
            opacity: 0,
            transform: 'scale(0.88) translateY(48px) rotateX(12deg)',
          }}
        >
          {/* Specular highlight */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[1.5px] rounded-full pointer-events-none z-10"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.95) 60%, transparent)',
            }}
          />

          {/* Liquid sweep animation */}
          <div
            className="absolute pointer-events-none z-[1]"
            style={{
              top: '-50%',
              left: '-60%',
              width: '60%',
              height: '200%',
              background: `linear-gradient(105deg,
                transparent 20%,
                rgba(255,255,255,0.55) 45%,
                rgba(255,255,255,0.08) 55%,
                transparent 70%)`,
              transform: 'skewX(-15deg)',
              animation: 'sora-liquid-sweep 5s infinite 1.8s ease-in-out',
            }}
          />

          {/* Product Image */}
          <div className="w-full h-[210px] rounded-[14px] mb-4 bg-gray-100 overflow-hidden relative shadow-lg">
            {/* Badge */}
            <div
              className="absolute top-3 left-3 z-[3] px-2.5 py-1 rounded-full text-[11px] font-semibold text-sora-green tracking-wide"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.9)',
              }}
            >
              ✦ Top Pick
            </div>

            {/* Pulse Ring */}
            <svg className="absolute bottom-3 right-3 w-9 h-9 z-[3]" viewBox="0 0 36 36">
              <circle
                className="fill-none stroke-white/90"
                cx="18" cy="18" r="6"
                strokeWidth="2"
                style={{ animation: 'sora-pulse-ring 2s infinite ease-out' }}
              />
              <circle
                className="fill-none stroke-white/90"
                cx="18" cy="18" r="6"
                strokeWidth="2"
                style={{ animation: 'sora-pulse-ring 2s infinite ease-out 0.6s' }}
              />
              <circle
                className="fill-none stroke-white/90"
                cx="18" cy="18" r="6"
                strokeWidth="2"
                style={{ animation: 'sora-pulse-ring 2s infinite ease-out 1.2s' }}
              />
              <circle className="fill-white" cx="18" cy="18" r="4" />
            </svg>

            {!imageError ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 active:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sora-mint/30 to-sora-lavender/30" />
            )}
          </div>

          {/* Product Meta */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-playfair text-[22px] mb-1 text-sora-text-primary">
                {product.title}
              </h2>
              <p className="text-sm text-sora-text-secondary">
                {product.description}
              </p>
            </div>

            <button
              onClick={onCTAClick}
              className="relative px-5 py-3 rounded-full text-[13px] font-semibold text-white overflow-hidden flex-shrink-0 transition-transform active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #3a6b4a 0%, #4e8f64 100%)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.3) inset, 0 6px 20px rgba(58,107,74,0.4)',
                animation: 'sora-cta-pulse 2.5s infinite 2s ease-in-out',
              }}
            >
              Shop ${product.price || '45'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Step 3: Create LinkCard

```tsx
// src/widgets/sora/link-card/ui/link-card.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/entities/product';

interface LinkCardProps {
  product: Product;
  index: number;
  onClick?: () => void;
}

export function LinkCard({ product, index, onClick }: LinkCardProps) {
  const [imageError, setImageError] = useState(false);

  const bgOpacity = [0.4, 0.35, 0.3, 0.25][index] || 0.25;
  const animDelay = 0.6 + index * 0.1;

  return (
    <Link
      href={product.url || '#'}
      onClick={onClick}
      className="flex items-center rounded-[20px] p-3 px-4 no-underline text-sora-text-primary transition-all duration-300 active:scale-[0.98] active:bg-white/50"
      style={{
        background: `rgba(255, 255, 255, ${bgOpacity})`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        animation: `sora-slide-up 0.8s var(--ease-out-expo) ${animDelay}s forwards`,
        opacity: 0,
        transform: 'translateY(20px)',
      }}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl bg-gray-200 mr-4 flex-shrink-0 overflow-hidden">
        {!imageError ? (
          <Image
            src={product.image}
            alt={product.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sora-mint to-sora-lavender" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <span className="font-semibold text-[15px] block mb-0.5">
          {product.title}
        </span>
        <span className="text-xs text-sora-text-secondary block">
          {product.description}
        </span>
      </div>

      {/* Arrow */}
      <svg
        className="opacity-40 transition-transform duration-300"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  );
}
```

### Step 4: Create SoraFooter

```tsx
// src/widgets/sora/sora-footer/ui/sora-footer.tsx
export function SoraFooter() {
  return (
    <footer
      className="text-center text-xs text-sora-text-secondary opacity-50 pb-6"
      style={{
        animation: 'sora-fade-in 1s ease 1.2s forwards',
        opacity: 0,
      }}
    >
      © {new Date().getFullYear()} Sora Vance. All rights reserved.
    </footer>
  );
}
```

### Step 5: Create SoraLandingScreen

```tsx
// src/screens/sora/ui/sora-landing-screen.tsx
import { SoraHeader, ShowcaseCard, LinkCard, SoraFooter } from '@/widgets/sora';
import type { Profile } from '@/entities/profile';
import type { Product } from '@/entities/product';

interface SoraLandingScreenProps {
  profile: Profile;
  featuredProducts: Product[];
  allProducts: Product[];
}

export function SoraLandingScreen({
  profile,
  featuredProducts,
  allProducts,
}: SoraLandingScreenProps) {
  const featured = featuredProducts[0];

  return (
    <main className="relative z-[1] max-w-[600px] mx-auto px-6 flex flex-col gap-8">
      <SoraHeader
        name={profile.name}
        tagline={profile.bio}
        avatar={profile.avatar}
      />

      {featured && <ShowcaseCard product={featured} />}

      {allProducts.length > 0 && (
        <section className="flex flex-col gap-4">
          {allProducts.slice(0, 4).map((product, idx) => (
            <LinkCard key={product.slug} product={product} index={idx} />
          ))}
        </section>
      )}

      <SoraFooter />
    </main>
  );
}
```

### Step 6: Update exports

Create index.ts files for all new modules.

### Step 7: Update page.tsx

```tsx
import { SoraLandingScreen } from '@/screens/sora';
// ... keep data fetching same, swap component
```

### Step 8: Update layout.tsx

Remove Header/Footer wrappers, keep AmbientLayer only.

## Todo List

- [ ] Create sora-header widget
- [ ] Create showcase-card widget
- [ ] Create link-card widget
- [ ] Create sora-footer widget
- [ ] Create sora-landing-screen
- [ ] Update page.tsx to use new screen
- [ ] Update layout.tsx to remove old header/footer
- [ ] Test all animations
- [ ] Verify mobile responsiveness

## Success Criteria

- [ ] All components render correctly
- [ ] 3D tilt works on desktop
- [ ] Touch feedback works on mobile
- [ ] Staggered animations play correctly
- [ ] No TypeScript errors
- [ ] Product data displays correctly

## Next Steps

After completion: `phase-04-animations.md`
