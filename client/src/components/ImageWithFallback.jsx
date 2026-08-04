import React, { useState } from "react";
import { Package } from "lucide-react";
import { getImageUrl } from "../utils/getImageUrl";

const ImageWithFallback = ({
  src,
  alt = "Product",
  size = 26,
  iconColor = "#2563eb",
  style = { width: "100%", height: "100%", objectFit: "cover" },
}) => {
  const [hasError, setHasError] = useState(false);
  const formattedUrl = getImageUrl(src);

  if (hasError || !formattedUrl) {
    return <Package size={size} color={iconColor} />;
  }

  return (
    <img
      src={formattedUrl}
      alt={alt}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

export default ImageWithFallback;
