'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string; 
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ fallbackSrc, onError, ...rest }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = fallbackSrc;
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
