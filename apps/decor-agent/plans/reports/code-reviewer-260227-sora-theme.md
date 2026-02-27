# Code Review: Sora Theme Transformation

**Date:** 2026-02-27
**Reviewer:** code-reviewer
**Scope:** Sora theme CSS/components transformation

---

## Code Review Summary

### Scope
- **Files:** 10 files reviewed
- **LOC:** ~400 lines
- **Focus:** Theme system, CSS architecture, React components
- **Build Status:** FAILING (critical issues found)

### Overall Assessment

The Sora theme implementation demonstrates good design intent with glassmorphism effects, ambient floating orbs, and cohesive color palette. However, the build is currently broken due to React Server Component violations. Several other issues need attention before production deployment.

---

## Critical Issues

### 1. [CRITICAL] Build Failure - Server/Client Component Boundary Violation

**Location:** src/screens/sora/ui/sora-landing-screen.tsx

**Problem:** SoraLandingScreen passes event handlers (onCTAClick, onClick) to child components but is NOT marked as a client component. In Next.js App Router, server components cannot pass function props.

**Impact:** Build fails completely. No deployment possible.

**Fix:** Add use client directive to sora-landing-screen.tsx

**Affected components needing use client:**
- src/screens/sora/ui/sora-landing-screen.tsx - passes onClick handlers
- src/widgets/sora/link-card/ui/link-card.tsx - receives onClick prop

### 2. [CRITICAL] Missing use client in LinkCard

**Location:** src/widgets/sora/link-card/ui/link-card.tsx

**Problem:** LinkCard accepts an onClick handler but lacks use client directive.

---

## High Priority

### 3. [HIGH] Hardcoded white Text Color - Accessibility Issue

**Location:** Multiple components

**Problem:** Header name uses text-white but Sora theme background is #D6CFC7 (light beige). White text on light background has poor contrast ratio (~1.7:1), failing WCAG AA requirements (4.5:1).

**Files affected:**
- sora-header.tsx line 18: text-white for name
- showcase-card.tsx line 102: text-white for title
- link-card.tsx line 30: text-white for title

**Fix:** Use text-sora-text-primary (defined as #4A4641) for better contrast.

### 4. [HIGH] Missing aria-label on Interactive Elements

**Location:** showcase-card.tsx, link-card.tsx

**Problem:** Buttons lack accessible labels for screen readers.

### 5. [HIGH] Non-GPU-Accelerated Animation Property

**Location:** globals.css - sora-liquid-sweep keyframe (lines 137-142)

**Problem:** Uses left property for animation which triggers expensive layout recalculations.

**Fix:** Use transform: translateX() for GPU acceleration instead.

### 6. [HIGH] Security: External URL Opening Without Validation

**Location:** sora-landing-screen.tsx lines 37, 49

**Problem:** window.open opens arbitrary URLs without validation. If product data is user-generated, this could be exploited.

**Risk:** Open redirect vulnerability, potential XSS via javascript: URLs.

**Fix:** Add URL validation to check protocol is http/https and add noopener,noreferrer.

---

## Medium Priority

### 7. [MEDIUM] Missing CSS Variable Fallbacks in Tailwind Config

**Location:** tailwind.config.ts lines 10-12

**Problem:** HSL color references use CSS variables without fallbacks.

### 8. [MEDIUM] Inline Styles vs Tailwind Classes Inconsistency

**Location:** ambient-layer.tsx, link-card.tsx

**Problem:** Heavy use of inline style={} mixed with Tailwind classes reduces maintainability.

### 9. [MEDIUM] Footer Using Server-Side Date

**Location:** sora-footer.tsx line 2

**Problem:** new Date().getFullYear() runs at build time for static pages.

### 10. [MEDIUM] Missing data-testid on Some Elements

**Audit:**
- sora-header.tsx - Has data-testid=sora-header
- showcase-card.tsx - Has data-testid=showcase-card
- link-card.tsx - Has data-testid=link-card
- ambient-layer.tsx - MISSING
- sora-footer.tsx - MISSING
- sora-landing-screen.tsx - MISSING on container

---

## Low Priority

### 11. [LOW] Button Type Missing

**Location:** showcase-card.tsx line 110, link-card.tsx line 13

**Problem:** Buttons without explicit type attribute default to submit.

### 12. [LOW] Image alt Text Could Be More Descriptive

**Location:** sora-header.tsx line 15

---

## Positive Observations

1. **Well-structured CSS architecture** - Clean separation of base, utilities, and keyframes layers
2. **Reduced motion support** - Excellent accessibility with prefers-reduced-motion media query
3. **Safari compatibility** - Proper -webkit-backdrop-filter prefix in ambient-layer.tsx and globals.css
4. **Font optimization** - Using display: swap for Google Fonts prevents FOIT
5. **Semantic HTML** - Proper use of header, footer elements
6. **Type safety** - All component props are properly typed with interfaces
7. **Focus states** - Good focus-visible styling for keyboard navigation
8. **ISR configuration** - Smart use of revalidate = 3600 for static generation

---

## Recommended Actions

### Immediate (Blocking Deploy)
1. Add use client to sora-landing-screen.tsx
2. Add use client to link-card.tsx

### High Priority (Pre-Production)
3. Fix text color contrast issues (white on light background)
4. Add aria-labels to buttons
5. Change sora-liquid-sweep to use transform instead of left
6. Add URL validation for affiliate links

### Medium Priority (Next Sprint)
7. Add missing data-testid attributes
8. Add explicit type=button to buttons
9. Consider extracting ambient layer styles to utilities

---

## Metrics

| Metric | Value |
|--------|-------|
| Type Coverage | 100% (all props typed) |
| Test Coverage | Unknown (build failure) |
| Linting Issues | ESLint not configured |
| Build Status | FAILING |
| a11y Issues | 3 (contrast, aria-labels) |
| Safari Compat | Good |
| Reduced Motion | Supported |

---

## Review Checklist

- [x] TypeScript types correct
- [x] CSS variables have fallbacks (in globals.css)
- [ ] Animations GPU-accelerated - sora-liquid-sweep uses left
- [x] Reduced motion support
- [ ] Accessibility - Missing aria-labels, contrast issues
- [x] Mobile responsiveness
- [x] Safari compatibility
- [ ] No security issues - URL validation needed
- [x] YAGNI, KISS, DRY principles
- [ ] Build passes - CRITICAL: Server component violation

---

## Unresolved Questions

1. Should AmbientLayer be a client component for motion preference via JS?
2. Is the ISR revalidation period of 1 hour appropriate?
3. Are there E2E tests planned for the Sora theme?
