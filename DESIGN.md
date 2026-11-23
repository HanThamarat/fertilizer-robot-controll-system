---
name: Fertilizer Robot Control
description: A GitHub-dark operator console for field hardware, where the live link state is read first.
colors:
  accent-blue: "#4493f8"
  action-green: "#238636"
  action-green-hover: "#29903b"
  action-green-active: "#2e9a40"
  signal-green: "#3fb950"
  signal-amber: "#d29922"
  signal-red: "#f85149"
  canvas-inset: "#010409"
  canvas: "#0d1117"
  canvas-subtle: "#151b23"
  overlay: "#161b22"
  control-bg: "#212830"
  control-bg-hover: "#262c36"
  border: "#3d444d"
  border-muted: "#30363d"
  fg: "#e6edf3"
  fg-muted: "#8d96a0"
  fg-placeholder: "#6e7681"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Noto Sans\", Helvetica, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.25
  headline-auth:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Noto Sans\", Helvetica, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 300
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Noto Sans\", Helvetica, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
  section:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Noto Sans\", Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Noto Sans\", Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Noto Sans\", Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, monospace"
    fontSize: "12px"
    fontFeature: "\"tnum\""
rounded:
  sm: "4px"
  md: "6px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.action-green}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.action-green-hover}"
  button-primary-active:
    backgroundColor: "{colors.action-green-active}"
  button-default:
    backgroundColor: "{colors.control-bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    height: "32px"
  button-default-hover:
    backgroundColor: "{colors.control-bg-hover}"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    height: "32px"
  box:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  box-auth:
    backgroundColor: "{colors.canvas-subtle}"
    rounded: "{rounded.md}"
    padding: "16px"
  link-pill:
    textColor: "{colors.fg}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "28px"
    padding: "0 10px"
  header:
    backgroundColor: "{colors.canvas-inset}"
    height: "56px"
    padding: "0 16px"
  nav-item:
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    height: "32px"
---

# Design System: Fertilizer Robot Control

## Overview

**Creative North Star: "The Hardware Repo"**

The console reads like a repository page for a machine: a near-black canvas, hairline-bordered boxes, quiet system type, and one live signal that says whether the machine can be heard at all. It is a developer-tool shell in the spirit of GitHub's dark theme, pinned by the user, applied to field hardware. Calm and dense rather than dramatic; state is shown in words and small colored dots, never in glowing metrics.

Depth comes from three canvas tones and 1px borders, not from shadows. Color is reserved: blue means "you can follow or focus this", green means "commit this action" or "alive", amber and red mean the link is uncertain or gone. Everything else is grey on near-black.

The system refuses the neon "IoT dashboard": gradient cards, hero metrics and glow. Honest empty states stand where data does not yet exist.

**Key Characteristics:**
- Near-black tonal layers (inset header, canvas, subtle surface) separated by hairline borders.
- One radius (6px) on nearly everything; pills only for live status.
- System UI type at a 14px base; mono only for machine identifiers (endpoints, IDs); times use tabular numerals in the UI face.
- Green primary actions, blue links and focus, status hues used only for status.
- The realtime link pill as the signature element, in the header and echoed in page content.

## Colors

A GitHub-dark neutral ramp with a blue interaction accent, a green commit color, and a three-hue status set.

### Primary
- **Focus Blue** (accent-blue): links, focus outlines, input focus border and ring, text caret, selection tint. The color of "this is navigable or focused", never a fill for actions.

### Secondary
- **Commit Green** (action-green, with hover and active steps): the fill of primary buttons only. One per form or view.

### Tertiary (status)
- **Live Green** (signal-green): link online, and the leaf of the product mark.
- **Pending Amber** (signal-amber): link connecting, warnings.
- **Fault Red** (signal-red): link offline, errors. Error alerts use it at 10% fill with a 40% border.

### Neutral
- **Inset Black** (canvas-inset): the sticky app header only.
- **Canvas** (canvas): page background, sidebar, data boxes, inputs.
- **Subtle Canvas** (canvas-subtle): the raised form box on sign-in.
- **Overlay** (overlay): dropdowns, drawers and other floating antd surfaces.
- **Control Grey** (control-bg / control-bg-hover): default (secondary) buttons.
- **Border** (border): control and pill outlines, avatar ring, scrollbar thumb.
- **Muted Border** (border-muted): hairlines between header, sidebar, page head, boxes and box rows.
- **Foreground** (fg): body and heading text.
- **Muted Foreground** (fg-muted): descriptions, row labels, breadcrumb separators, empty-state icons.
- **Placeholder** (fg-placeholder): input placeholders only.

Neutral hover and selected fills are translucent grey, not new solids: rgba(101,108,118,0.2) for hover, 0.3 for selected nav items.

### Named Rules
**The Green Means Go Rule.** Commit Green fills only the primary action; Focus Blue never fills a button. A screen has at most one green button.

**The Status Hue Rule.** Live Green, Pending Amber and Fault Red appear only to report state (link, alerts, validation). They are never decoration.

## Typography

**Display Font:** none; the system has no display face.
**Body Font:** the system UI stack (-apple-system, Segoe UI, Noto Sans, Helvetica, Arial).
**Label/Mono Font:** ui-monospace stack (SF Mono, Menlo, Consolas) with tabular numerals.

**Character:** Native and unadorned, so the interface reads as a tool rather than a brand surface. This is the GitHub world's own material, not a fallback.

### Hierarchy
- **Headline** (400, 24px, 1.25): page titles in the page head row.
- **Headline, auth** (300, 24px, -0.01em): the single sign-in heading, centered and balanced.
- **Title** (600, 20px): empty-state headings inside a box.
- **Section** (600, 16px): section headings above a box.
- **Body** (400, 14px, 1.5): everything else; descriptions cap at 52ch in empty states.
- **Label** (500, 12px): the link pill, account meta, footnotes.
- **Mono** (12px, tabular): endpoints, device identifiers, inline code.
- **Tabular** (body face with tabular numerals): timestamps and other changing numbers, so digits do not jitter.

### Named Rules
**The Machine Values Rule.** Mono is for machine identifiers (endpoints, IDs). Times and readable numbers stay in the UI stack with tabular numerals. Prose and labels stay in the UI stack.

## Layout

An app shell: a sticky 56px header across the top, a 248px sticky sidebar on desktop (lg, 992px and up), and a content column padded 24px 32px 48px. Pages fill the full content width and start with a page head row (title and one-line description, a muted hairline below, 16px under the text, 24px before content). Sections stack with 32px between them; each section is a 16px heading and a bordered box 8px below.

Below lg the sidebar becomes a 280px left drawer opened from a header menu button, and the breadcrumb drops its root crumb. Below 768px content padding tightens to 16px 16px 40px. Below sm (576px) the header link pill drops its "Realtime" prefix to a screen-reader-only word and shows only the short state label. Below 544px key/value box rows stack label over value.

Spacing runs on a 4px grid: 4, 8, 12, 16, 24, 32, 48. Sign-in is a centered 340px column, 40px from the top (72px at 768px and up).

## Elevation & Depth

Flat. Surfaces are separated by tone (inset, canvas, subtle) and 1px borders. Buttons carry no shadow; input focus is a 1px Focus Blue ring, not a glow. Only antd's floating overlays (dropdowns, tooltips, drawers) keep their default elevation, because they genuinely float.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px Muted Border lines, not shadows or fills. If two regions need separation, add a border.

## Shapes

One radius: gently squared corners (6px) on buttons, inputs, boxes, nav items, breadcrumb links and the brand link. Inline code tightens to 4px. Fully round shapes are reserved for live status (the link pill and its dot) and the avatar. Boxes clip their rows (overflow hidden) so row dividers meet the rounded border cleanly.

## Components

### Buttons
Quiet and solid, 32px tall, 6px radius, weight 500, no shadow.
- **Primary:** Commit Green fill, white text; hover and active step lighter.
- **Default:** Control Grey fill with a Border outline and Foreground text; hover lifts to the lighter grey, border unchanged.
- **Focus:** a 2px Focus Blue outline (global focus-visible rule).

### Cards / Containers (the Box)
- **Corner Style:** 6px.
- **Background:** Canvas in the dashboard (the border carries the shape); Subtle Canvas for the sign-in form box. A secondary sign-in box is transparent.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px Muted Border; rows divided by the same hairline.
- **Internal Padding:** 12px 16px per key/value row (160px label column, muted labels); 16px for form boxes; 48px 24px for centered empty states (24px muted icon, 20px title, short muted copy).

### Inputs / Fields
- **Style:** Canvas fill, 1px Border stroke, 6px radius, 32px tall; labels above in Foreground at weight 500.
- **Focus:** border turns Focus Blue with a 1px Focus Blue ring.
- **Autofill:** browser autofill is repainted to Canvas with Foreground text and a Focus Blue caret, so saved credentials never flash a light field.
- **Error:** antd's error state in Fault Red; form errors also surface as a dismissible red-tinted alert above the box.

### Navigation
- **Header:** Inset Black, 56px, Muted Border underneath; holds the menu button (mobile), the 32px product mark, a slash breadcrumb (root as a link, current page in weight 600), then the link pill and a 32px avatar button at the end.
- **Sidebar menu:** 32px items, 6px radius, 8px side inset, 16px icons, Foreground text. Hover is a 20% translucent grey fill, selected a 30% fill with weight 600. No active bar.
- **Mobile:** the same menu inside a left drawer titled with the mark and product name.

### Realtime Link Pill (signature)
A 28px pill with a Border outline holding an 8px status dot and "Realtime · Live / Connecting / Offline" in the 12px label style. The dot takes Live Green, Pending Amber or Fault Red; offline also tints the outline red at 40%. When the link comes up the online dot pulses once (scale to 2.6x and fade, 2.4s, ease-out-expo) and then holds steady; only connecting keeps a repeating 1.2s ping, so motion means "still trying". Offline is still. The ping is removed under reduced motion. A tooltip gives the hint and the time of the last change. On narrow screens it keeps a visible short label ("Live", "Connecting", "Offline") with "Realtime" read only by screen readers; it never shrinks to a bare dot. It sits in the header and is repeated in page content where link state is discussed; only the header instance is the polite live region, so changes are announced once.

### Product Mark
A sprout over a ground line: two leaves in Live Green and a slightly deeper green (#2ea043) on a 32px grid, the ground line in Foreground. 32px in the header, 24px in the drawer, 48px above the sign-in heading.

## Do's and Don'ts

### Do:
- **Do** build every content region as a bordered box (1px Muted Border, 6px radius) under a 16px semibold section heading.
- **Do** keep one Commit Green primary button per view; secondary actions use the grey default button.
- **Do** show link and device state as a colored dot plus a word, and put the realtime link pill in the header of every authenticated screen.
- **Do** set endpoints and IDs in the 12px mono style; set timestamps in the body face with tabular numerals.
- **Do** use honest empty states (muted icon, title, one sentence) where data does not exist yet.
- **Do** keep steady states still: one pulse on reaching online, a repeating ping only while connecting. Under reduced motion all pings stop and state is carried by color and text.
- **Do** write status and empty-state copy in operator language; no library, service or command names.

### Don't:
- **Don't** use shadows, gradients or glow on cards or buttons; depth is tone and hairlines.
- **Don't** fill buttons with Focus Blue, or use the status hues for decoration.
- **Don't** introduce radii other than 6px (4px for inline code, full round for status pills, dots and avatars).
- **Don't** add hero metrics or invented device readings; placeholders must say they are placeholders.
- **Don't** copy GitHub's logo, name or branding; the world borrows the feel only.
