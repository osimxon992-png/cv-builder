---
name: CV Builder
description: A trilingual CV builder drawn as a suminagashi basin, indigo ink on still water.
colors:
  ink: "#0a1a33"
  ink-current: "#1e2d4a"
  ink-soft: "#4f5c72"
  feather: "#aeb6c2"
  line: "#cdd4dd"
  mist: "#dde2e8"
  desk: "#eaedf1"
  water: "#f6f7f9"
  paper: "#ffffff"
  danger: "#a3261b"
  danger-tint: "#fbeceb"
  ok: "#1d6b4a"
typography:
  display:
    fontFamily: "Jost, Noto Sans, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 3vw + 1rem, 3.9rem)"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Jost, Noto Sans, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2vw + 1rem, 2.4rem)"
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Jost, Noto Sans, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 500
    lineHeight: 1.12
  body:
    fontFamily: "Jost, Noto Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Jost, Noto Sans, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 500
    letterSpacing: "0.16em"
rounded:
  sheet: "1px"
  base: "2px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.water}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink-current}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "10px 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.water}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.base}"
  button-ghost-hover:
    backgroundColor: "{colors.desk}"
    textColor: "{colors.ink}"
  button-light:
    backgroundColor: "{colors.water}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "10px 12px"
  badge-premium:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.water}"
    rounded: "{rounded.pill}"
    padding: "2px 9px 2px 7px"
  badge-free:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "2px 9px 2px 7px"
---

# Design System: CV Builder

## Overview

**Creative North Star: "The Suminagashi Basin"**

Every surface is still water with ink on it. Light, cool water is the ground; indigo ink is text, action and emphasis; the newest or most important thing is always the darkest ink. Marbling is drawn live on a Canvas 2D basin (drop and tine transforms, area-preserving) on the home hero, as a quiet still sheet behind the page heads of Templates, Dashboard and Pricing, and inverted (pale ink on indigo water) in the home close band. It settles to a static pattern under reduced motion.

The rest of the interface is spare: hairline 1px rules instead of boxes, square 2px corners, thin large Jost headlines, tracked uppercase labels, filled indigo primary and outlined secondary actions. Density is calm on marketing pages and tighter in the editor, dashboard and admin, which share the same tokens without the hero ink.

**Key Characteristics:**
- One hue family (indigo to water) carries the whole site; red and green appear only as status.
- Ink is a live canvas medium, never a CSS gradient or a static image.
- Hairline rules divide; fills and shadows are reserved for ink objects and floating sheets.
- Light display weights (300) at large sizes; weight 500 only for labels, titles and actions.

## Colors

A monochrome indigo-and-water palette with two status colors.

### Primary
- **Indigo Depth** (ink): body text, primary buttons, active nav underline, focus ring, selection, premium badge and the night close band's water.
- **Ink Current** (ink-current): hover state of filled ink; second-darkest marbling drop.

### Neutral
- **Dilute Ink** (ink-soft): secondary text, inactive nav, hints. Darker than the marbling's pigment value (#606d80) so text clears 4.5:1 on water.
- **Feathered Gray** (feather): link underlines, quiet step numerals, free-badge ring, labels on the night band, scrollbar.
- **Hairline** (line): every 1px rule and field border.
- **Mist** (mist): alternate section ground, template desk behind thumbnails, PDF frame.
- **Desk** (desk): hover wash for ghost and icon buttons, neutral notices, disabled fields.
- **Still Water** (water): page ground; text on ink.
- **Paper** (paper): fields, entry cards and template sheets, which sit on the water.

### Status
- **Cinnabar** (danger) with **Cinnabar Wash** (danger-tint): errors, required marks, destructive actions.
- **Pine** (ok): saved state, success toast, plan feature ticks.

### Named Rules
**The Newest Ink Rule.** The most recent or most important element is the darkest ink: the active step, the selected language drop, the premium plan, the latest marbling drop.

**The One Hue Rule.** Outside status, nothing leaves the indigo-to-water ramp. The PDF CV templates in `src/pdf/templates.jsx` and their thumbnails keep their own per-template palettes; they are the product's documents, not the site's system. Only the "Ink" template echoes this palette.

## Typography

**Display Font:** Jost, self-hosted woff2 (Latin, Latin Extended for Uzbek o‘ g‘, Cyrillic), weights 300 to 600
**Body Font:** Jost (with Noto Sans fallback, the same face the PDFs use)

**Character:** A geometric sans used thin and large for headlines and small, tracked and uppercase for labels; one family does both voices.

### Hierarchy
- **Display** (300, clamp 2.2 to 3.9rem, 1.04): the home hero headline only, max 15ch.
- **Headline** (300, clamp 1.6 to 2.4rem, 1.12): section and page h2; page h1 runs clamp 2 to 3rem at the same weight.
- **Title** (500, 1.15rem): h3, card and template names.
- **Body** (400, 17px / 16px under 760px, 1.6): running text; leads at 1.12rem in dilute ink, max 58ch.
- **Label** (500, 0.72 to 0.86rem, 0.16em tracking, uppercase): buttons, nav, segmented tabs, table heads, the brand wordmark, plan column heads on the night band.
- **Numerals** (300, tabular): prices (2.6rem), admin stats (1.9rem), step numerals (3.4rem in feather).

### Named Rules
**The Thin-Large, Small-Tracked Rule.** Big type is light (300); small type that labels or acts is 500, uppercase, tracked 0.16em. No bold display.

## Layout

Centered container `min(1180px, 100% - 32px)`; editor uses a wider 1440px container. Pages pad 48px top, 80px bottom; home sections 96px (64px on phones). Home hero is a full-bleed basin `min(100svh - 68px, 880px)` tall with a 5:6 two-column grid, copy left; the canvas is masked to clear water behind the copy. Under 760px the basin becomes a 190px band across the top and the form sits on clear water below. Lists are divided by top hairlines (how-steps, benefits, CV list, admin stats) rather than boxed. Breakpoints: 1000px (editor preview collapses to a toggle, pricing stacks) and 760px (single column, nav scrolls horizontally on its own row). Sticky header 68px; `scroll-padding-top: 88px`.

## Elevation & Depth

Flat by default, with one soft, indigo-tinted, negative-spread shadow family for things that float on the water: template sheets, the floating headings panel in the hero, modals, toasts and primary-button hover. Structure everywhere else comes from hairlines and tonal grounds (water, mist, paper). Depth on the home page comes from the marbling itself.

### Shadow Vocabulary
- **Sheet** (`0 1px 2px rgba(10,26,51,0.08), 0 14px 30px -14px rgba(10,26,51,0.35)`): template paper sheets.
- **Lift** (`0 10px 24px -12px rgba(10,26,51,0.6)`): primary button hover.
- **Float** (`0 18px 40px -24px rgba(10,26,51,0.45)`): panels resting on the basin.
- **Modal** (`0 30px 80px -20px rgba(10,26,51,0.5)`) over an ink backdrop `rgba(10,26,51,0.55)`.

### Named Rules
**The Hairline Rule.** Divide with 1px `line` rules; a 1px `ink` rule marks the head of a list or the active tab. Do not box content that a rule can separate.

## Shapes

Square-cut: 2px corners on buttons, fields, notices, modals and cards; 1px on paper sheets. Circles are reserved for ink objects: language drops, step numbers, photo frames, badge dots, and the brand mark of nested ink-and-water rings. Pills (999px) only for badges and tags.

## Components

### Buttons
- **Shape:** square-cut (2px), min-height 44px (54px large, 34px minor), label type.
- **Primary:** filled ink on water text; hover shifts to ink current with the Lift shadow and nudges a trailing arrow 3px right.
- **Secondary:** 1px ink outline, transparent; hover fills with ink.
- **Ghost / Icon:** dilute ink text; hover gets a desk wash. **Light:** water fill, used on the night band and the premium plan.
- **Focus:** 2px ink outline, 3px offset, everywhere.

### Chips
- **Badges:** pill with a 7px circle dot; free is a feather ring, premium a solid ink drop on ink fill.
- **Tags:** paper pill with hairline border and a round remove button; error state in cinnabar wash.

### Cards / Containers
- **Entry cards:** paper, hairline border, 2px, 18px padding, tools sitting on the top edge.
- **Desk:** mist ground holding a paper sheet thumbnail; the current template gets a 1px ink outline offset 4px.
- **Plans:** three columns divided by hairlines inside one hairline frame; premium column is filled ink.

### Inputs / Fields
- **Style:** paper fill, 1px line border, 2px corners, 10px 12px padding; hover border feather.
- **Focus:** ink border plus a 3px `rgba(10,26,51,0.1)` halo, no outline.
- **Error / Disabled:** cinnabar border on cinnabar wash; disabled on desk in dilute ink.

### Navigation
- Sticky header on 94% water with a hairline below; brand ring mark plus tracked uppercase wordmark. Links are label type in dilute ink, ink on hover, active gets a 1px inset ink underline. Segmented tabs and the stepper follow the same logic; the active step number fills with ink.

### Ink Basin (signature)
Canvas 2D suminagashi: ink drops alternate with clear water drops, colored by recency (ink, ink current, #606d80, feather). Click or a language choice drops ink; pointer drag combs it. Variants: live hero, `calm` still sheet behind page heads (masked to fade left and down), and night (water #0a1a33, pale palette, 40% opacity). Capped vertex and drop counts for low-end phones; static under reduced motion.

### Ink Drop Radio
20px hairline ink circle; checked fills an inner drop that scales in over 0.5s on the system ease `cubic-bezier(0.16, 1, 0.3, 1)`.

## Do's and Don'ts

### Do:
- **Do** draw ink as live or still marbling through the Ink Basin; use CSS gradients only as masks that fade the canvas into water.
- **Do** keep the darkest ink for the newest or primary element (The Newest Ink Rule).
- **Do** use hairline rules (1px line / ink) to divide lists, plans and tables.
- **Do** keep big type at weight 300 and small acting labels at 500, uppercase, 0.16em.
- **Do** keep every animation on `cubic-bezier(0.16, 1, 0.3, 1)` and disable it under reduced motion.
- **Do** self-host Jost and keep Noto Sans as the fallback so Cyrillic and Uzbek Latin always render.

### Don't:
- **Don't** paint ink as a decorative gradient, blob image or static illustration.
- **Don't** introduce a second accent hue; red and green are status only.
- **Don't** round corners beyond 2px except true circles (ink objects) and pill badges/tags.
- **Don't** use hard, dark or offset shadows; depth is the soft indigo family above.
- **Don't** pull the PDF templates' per-template colors into site UI.
