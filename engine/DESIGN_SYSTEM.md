# Sentinel — Design System

## Aesthetic Direction

**Direction**: Industrial/Utilitarian — serious tool for serious data.
**Mood**: Calm authority. Like a well-designed cockpit instrument panel. The data is the interface. Nothing competes for attention unless it genuinely needs it.

## Anti-Patterns (Hard Rules)

- No gradients (except sidebar logo accent)
- No shadows on cards
- No glows or glassmorphism
- No decorative blobs
- No purple gradients
- No colored icon circles
- No centered-everything layouts
- No bouncy animations
- No spring physics

## Typography

Font: **Geist** (display + body), **Geist Mono** (code). Loaded via `next/font/local` or `geist` package.

```
display:     24px  font-semibold  text-foreground
title:       16px  font-medium    text-foreground
body:        14px  font-normal    text-foreground
body-muted:  14px  font-normal    text-muted-foreground
label:       11px  font-medium    uppercase tracking-wider text-muted-foreground
kpi-value:   28px  font-semibold  tabular-nums text-foreground
kpi-label:   11px  font-medium    uppercase tracking-wider text-muted-foreground
caption:     12px  font-normal    text-muted-foreground/60
code:        13px  Geist Mono
```

## Color Palette

### Dark Mode (Default)

```
Backgrounds:
  page:          #0a0a0a   hsl(0, 0%, 4%)
  cards:         #141414   hsl(0, 0%, 8%)
  nested:        #1a1a1a   hsl(0, 0%, 10%)
  hover:         #1f1f1f   hsl(0, 0%, 12%)

Borders:
  default:       rgba(255, 255, 255, 0.08)
  active:        rgba(255, 255, 255, 0.15)

Text:
  primary:       #ededed   hsl(0, 0%, 93%)
  secondary:     #808080   hsl(0, 0%, 50%)
  tertiary:      #4d4d4d   hsl(0, 0%, 30%)

Accent (Emerald Green):
  primary:       #10b981   (buttons, links, active nav, charts)
  foreground:    #022c22   (text on primary buttons)
  muted:         rgba(16, 185, 129, 0.10)   (badge backgrounds)
  bright:        #0df2b9   (status dots, "Live" badge ONLY — small accents)
```

### Light Mode

```
Backgrounds:
  page:          #ffffff
  cards:         #fafafa
  nested:        #f5f5f5
  hover:         #f0f0f0

Borders:
  default:       #e5e5e5
  active:        #cccccc

Text:
  primary:       #171717
  secondary:     #737373
  tertiary:      #a3a3a3

Accent:
  primary:       #059669   (emerald-600 for WCAG AA on white)
  foreground:    #ffffff
```

### Semantic Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| danger | #ef4444 | #dc2626 | CRITICAL risk, destructive actions |
| warning | #f59e0b | #d97706 | ELEVATED risk, caution |
| success | #10b981 | #059669 | LOW risk, healthy (same as primary) |
| info | #3b82f6 | #2563eb | Informational (use sparingly) |

### Color Usage Rules

1. Primary green: active nav, primary buttons, positive metrics, chart lines, links
2. Primary-bright (#0df2b9): ONLY status dots, "Live" badge, very small accents
3. Red: ONLY CRITICAL risk badges, destructive buttons, error states
4. Amber: ONLY ELEVATED risk badges, warning alerts
5. No other colors. Everything else is grayscale.
6. Badge backgrounds use `-muted` variant (10% opacity)

## Risk Badges

```
LOW:       bg-emerald-500/10  text-emerald-400  text-xs font-medium px-2 py-0.5 rounded-md
ELEVATED:  bg-amber-500/10    text-amber-400    text-xs font-medium px-2 py-0.5 rounded-md
CRITICAL:  bg-red-500/10      text-red-400      text-xs font-medium px-2 py-0.5 rounded-md
```

Flat. No borders. No outlines. Muted background + colored text only.

## Spacing

Base unit: **4px**. Density: comfortable.

```
xs:    4px     (icon-to-text gaps)
sm:    8px     (tight element spacing)
md:    16px    (card gap, standard spacing)
lg:    20px    (card padding)
xl:    24px    (section gap)
2xl:   32px    (major section separation)
3xl:   48px    (page-level separation)
```

Specifics: card padding `p-5` (20px), card gap `gap-4` (16px), section gap `gap-6` (24px), page padding `px-6` (24px).

## Layout

- Grid: 12-column at desktop, 1-column at mobile
- Max content width: 1400px (`max-w-[1400px]`)
- Common splits: 50/50, 60/40, full-width

## Cards

```
Background:  bg-[#141414]  (var(--surface))
Border:      border border-white/[0.08]
Radius:      rounded-lg (8px)
Padding:     p-5 (20px)
Hover:       hover:border-white/[0.12]  (subtle border brightening only)
Shadows:     NONE
Gradients:   NONE
```

## Border Radius

```
sm:    6px     (badges, small buttons, inputs)
md:    8px     (cards, dropdowns, popovers)
lg:    12px    (modals, large panels, dialogs)
full:  9999px  (avatars, status dots, pills)
```

## Motion

Minimal-functional. No spring, no bounce.

```
Micro:   50-100ms   (button press, checkbox)
Short:   150ms      (hover, tooltips)
Medium:  200ms      (panel expand, tab switch)
Long:    300ms      (modal enter/exit, page transition)

Enter:   ease-out
Exit:    ease-in
Move:    ease-in-out
```

## Component Patterns

### Stat Card (KPI)

```
+---------------------------+
|  LABEL            [icon]  |  11px uppercase tracking-wider muted
|  42.8             ^ 12%   |  28px semibold tabular-nums + trend
|  Description text         |  12px muted
+---------------------------+
```

Max 4 per row. Label on top, large number as hero, optional trend + sparkline.

### Data Table

- No zebra stripes
- Row separator: `border-b border-white/[0.04]`
- Row hover: `hover:bg-white/[0.02]`
- Header: `text-xs uppercase tracking-wider text-muted-foreground`
- First column: avatar circle + name

### Sidebar Gradient (Exception)

The sidebar logo area is the ONE place a gradient is permitted:

```css
background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
```

Small, branded, does not compete with data. No other gradients anywhere.

## Theme Toggle

Dark mode is default. Light theme available via toggle in header. Preference persists via localStorage. Both themes share identical typography, spacing, border radius, motion, and layout.
