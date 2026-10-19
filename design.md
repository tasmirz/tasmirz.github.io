# Design System & Technical Aesthetics: Portfolio

This document outlines the design principles, color system, typography, motion semantics, layout architecture, and generative SVG artwork rules derived from the existing portfolio codebase.

---

## 1. Aesthetic Philosophy: Retro-Earthy Computational Warmth

The portfolio pairs a classic **Gruvbox-inspired earth tone palette** with an interactive WebGL canvas and retro terminal/pixel accents.
- **Warm Canvas, Dark Depth**: Evokes aged paper, amber screens, tactile notebooks, and UNIX terminal environments.
- **Functional Minimalism with Micro-Motion**: Clean structural grids with fluid scroll-driven transformations, progressive typewriter headers, interactive WebGL milestone trajectories, and blur-scaled cards.
- **Duality**: Seamless toggle between Light (Gruvbox Light Warm) and Dark (Gruvbox Dark Soft) with calibrated contrast ratios and subtle sepia filtering.

---

## 2. Color System & Design Tokens

### 2.1 Gruvbox Light Palette (Default Warm Paper)
| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-bg` | `#fbf1c7` | Primary canvas / background |
| `--color-bg-rgb` | `251, 241, 199` | Backdrop opacity channel |
| `--color-bg-secondary` | `#f2e5bc` | Secondary card fills & active tabs |
| `--color-text` | `#282828` | Primary body typography & dark ink |
| `--color-nav-text` | `#3c3836` | Navigation items & section anchors |
| `--color-accent` | `#504945` | Subtle emphasis & typewriter cursor |
| `--color-primary` | `#504945` | Buttons, badges, and primary borders |
| `--color-primary-dark` | `#3c3836` | Button hover states & dark accents |
| `--color-primary-light`| `#665c54` | Card outlines & muted labels |
| `--color-highlight-bg` | `rgb(214, 57, 91)` | Vivid raspberry highlight & callouts |
| `--lyf-filter` | `sepia(0.8)` | Warm antique tone applied to canvas textures |

### 2.2 Gruvbox Dark Palette (`[data-theme="dark"]`)
| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-bg` | `#282828` | Charcoal dark canvas |
| `--color-bg-rgb` | `40, 40, 40` | Backdrop opacity channel |
| `--color-bg-secondary` | `#3c3836` | Surface cards & recessed blocks |
| `--color-text` | `#ebdbb2` | Soft warm parchment typography |
| `--color-nav-text` | `#d5c4a1` | Muted navigation & subtitles |
| `--color-accent` | `#a89984` | Accent borders & typewriter cursor |
| `--color-primary` | `#928374` | Active borders & neutral badges |
| `--color-primary-light`| `#a89984` | Card hover borders |
| `--color-primary-lighter`| `#bdae93` | High-contrast details |
| `--color-highlight-bg` | `pink` / `#d6395b` | Soft berry highlight |
| `--lyf-filter` | `sepia(0.8) brightness(0.5)` | Dimmed nocturnal canvas grading |

---

## 3. Typography & Iconography

- **Primary Typeface**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Clean readability across high-DPI displays.
- **Monospace Stack**: `"Courier New", monospace`
  - Code references, tags, terminal commands, and metadata indicators.
- **Iconography**: Embedded `Material Icons` via `/assets/icons.woff2`
  - Self-hosted for zero external latency and strict offline resilience.

---

## 4. Spacing, Sizing & Layout Hierarchy

- **Global Spacing Scales**:
  - `xs`: `0.25rem` (4px)
  - `sm`: `0.5rem` (8px)
  - `md`: `1rem` (16px)
  - `lg`: `2rem` (32px)
  - `xl`: `3rem` (48px)
- **Responsive Padding**:
  - Desktop: `20%` horizontal gutter
  - Tablet: `10%` horizontal gutter
  - Mobile: `8%` horizontal gutter
- **Card Metrics**:
  - Border radius: `var(--project-border-radius)` (20px)
  - Backdrop blur: `20px` with glassmorphic transparency (`rgba(var(--color-bg-rgb), 0.5)`)
  - Shadows: Subtle double-layer drop shadows (`rgba(0,0,0,0.1)` and `rgba(0,0,0,0.2)`)

---

## 5. Component Semantics & Motion

### 5.1 Hero & Navigation
- Fixed header (`60px`) with blur backdrop and quick anchor jumps (`#welcome`, `#about`, `#projects`, `#lyf`, `#contact`).
- Real-time scroll progress line running across the viewport ceiling.
- Dynamic typewriter title cycling through multi-role descriptors with blinking cursor.

### 5.2 Projects Showcase
- Stacked cards with scroll-driven transformation (scale, blur reduction, and slide-in from right).
- Tech pill badges styled in dark Gruvbox tones with hover bounce.
- Direct external links to GitHub code repositories and live demos.

### 5.3 WebGL Interactive LYF Section
- 2D/3D WebGL timeline renderer mapping milestone coordinates along an organic visual path.
- Dual navigation: smooth wheel/touch scroll lock and directional D-pad controls for tactile exploration.
- Milestone banner fading in contextual milestone names dynamically.

---

## 6. Procedural SVG Hue Pattern Architecture for Images

Instead of generic or slow placeholder services (`via.placeholder.com`), images utilize **custom vector SVG hue patterns** tuned to the Gruvbox color matrix:

1. **Aspect Ratio & Canvas**: `600x360` (5:3 / 16:9 responsive viewBox), sharp geometry.
2. **Color Harmony**:
   - Base canvas: `#282828` or `#3c3836` (deep Gruvbox ground)
   - Primary pattern traces: `#504945`, `#665c54`, `#7c6f64`
   - Highlighting lines & nodes: `#8ec07c` (aqua), `#fabd2f` (yellow), `#fe8019` (orange), `#b8bb26` (green), `#fb4934` (red), `#d3869b` (purple)
   - Accent typography: `#ebdbb2` / `#fbf1c7`
3. **Generative Themes per Project Category**:
   - **Computer (Hardware/RISC)**: Architectural bus layouts, logic gates, ALU pipelines, clock cycle waveforms.
   - **EyeWear (Vision/Assistive)**: Optical lens cross-sections, neural OCR scanning mesh, WebRTC wave signals.
   - **jagoo-bahee (App/Utility)**: Dynamic isometric matrix nodes, modular data pipes.
   - **lumina (E-Reader)**: Reflowable typographic grids, book fold lines, calm harmonic contours.
   - **Chirkut (E2EE Messaging)**: Cryptographic key vectors, padlock geometry, cipher-block lattices.
   - **cse3200 (Systems & Labs)**: Kernel rings, memory page tables, network graph topologies.

All patterns are standalone, valid vector SVGs, embeddable directly in HTML or uploaded to Sanity Asset CDN.
