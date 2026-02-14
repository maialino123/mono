# Design: Update Header Widget

## Context

Header is the most visible UI element. Design based on example-header.svg (1441×60px).

## Goals / Non-Goals

- Goals: Match SVG design, responsive mobile, active nav states, sticky, accessible
- Non-Goals: SSR header, i18n, complex animation

## Decisions

- Semantic Tailwind tokens for dark mode
- `useSelectedLayoutSegment()` for active nav detection
- Logo as inline SVG (150px, currentColor)
- Settings dropdown absorbs ModeToggle
- Sheet component for mobile nav
- Menu items: `h-9 px-4 gap-2`, `text-sm font-medium leading-5`
- Active: `text-primary`, Inactive: `text-secondary-foreground`

## Resolved

- Nav items: Mint, Stake, Dashboard, Profile
- Share: placeholder modal
- Wallet: Web3 source (refactor later)
