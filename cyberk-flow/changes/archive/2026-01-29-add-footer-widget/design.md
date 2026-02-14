# Design: Footer Widget

## Context

Adding a minimal footer widget matching the provided design — centered copyright text with top border.

## Goals / Non-Goals

- Goals: Simple copyright footer with dynamic year
- Non-Goals: Navigation links, social links, logo, description

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| Footer UI | LOW | Simple static component | `bun run check-types` |
| Exports | LOW | Add to existing index.ts | N/A |

## Decisions

- **Server Component**: No `"use client"` — footer is fully static
- **No config file needed**: Only static copyright text with dynamic year
- **Design spec**: Height 56px (`h-14`), top border theme-aware (`border-t border-border`), `bg-background`, centered `text-sm text-muted-foreground` (14px/24px, font-normal), flex center alignment

## Component Structure

```
widgets/layout/
├── ui/
│   ├── header.tsx       (existing)
│   └── footer.tsx       (new — copyright only)
└── index.ts             (update — add Footer export)
```
