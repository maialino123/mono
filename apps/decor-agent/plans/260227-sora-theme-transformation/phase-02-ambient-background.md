# Phase 02: Ambient Background Layer

**Status:** Pending
**Priority:** High
**Estimated Effort:** Small
**Blocked By:** Phase 01

## Context Links
- [Design Reference](../../tmpclaude-00e7-cwd)
- [Phase 01](./phase-01-foundation.md)

## Overview

Tạo AmbientLayer component với floating orbs và backdrop blur overlay, tạo hiệu ứng nền ambient đặc trưng của Sora design.

## Key Insights

1. 3 orbs với màu khác nhau (mint, lavender, blue)
2. Mỗi orb có animation duration và delay riêng
3. Overlay với backdrop-filter blur để soften orbs
4. Fixed positioning, z-index -1

## Requirements

### Functional
- 3 floating orbs với gradient radial
- Staggered animation delays
- Blur overlay 80px
- Noise texture overlay (SVG data URI)

### Non-Functional
- 60fps animation
- GPU-accelerated (transform, opacity)
- No layout shift

## Architecture

```
src/shared/ui/sora/
├── ambient-layer.tsx    # Floating orbs background
└── index.ts
```

## Related Code Files

### Files to Create
- `src/shared/ui/sora/ambient-layer.tsx`
- `src/shared/ui/sora/index.ts`

### Files to Modify
- `src/app/layout.tsx` (conditionally render AmbientLayer)

## Implementation Steps

### Step 1: Create `ambient-layer.tsx`

```tsx
export function AmbientLayer() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Orb 1 - Mint */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: '80vw',
          height: '80vw',
          background: 'radial-gradient(circle, var(--sora-mint, #C4E6D4), transparent 70%)',
          top: '-20%',
          left: '-20%',
          filter: 'blur(60px)',
          animation: 'sora-float 20s infinite ease-in-out alternate',
        }}
      />

      {/* Orb 2 - Lavender */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: '70vw',
          height: '70vw',
          background: 'radial-gradient(circle, var(--sora-lavender, #D8CDF0), transparent 70%)',
          bottom: '-10%',
          right: '-20%',
          filter: 'blur(60px)',
          animation: 'sora-float 25s infinite ease-in-out alternate',
          animationDelay: '-5s',
        }}
      />

      {/* Orb 3 - Blue */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, var(--sora-blue, #C6DDF0), transparent 70%)',
          top: '40%',
          left: '30%',
          filter: 'blur(60px)',
          animation: 'sora-float 18s infinite ease-in-out alternate',
          animationDelay: '-10s',
        }}
      />

      {/* Blur Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(214, 207, 199, 0.3)',
          backdropFilter: 'blur(80px)',
          WebkitBackdropFilter: 'blur(80px)',
        }}
      />
    </div>
  );
}
```

### Step 2: Add noise texture to body (globals.css)

```css
.sora-theme body {
  background-color: var(--sora-bg);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
}
```

### Step 3: Update layout.tsx

```tsx
import { AmbientLayer } from '@/shared/ui/sora';

// In body:
<body className={`${dmSans.variable} ${playfair.variable} font-dm-sans bg-sora-bg text-sora-text-primary`}>
  <AmbientLayer />
  {children}
</body>
```

## Todo List

- [ ] Create ambient-layer.tsx with 3 orbs
- [ ] Create index.ts export
- [ ] Add noise texture CSS
- [ ] Update layout.tsx to use AmbientLayer
- [ ] Test animation performance

## Success Criteria

- [ ] Orbs animate smoothly at 60fps
- [ ] Blur overlay properly softens orbs
- [ ] No content blocked (z-index correct)
- [ ] Works on mobile Safari (webkit prefixes)

## Risk Assessment

- **Low:** Performance on older devices → Use `will-change: transform`
- **Low:** Safari backdrop-filter → Add webkit prefix

## Next Steps

After completion: `phase-03-components.md`
