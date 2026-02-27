# Sora Theme Transformation Plan

**Status:** Completed
**Priority:** High
**Created:** 2026-02-27

## Overview

Chuyển đổi theme hiện tại (Dark purple/slate glassmorphism) sang style "Sora - Curator of Calm" (Warm beige với soft glassmorphism, floating orbs, và aesthetic mindfulness).

## Current State Analysis

### Existing Theme
- **Colors:** Dark purple/slate gradient (`from-slate-900 via-purple-900 to-slate-900`)
- **Glass Effects:** `bg-white/10`, `backdrop-blur-xl`, `border-white/20`
- **Typography:** Inter font, white text on dark background
- **Components:** GlassCard, GlassButton, ProfileHero, ProductCard

### Target Theme (Sora)
- **Colors:** Warm beige (`#D6CFC7`), mint/lavender/rose/blue accents
- **Glass Effects:** Lighter, more prominent with specular highlights
- **Typography:** DM Sans + Playfair Display (serif headers)
- **Features:** Floating ambient orbs, liquid sweep animations, 3D tilt effects

## Phases

| Phase | Name | Status | Priority | File |
|-------|------|--------|----------|------|
| 01 | Foundation - Colors & Typography | ✅ Completed | Critical | [phase-01](./phase-01-foundation.md) |
| 02 | Ambient Background Layer | ✅ Completed | High | [phase-02](./phase-02-ambient-background.md) |
| 03 | Component Transformation | ✅ Completed | High | [phase-03](./phase-03-components.md) |
| 04 | Animations & Interactions | ✅ Completed | Medium | [phase-04](./phase-04-animations.md) |
| 05 | Testing & Polish | ✅ Completed | Medium | [phase-05](./phase-05-testing.md) |

## Key Design Tokens

```css
/* Sora Theme Tokens */
--bg-color: #D6CFC7;
--glass-surface: rgba(255, 255, 255, 0.25);
--glass-border: rgba(255, 255, 255, 0.4);
--text-primary: #4A4641;
--text-secondary: #757068;
--accent-mint: #C4E6D4;
--accent-lavender: #D8CDF0;
--accent-rose: #F0CDC6;
--accent-blue: #C6DDF0;
--accent-green: #3a6b4a;
```

## Component Mapping

| Current Component | Transformation Needed |
|-------------------|----------------------|
| `layout.tsx` | Update fonts, body background, remove Header/Footer wrappers |
| `globals.css` | Add Sora CSS variables, keyframes, utilities |
| `tailwind.config.ts` | Extend with Sora colors |
| `ProfileHero` → `SoraHeader` | Centered avatar, serif title, soft styling |
| `ProductCard` → `ShowcaseCard` | Premium glass effect, 3D tilt, pulse ring |
| `ProductGrid` → `LinksContainer` | Simplified link cards with thumbnails |
| NEW: `AmbientLayer` | Floating orbs background |

## Success Criteria

- [x] All current functionality preserved
- [x] Visual fidelity matches Sora design
- [x] Smooth animations (60fps)
- [x] Mobile responsive
- [x] Accessibility maintained
- [x] No TypeScript errors
- [x] E2E tests pass

## Risk Assessment

- **Medium:** Font loading may cause layout shift → Use `font-display: swap`
- **Low:** Animation performance on mobile → Use `will-change`, test on real devices
- **Low:** Breaking existing content structure → Keep data models unchanged

## Next Steps

1. `/ck:cook plans/260227-sora-theme-transformation/phase-01-foundation.md`
