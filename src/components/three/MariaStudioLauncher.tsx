"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";

const Studio = dynamic(() => import("./MariaStudio"), { ssr: false, loading: () => <p role="status">Opening the 3D studio…</p> });
export function MariaStudioLauncher() {
  const [open, setOpen] = useState(false);
  return open ? <Studio /> : <div style={{ display: "grid", justifyItems: "center", gap: "1rem" }}>
    <Image src="/characters/1.png" alt="Normal Maria, the approved illustration used as the 3D design reference" width={240} height={320} sizes="240px" />
    <button type="button" className="btn btn-primary" data-open-studio onClick={() => setOpen(true)}>Open 3D studio</button>
    <p>The 3D renderer loads only when you open the studio.</p>
  </div>;
}
