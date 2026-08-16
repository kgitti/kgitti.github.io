# Web Tools

## Guiding Principle

**Build Static and Simple Web Apps/Tools.** Greenfield, in-memory only (no real database), pre-production — don't factor in data migration.

## Developer Tool Suite Constraints

1. **Look and Feel**: Maintain the existing design direction (Compact Light Theme) — simple and clean.
2. **Compact & Space-Optimized**: Prioritize compactness and space efficiency; the display should feel wide and content-rich, suited for real-world use.
3. **Static Web & Local Web Cache**: Every feature must run as a static web app deployable on GitHub Pages, with a menu-switching system based on a Local Web Cache (in-memory/DOM switching) that allows instant page switching without a full reload, while preserving each tool's state across switches.

## Read This First, Every Time

- **Do NOT, under any circumstances, perform a Git commit or Git push to GitHub** unless the user explicitly instructs you to do so on a case-by-case basis.
- Interview me relentlessly about every aspect of this **plan until we reach a shared understanding**. Walk down each branch of the design tree, resolving dependencies between decisions one by one.
