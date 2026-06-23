import { useState } from "react";
import PropTypes from "prop-types";
import { initials } from "../../lib/format";

// Round avatar that shows a photo when available, otherwise initials on a
// brand-tinted circle. Falls back to initials if the image fails to load.
function Avatar({ name, src, className = "", textClassName = "" }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-brand/20 ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ?? ""}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={`font-quicksand font-bold text-brand-dark ${textClassName}`}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  className: PropTypes.string,
  textClassName: PropTypes.string,
};

export default Avatar;
