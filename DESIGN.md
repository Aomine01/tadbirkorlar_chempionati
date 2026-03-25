# Design System Specification: The Sovereign Architect

## 1. Overview & Creative North Star
This design system is built to convey the prestige, authority, and high-stakes nature of a national entrepreneurship championship. Moving away from the generic "tech-startup" aesthetic, we adopt a Creative North Star titled **"The Sovereign Architect."**

The aesthetic is characterized by monolithic structures, high-contrast editorial typography, and an uncompromising commitment to whitespace. We break the "template" look through **intentional asymmetry**—where content is weighted heavily to one side to create a sense of forward motion—and **tonal depth**, replacing traditional borders with sophisticated background shifts. This is a digital environment that feels like a premium broadsheet or a high-end government pavilion: structured, serious, and permanent.

---

## 2. Colors: Tonal Authority
The palette is rooted in a deep, authoritative purple (`primary: #3800b6`), supported by a sterile, clean white (`surface_container_lowest: #ffffff`) and a sophisticated range of cool grays.

### Core Tokens
- **Primary:** `#3800b6` (The mark of leadership and the championship’s identity)
- **Primary Container:** `#4f28d9` (For active states and hero highlights)
- **On-Surface:** `#1b1b1e` (Used for primary text to ensure maximum legibility)
- **Surface:** `#faf9fc` (The canvas for the entire experience)

### The "No-Line" Rule
To achieve a high-end editorial feel, designers are **strictly prohibited from using 1px solid borders** for sectioning or card definition. Boundaries must be defined solely through background color shifts.
- A card should not have a border; it should be a `surface_container_lowest` (#ffffff) shape sitting on a `surface_container_low` (#f5f3f7) background.
- This creates a "soft-edge" hierarchy that feels integrated into the layout rather than a collection of disconnected boxes.

### Signature Textures
For Hero sections or primary Call-to-Actions, use a subtle linear gradient transitioning from `primary (#3800b6)` to `primary_container (#4f28d9)` at a 135-degree angle. This adds a "weighted" feel to the elements, providing a professional polish that flat color cannot replicate.

---

## 3. Typography: Editorial Gravity
We use **Inter** as our typographic workhorse. The hierarchy is designed to mimic a formal government document reimagined for the digital age, utilizing extreme weight contrast to guide the eye.

- **Display Scale:** Use `display-lg` (3.5rem) and `display-md` (2.75rem) in **Bold (700)** for hero statements. These should often be left-aligned with significant bottom margin (`spacing-12`) to create an "Editorial Anchor."
- **Headline Scale:** `headline-lg` (2rem) should be used for section titles. Pair these with a `primary` color accent—perhaps a small vertical bar or a tonal background shift—to signify the start of a new chapter in the user journey.
- **Body & Labels:** `body-lg` (1rem) is the standard for long-form content. Use a generous line height (1.6) to ensure the "whitespace" philosophy extends into the text itself. `label-md` should be used sparingly for metadata, always in **Medium (500)** or **Semi-Bold (600)** to maintain authority even at small sizes.

---

## 4. Elevation & Depth
In this system, depth is a function of **Tonal Layering**, not physics. We avoid "floating" elements that look like they are hovering over the page. Instead, the UI is treated as a series of stacked, high-quality surfaces.

- **The Layering Principle:** Stacking follows the surface hierarchy. 
  - **Level 0:** `surface` (#faf9fc) - The base background.
  - **Level 1:** `surface_container_low` (#f5f3f7) - Secondary content areas or "track" backgrounds.
  - **Level 2:** `surface_container_lowest` (#ffffff) - High-priority cards or input fields.
- **Ambient Shadows:** Shadows are reserved only for "Active" states or global navigation that must persist over content. Use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(27, 27, 30, 0.04)`. Note the extremely low opacity; the shadow should be felt, not seen.
- **The "Ghost Border" Fallback:** If a layout requires a separation that tonal shifts cannot achieve, use a "Ghost Border": `outline_variant (#c9c4d8)` at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components
All components must adhere to the `roundedness: md (0.375rem)` for a sharp, disciplined appearance.

### Buttons
- **Primary:** `primary` background with `on_primary` text. Use `spacing-3` vertical and `spacing-6` horizontal padding. No icons, unless it's a directional arrow.
- **Secondary:** `surface_container_highest` background. This should feel like it's carved out of the page.
- **Tertiary:** No background. Use `primary` text in **Bold** weight with a 2px bottom margin that expands on hover.

### Cards & Lists
- **Cards:** Forbid divider lines. Use `spacing-8` of vertical white space to separate content blocks. A card's title should always be `title-lg` in **Bold**.
- **Lists:** Instead of dividers, use alternating tonal backgrounds (`surface` and `surface_container_low`) for list items to create a "Zebra" effect that feels intentional and architectural.

### Input Fields
- **State Logic:** Fields use a `surface_container_lowest` background. The focus state is not a glow, but a 2px solid `primary` bottom border. This maintains the "formal government" feel by echoing the look of a physical form.

### Championship Progress Tracker
A bespoke component for this championship. Use a vertical, asymmetric line (2px wide, `outline_variant`) where active nodes are marked with a `primary` solid circle and completed nodes use a subtle `primary_fixed` fill.

---

## 6. Do's and Don'ts

### Do
- **Do** embrace extreme whitespace. If you think there is enough space, add `spacing-4` more.
- **Do** use `primary` sparingly as an accent to lead the user’s eye to the most important "Sovereign" action on the page.
- **Do** align text to a strict grid, but allow imagery or decorative accents to "break" the container, creating an editorial, high-end look.

### Don't
- **Don't** use Glassmorphism or "frosted" effects. This system is about solid, dependable, and transparent government authority.
- **Don't** use icons that are overly rounded or "bubbly." Stick to sharp, 2px stroke weight linear icons.
- **Don't** use center-alignment for long-form text. All "Architect" layouts are strictly left-aligned to maintain a structured, professional-grade hierarchy.
- **Don't** use pure black (#000000). Always use `on_surface` (#1b1b1e) to keep the contrast high but the tone sophisticated.