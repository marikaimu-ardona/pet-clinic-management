import { useState } from "react";
import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";

// "Quick Note": a single highlighted note, dismissable for the session.
function QuickNoteCard({ note }) {
  const [dismissed, setDismissed] = useState(false);
  if (!note || dismissed) return null;

  return (
    <div className="rounded-[32px] border border-accent-gold/30 bg-accent-gold/10 p-6">
      <p className="font-nunito font-extrabold text-xs uppercase tracking-[1px] text-accent-gold">
        Quick Note
      </p>
      <p className="mt-2 font-nunito text-sm italic text-ink">&ldquo;{note}&rdquo;</p>
      <button
        onClick={() => setDismissed(true)}
        className="mt-3 flex items-center gap-1 font-nunito font-bold text-xs text-accent-gold hover:underline"
      >
        Dismiss Note
        <ArrowRight className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

QuickNoteCard.propTypes = {
  note: PropTypes.string,
};

export default QuickNoteCard;
