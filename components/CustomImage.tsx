'use client'; 

import Image, { ImageProps } from 'next/image';
import React, { useState } from 'react';

export default function CustomImage(props: ImageProps) {
  const [imgSrc, setImgSrc] = useState(props.src);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc('https://placehold.co/60x60/F0F0F0/ADADAD?text=Img')}
    />
  );
}
