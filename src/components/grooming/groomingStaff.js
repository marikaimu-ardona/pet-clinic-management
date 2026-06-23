// Helpers for displaying a groomer (assignee) consistently.

// "Elena Rodriguez" -> "Elena R."
export function shortName(fullName) {
  if (!fullName) return "Unassigned";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// Accent keyed off role so the lead groomer and assistants read differently.
export function staffAccent(role) {
  if (role && /lead/i.test(role)) return "teal";
  if (role && /assistant/i.test(role)) return "rust";
  return "gold";
}

export const ROW_ACCENTS = {
  teal: {
    row: "bg-brand/10",
    dot: "bg-brand-dark",
    border: "border-brand-dark",
    chip: "bg-brand/15 text-brand-dark dark:bg-brand/25 dark:text-brand",
  },
  rust: {
    row: "bg-cta/15",
    dot: "bg-accent-rust",
    border: "border-accent-rust",
    chip: "bg-cta/20 text-accent-rust dark:bg-cta/30 dark:text-cta",
  },
  gold: {
    row: "bg-accent-gold/10",
    dot: "bg-accent-gold",
    border: "border-accent-gold",
    chip: "bg-accent-gold/15 text-accent-gold dark:bg-amber-400/20 dark:text-amber-300",
  },
};
