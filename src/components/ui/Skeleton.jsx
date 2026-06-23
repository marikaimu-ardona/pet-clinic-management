import PropTypes from "prop-types";

// A pulsing placeholder block for loading states.
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-muted/20 ${className}`} />;
}

Skeleton.propTypes = {
  className: PropTypes.string,
};

export default Skeleton;
