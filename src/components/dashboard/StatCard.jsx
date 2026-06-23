import PropTypes from "prop-types";

// Full class strings per accent so Tailwind keeps them at build time.
const VARIANTS = {
  teal: {
    iconWrap: "bg-brand-dark/10 text-brand-dark",
    value: "text-brand-dark",
    badge: "bg-brand-dark/10 text-brand-dark",
  },
  rust: {
    iconWrap: "bg-accent-rust/10 text-accent-rust",
    value: "text-accent-rust",
    badge: "bg-accent-rust/10 text-accent-rust",
  },
  gold: {
    iconWrap: "bg-accent-gold/10 text-accent-gold",
    value: "text-accent-gold",
    badge: "bg-accent-gold/10 text-accent-gold",
  },
  deep: {
    iconWrap: "bg-accent-rust-dark/10 text-accent-rust-dark",
    value: "text-accent-rust-dark",
    badge: "bg-accent-rust-dark/10 text-accent-rust-dark",
  },
};

// A single "Today's Summary" metric card.
function StatCard({ Icon, value, label, badge, variant = "teal" }) {
  const styles = VARIANTS[variant] ?? VARIANTS.teal;

  return (
    <div className="flex min-h-[180px] flex-col justify-between rounded-[32px] border border-card-border/10 bg-card p-6 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <div className={`flex size-12 items-center justify-center rounded-full ${styles.iconWrap}`}>
          <Icon className="size-6" strokeWidth={2} />
        </div>
        {badge && (
          <span className={`rounded-full px-2 py-1 font-nunito font-extrabold text-[10px] ${styles.badge}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="pt-6">
        <p className={`font-quicksand font-bold text-[32px] leading-10 tracking-[-0.64px] ${styles.value}`}>
          {value}
        </p>
        <p className="font-nunito text-sm uppercase tracking-[0.7px] text-subtle">
          {label}
        </p>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string.isRequired,
  badge: PropTypes.string,
  variant: PropTypes.oneOf(["teal", "rust", "gold", "deep"]),
};

export default StatCard;
