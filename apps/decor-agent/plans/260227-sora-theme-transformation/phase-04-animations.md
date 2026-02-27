# Phase 04: Animations & Interactions

**Status:** Pending
**Priority:** Medium
**Estimated Effort:** Small
**Blocked By:** Phase 03

## Context Links
- [Design Reference](../../tmpclaude-00e7-cwd)
- [Phase 03 Components](./phase-03-components.md)

## Overview

Polish animations và thêm các micro-interactions để đạt được visual fidelity hoàn hảo với design gốc.

## Key Insights

1. Design gốc có nhiều keyframe animations phức tạp
2. Cần shimmer effect cho CTA button
3. SVG pulse ring cần CSS animation cho `r` attribute
4. Mouse tilt effect cần smooth transition

## Requirements

### Functional
- Button shimmer effect (btnShimmer)
- CTA pulse glow animation
- SVG pulse rings với animated radius
- Smooth 3D tilt với transition reset

### Non-Functional
- 60fps on all animations
- Reduced motion support
- GPU acceleration where possible

## Implementation Steps

### Step 1: Add remaining keyframes to globals.css

```css
@keyframes sora-btn-shimmer {
  0% { left: -60%; }
  100% { left: 130%; }
}

@keyframes sora-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Step 2: Update ShowcaseCard CTA button shimmer

Add pseudo-element for shimmer:

```tsx
// Inside button, add shimmer div
<div
  className="absolute top-0 left-[-60%] w-[50%] h-full pointer-events-none"
  style={{
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
    animation: 'sora-btn-shimmer 2.5s infinite 2s',
  }}
/>
```

### Step 3: Add reduced motion support

```css
@media (prefers-reduced-motion: reduce) {
  .sora-theme *,
  .sora-theme *::before,
  .sora-theme *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Step 4: Add touch feedback utilities

```css
@layer utilities {
  .sora-touch-feedback {
    @apply transition-transform duration-150 active:scale-[0.98];
  }
}
```

### Step 5: Test and optimize

- Profile with Chrome DevTools
- Check paint/layout triggers
- Ensure `will-change` on animated elements

## Todo List

- [ ] Add remaining keyframes
- [ ] Add shimmer to CTA button
- [ ] Add reduced motion support
- [ ] Add touch feedback utilities
- [ ] Profile animation performance
- [ ] Fix any jank issues

## Success Criteria

- [ ] All animations match design reference
- [ ] 60fps on desktop and mobile
- [ ] Reduced motion respected
- [ ] No layout thrashing

## Next Steps

After completion: `phase-05-testing.md`
