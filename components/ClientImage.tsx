// components/ClientImage.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ClientImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function ClientImage({ src, alt, width, height, className }: ClientImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImgSrc('https://placehold.co/60x60/F0F0F0/ADADAD?text=Img')}
    />
  );
}
