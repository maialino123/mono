# Phase 01: Foundation - Colors & Typography

**Status:** Pending
**Priority:** Critical
**Estimated Effort:** Small

## Context Links
- [Design Reference](../../tmpclaude-00e7-cwd) - Original HTML/CSS design
- [Current Layout](../../src/app/layout.tsx)
- [Current Globals](../../src/app/globals.css)
- [Tailwind Config](../../tailwind.config.ts)

## Overview

Thiết lập nền tảng design tokens, typography, và CSS variables cho Sora theme.

## Key Insights

1. Sora dùng 2 font families: DM Sans (body) + Playfair Display (headings)
2. Color palette ấm hơn với beige là primary background
3. Glass effects nhẹ hơn, nhiều white transparency hơn

## Requirements

### Functional
- Google Fonts: DM Sans (300, 400, 500, 600) + Playfair Display (400, 600, italic)
- CSS custom properties cho toàn bộ color tokens
- Tailwind extend colors

### Non-Functional
- Font loading không gây layout shift
- CSS variables phải có fallbacks

## Architecture

```
src/app/
├── layout.tsx          # Update fonts, body class
├── globals.css         # Add Sora CSS variables, keyframes
└── fonts/              # (optional: self-hosted fonts)

tailwind.config.ts      # Extend theme colors
```

## Related Code Files

### Files to Modify
- `src/app/layout.tsx`
- `src/app/globals.css`
- `tailwind.config.ts`

### Files to Create
- None

## Implementation Steps

### Step 1: Update `tailwind.config.ts`

```typescript
// Add Sora theme colors
theme: {
  extend: {
    colors: {
      sora: {
        bg: '#D6CFC7',
        'text-primary': '#4A4641',
        'text-secondary': '#757068',
        mint: '#C4E6D4',
        lavender: '#D8CDF0',
        rose: '#F0CDC6',
        blue: '#C6DDF0',
        green: '#3a6b4a',
        'green-light': '#4e8f64',
      },
      // Glass tokens
      glass: {
        surface: 'rgba(255, 255, 255, 0.25)',
        border: 'rgba(255, 255, 255, 0.4)',
        highlight: 'rgba(255, 255, 255, 0.6)',
      },
    },
    fontFamily: {
      'dm-sans': ['DM Sans', 'sans-serif'],
      'playfair': ['Playfair Display', 'serif'],
    },
    borderRadius: {
      'card': '24px',
    },
  },
},
```

### Step 2: Update `globals.css`

Add Sora-specific CSS variables and keyframes:

```css
@layer base {
  :root {
    /* Sora Theme */
    --sora-bg: #D6CFC7;
    --sora-glass-surface: rgba(255, 255, 255, 0.25);
    --sora-glass-border: rgba(255, 255, 255, 0.4);
    --sora-text-primary: #4A4641;
    --sora-text-secondary: #757068;
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  }
}

/* Sora Animations */
@keyframes sora-float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 40px) scale(1.1); }
  100% { transform: translate(-20px, -20px) scale(0.95); }
}

@keyframes sora-fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes sora-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes sora-showcase-entrance {
  from {
    opacity: 0;
    transform: scale(0.88) translateY(48px) rotateX(12deg);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0) rotateX(0);
  }
}

@keyframes sora-liquid-sweep {
  0% { left: -60%; opacity: 0; }
  10% { opacity: 1; }
  60% { opacity: 1; }
  100% { left: 120%; opacity: 0; }
}

@keyframes sora-cta-pulse {
  0%, 100% {
    box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset,
                0 6px 20px rgba(58,107,74,0.4);
  }
  50% {
    box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset,
                0 8px 28px rgba(58,107,74,0.65),
                0 0 0 4px rgba(78,143,100,0.18);
  }
}

@keyframes sora-pulse-ring {
  0% { r: 6; opacity: 1; stroke-width: 2; }
  100% { r: 17; opacity: 0; stroke-width: 0.5; }
}
```

### Step 3: Update `layout.tsx`

```tsx
import { DM_Sans, Playfair_Display } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

// Update body className
<body className={`${dmSans.variable} ${playfair.variable} font-dm-sans`}>
```

## Todo List

- [ ] Update tailwind.config.ts with Sora colors and fonts
- [ ] Add CSS variables and keyframes to globals.css
- [ ] Update layout.tsx with Google Fonts
- [ ] Verify fonts load correctly
- [ ] Run TypeScript check

## Success Criteria

- [ ] Fonts load without FOUT/FOIT
- [ ] All CSS variables accessible
- [ ] Tailwind classes available (e.g., `text-sora-text-primary`)
- [ ] No TypeScript errors
- [ ] Build passes

## Security Considerations

- Google Fonts loaded via next/font (no external requests at runtime)

## Next Steps

After completion: `phase-02-ambient-background.md`
