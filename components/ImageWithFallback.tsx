'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string; // The URL for the fallback image
}

/**
 * A client component wrapper around Next.js's Image component.
 * It provides an `onError` handler to display a fallback image if the primary image fails to load.
 * This is necessary because event handlers on Image (or other interactive elements) cannot be
 * directly passed from a Server Component.
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ fallbackSrc, onError, ...rest }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Set the source to the fallback image
    (e.target as HTMLImageElement).src = fallbackSrc;
    // Optionally call any original onError handler passed
    if (onError) {
      onError(e);
    }
  };

  return (
    <Image
      {...rest}
      onError={handleImageError}
    />
  );
};

export default ImageWithFallback;
