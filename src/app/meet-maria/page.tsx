import type { Metadata } from "next";
import Link from "next/link";
import { MariaStudioLauncher } from "@/components/three/MariaStudioLauncher";
export const metadata: Metadata = { title: "Meet Maria in 3D", description: "Explore an interactive 3D interpretation of Normal Maria, with rotation, zoom and playful greetings." };
export default function MeetMaria() {
  return <section className="section"><div className="container" style={{ maxWidth: "64rem", display: "grid", gap: "1.5rem" }}>
    <header><p className="eyebrow">A new little dimension</p><h1>Meet Maria in 3D</h1><p>Turn the view, say hello, and see a little dream from another angle.</p></header>
    <p>Drag with a mouse or finger to look around. You can also use the camera buttons below, then wave hello or share a happy bounce.</p>
    <MariaStudioLauncher />
    <Link href="/" className="btn btn-secondary">← Back to Maria’s illustrated world</Link>
  </div></section>;
}
