"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
function ImageState(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed || !props.src) return <span className="artwork-fallback" role={props.alt ? "img" : undefined} aria-label={props.alt || undefined}>Artwork unavailable</span>;
  const remote = typeof props.src === "string" && props.src.startsWith("https://");
  return <Image {...props} alt={props.alt} unoptimized={props.unoptimized || remote} onError={() => setFailed(true)} />;
}
export function Artwork(props: ImageProps) { return <ImageState key={String(props.src)} {...props} />; }
