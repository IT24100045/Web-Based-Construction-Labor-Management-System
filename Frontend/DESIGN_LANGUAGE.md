# General UI Design Language: Dark Slate & Safety Amber

A high-contrast, precision-engineered dark UI design language tailored for mission-critical dashboards, operations control centers, analytics platforms, and enterprise tooling.

---

## 1. Design System Overview

- **Aesthetic Archetype**: Modern Industrial High-Tech / Command Center Dark Mode.
- **Visual Tone**: Utilitarian, authoritative, robust, high-contrast, and precision-driven.
- **Lighting & Atmosphere**: Deep obsidian and midnight slate surfaces accented with glowing safety amber accents, subtle cyan/sky highlights, frosted glass surfaces, and a subtle background engineering blueprint grid.

---

## 2. Master System Prompt (For AI Coding Assistants & UI Generators)

> **Copy and paste this prompt into Claude, ChatGPT, Cursor, GitHub Copilot, v0, Lovable, or any AI coding tool to generate new interfaces adhering to this design language:**

```markdown
You are a Lead UI/UX Engineer specialized in modern enterprise dark-mode software interfaces. Build all components and views strictly following the "Dark Slate & Safety Amber" design language outlined below.

### 1. Visual Identity & Atmosphere
- Theme: High-tech industrial operations, engineering precision, modern dark SaaS.
- Base Theme: Deep obsidian canvas (#070b14) layered with dark slate cards (#131f37) and navy navigation bars (#0d1527).
- Background Effect: A subtle dual-layer grid texture (subtle amber dot-matrix radial gradient + subtle slate blueprint grid lines) with faint ambient glow spots (radial gradients of safety amber and sky blue with heavy blur).
- Elevation & Depth: Subtle borders (#20314f), soft dark elevation shadows, and selective amber neon outer glows on primary call-to-actions.

### 2. Typography Stack
- Display / Headings (h1 - h6): 'Outfit', system-ui, sans-serif (Weights: 600, 700, 800; tight letter-spacing: -0.02em).
- Body & Interface Text: 'Inter', system-ui, sans-serif (Weights: 400, 500, 600; line-height: 1.5).
- Numeric Data, Metrics, Codes, Timestamps & Identifiers: 'JetBrains Mono', monospace (Weights: 500, 600).

### 3. Color Tokens
- Canvas & Surfaces:
  * Canvas Background: #070b14 (Deep obsidian slate)
  * Secondary / Navigation / App Bars: #0d1527 (Midnight slate)
  * Card / Container Surfaces: #131f37 (Dark slate container)
  * Card Hover / Elevated: #1a2947
  * Form Inset Inputs: #0a1120
  * Modal Backdrops: rgba(4, 7, 15, 0.85) with backdrop-filter: blur(8px)
- Primary Brand & Action Accent (Safety Amber):
  * Primary: #f59e0b
  * Hover / Deep: #d97706
  * Glow / Light: #fbbf24
  * Subtle Tint / Badge BG: rgba(245, 158, 11, 0.12)
  * Button Shadow / Glow: 0 0 20px rgba(245, 158, 11, 0.25)
- Semantic Status Accents:
  * Success / Active / Approved: #10b981 | BG: rgba(16, 185, 129, 0.14)
  * Danger / Error / Alert / Critical: #f43f5e | BG: rgba(244, 63, 94, 0.14)
  * Informational / Secondary Accent: #38bdf8 | BG: rgba(56, 189, 248, 0.14)
  * Auxiliary / Special / Elevated State: #a855f7 | BG: rgba(168, 85, 247, 0.14)
- Text Colors:
  * Primary Text: #f8fafc (Near white)
  * Secondary Text: #94a3b8 (Cool muted slate)
  * Disabled / Tertiary Text: #64748b
- Borders:
  * Subtle: #20314f
  * Medium / Hover State: #2c426b
  * Active / Focus Ring: #f59e0b

### 4. Component Patterns
- Primary Buttons: Solid gradient `linear-gradient(135deg, #f59e0b, #d97706)` with deep black text `#000` (weight 700) for maximum high-contrast visibility and a soft amber glow shadow.
- Secondary Buttons: Dark container background `#131f37`, border `#2c426b`, primary text, transitioning to an amber border and amber text on hover.
- Cards & Metric Tiles: 14px rounded corners (`border-radius: 14px`), 1px border `#20314f`, dark slate fill, subtle hover translateY(-2px) elevation. Accompanied by 44-52px square icon badges with soft color-tinted backgrounds.
- Status Badges / Pills: Pill-shaped (`border-radius: 9999px`), 0.75rem uppercase bold text, 0.04em letter-spacing, containing a 6px glowing status dot.
- Form Inputs: Dark inset background `#0a1120`, 1px border `#20314f`, 10px rounded corners. On focus: active amber border `#f59e0b` and a 3px amber halo `box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15)`.
- Data Tables: High-density rows with frosted header `rgba(13, 21, 39, 0.7)`, uppercase tracking headers, subtle 1px divider lines, and hover highlight on rows. Numerical figures formatted with monospaced typography.
- Modals & Drawers: Centered dialogs with dark slate surfaces, subtle borders, backdrop blur, sticky headers and footers.
- Iconography: Monoline technical icons (e.g. Lucide Icons) with matching accent colors.
```

---

## 3. Rapid Prototyping Prompt (For v0 / Lovable / Bolt / Tailwind)

> **Use this concise prompt for quick UI generators and rapid scaffolding:**

```text
A dark-mode high-tech operations dashboard and management console.
Style: Industrial dark slate (#070b14, #0d1527, #131f37) with high-visibility safety amber accents (#f59e0b, #fbbf24) and subtle amber glow effects.
Typography: Bold geometric sans-serif for headings (Outfit), clean neutral sans for body (Inter), and monospaced font for numerical metrics, codes, and timestamps (JetBrains Mono).
Design details: Subtle background blueprint/dot-matrix grid, frosted glass navigation bars (backdrop-filter: blur(16px)), elevated dark cards with 1px slate borders (#20314f), rounded-xl corners (14px), metric cards with square icon badges, status pills with glowing indicator dots (green for active/healthy, amber for warning/pending, rose for critical/offline), high-contrast safety-amber gradient buttons with bold black text, and clean data tables with monospace numbers.
```

---

## 4. UI Concept Mockup Prompt (For Midjourney / Imagen / DALL-E)

> **Use this prompt to generate realistic UI screenshots and visual design concepts:**

```text
UI/UX dashboard design of a modern high-tech enterprise operations platform, desktop web application, dark industrial aesthetic, deep obsidian slate and charcoal background with subtle blueprint grid texture, glowing safety amber and hazard yellow accent buttons, KPI metric cards, data tables with monospaced figures, clean minimalist layout, glassmorphism blur effects, crisp typography, Figma style, Behance trending, high resolution, 8k --ar 16:9
```

---

## 5. CSS Tokens & Design Variables Reference

```css
:root {
  /* Canvas & Containers */
  --bg-primary: #070b14;
  --bg-secondary: #0d1527;
  --bg-card: #131f37;
  --bg-card-hover: #1a2947;
  --bg-card-alt: #17233d;
  --bg-input: #0a1120;
  --bg-modal-backdrop: rgba(4, 7, 15, 0.85);

  /* Borders */
  --border-subtle: #20314f;
  --border-medium: #2c426b;
  --border-active: #f59e0b;
  --border-danger: #f43f5e;

  /* Primary Accent: Safety Amber */
  --amber-primary: #f59e0b;
  --amber-hover: #d97706;
  --amber-light: #fbbf24;
  --amber-glow: rgba(245, 158, 11, 0.2);
  --amber-bg: rgba(245, 158, 11, 0.12);

  /* Semantic Accents */
  --emerald: #10b981;
  --emerald-hover: #059669;
  --emerald-bg: rgba(16, 185, 129, 0.14);

  --rose: #f43f5e;
  --rose-hover: #e11d48;
  --rose-bg: rgba(244, 63, 94, 0.14);

  --sky: #38bdf8;
  --sky-hover: #0284c7;
  --sky-bg: rgba(56, 189, 248, 0.14);

  --purple: #a855f7;
  --purple-bg: rgba(168, 85, 247, 0.14);

  /* Typography */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-dark: #070b14;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Outfit', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Elevation & Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.6);
  --shadow-amber: 0 0 20px rgba(245, 158, 11, 0.25);
  --shadow-glow: 0 0 25px rgba(56, 189, 248, 0.18);

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 6. Background Blueprint Texture Snippet

To recreate the subtle technical background:

```css
body {
  background-color: var(--bg-primary);
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px),
    linear-gradient(to right, rgba(32, 49, 79, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(32, 49, 79, 0.1) 1px, transparent 1px);
  background-size: 32px 32px, 64px 64px, 64px 64px;
  pointer-events: none;
  z-index: 0;
}
```
