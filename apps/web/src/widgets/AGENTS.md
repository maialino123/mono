# Widgets Layer - FSD Architecture Guide

> **Layer Purpose**: Large self-sufficient blocks of UI that are reused across pages.
> **Position**: Third layer from top in FSD hierarchy (below screens/).

## When AI Should Work in This Layer

- Creating large reusable UI blocks used on 2+ pages
- Building page layouts (headers, sidebars, footers)
- Composing features and entities into cohesive UI sections

## Core Principles

1. **Reusability** — Widgets MUST be reused across multiple pages
2. **Self-Sufficient** — Each widget is a complete, independent UI block
3. **Composition** — Widgets compose from features, entities, and shared

## When to Create a Widget

✅ **YES**: UI block reused on 2+ pages, page layouts, multiple large independent blocks
❌ **NO**: UI used only on ONE page → keep in `screens/{page}/ui/`

## Import Rules

```
widgets/ → features, entities, shared
```

**Never import from:** `app/`, `screens/`, other widgets

## Structure Pattern

```
widgets/{widget-name}/
├── ui/
│   └── {widget-name}.tsx
├── model/                  # Widget state (optional)
└── index.ts
```

## Examples

### Header Widget

```tsx
// widgets/layout/ui/header.tsx
export default function Header() {
  return (
    <header>
      <nav>...</nav>
      <UserMenu />
    </header>
  );
}
```

## Decision Guide

| Scenario                | Location             | Reason              |
| ----------------------- | -------------------- | ------------------- |
| Header, Footer, Sidebar | `widgets/`           | Reused across pages |
| Page layout template    | `widgets/`           | Reused structure    |
| Complex form used once  | `screens/{page}/ui/` | Not reused          |

## Anti-Patterns

❌ Create widget for UI used only on one page
❌ Put mutation logic directly in widgets → use features
❌ Import from screens or other widgets
