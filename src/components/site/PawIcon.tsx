import Image from "next/image";

import { pawFor } from "@/lib/paws";

/** A character's paw emblem as a small decorative icon (sized like the text around it). */
export function PawIcon({ slug, size = "1.15em", className }: { slug?: string | null; size?: string; className?: string }) {
  return (
    <Image
      src={pawFor(slug)}
      alt=""
      aria-hidden="true"
      width={96}
      height={96}
      sizes="48px"
      className={className}
      style={{ width: size, height: size, display: "inline-block", verticalAlign: "-0.2em", objectFit: "contain" }}
    />
  );
}
