// Shared category-accent class maps for the calendar views. Full literal
// strings so Tailwind keeps them at build time. Each includes dark-mode
// variants so accent text stays readable on a dark background.

// Large day-view block.
export const BLOCK_ACCENTS = {
  teal: {
    bg: "bg-brand/20",
    border: "border-brand-dark",
    title: "text-brand-ink dark:text-brand",
    sub: "text-brand-dark/70 dark:text-brand/80",
    badge: "bg-brand-dark/10 text-brand-dark dark:bg-brand/25 dark:text-brand",
  },
  gold: {
    bg: "bg-accent-gold/15",
    border: "border-accent-gold",
    title: "text-[#4a3a00] dark:text-amber-200",
    sub: "text-accent-gold/80 dark:text-amber-300/80",
    badge: "bg-accent-gold/10 text-accent-gold dark:bg-amber-400/20 dark:text-amber-300",
  },
  rust: {
    bg: "bg-cta/20",
    border: "border-accent-rust",
    title: "text-cta-text dark:text-cta",
    sub: "text-accent-rust/80 dark:text-cta/80",
    badge: "bg-accent-rust/15 text-accent-rust dark:bg-cta/20 dark:text-cta",
  },
};

// Compact block (week view).
export const COMPACT_ACCENTS = {
  teal: "bg-brand/20 border-brand-dark text-brand-ink dark:text-brand",
  gold: "bg-accent-gold/15 border-accent-gold text-[#4a3a00] dark:text-amber-200",
  rust: "bg-cta/20 border-accent-rust text-cta-text dark:text-cta",
};

// Pill chip (month view).
export const CHIP_ACCENTS = {
  teal: "bg-brand/15 text-brand-dark dark:bg-brand/25 dark:text-brand",
  gold: "bg-accent-gold/15 text-accent-gold dark:bg-amber-400/20 dark:text-amber-300",
  rust: "bg-cta/20 text-accent-rust dark:bg-cta/25 dark:text-cta",
};

// Solid dot / fill (year view).
export const DOT_ACCENTS = {
  teal: "bg-brand-dark",
  gold: "bg-accent-gold",
  rust: "bg-accent-rust",
};
