export const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/journey", label: "My Journey", icon: "paw" },
  { href: "/forms", label: "My Forms", icon: "⭐" },
  { href: "/creations", label: "My Creations", icon: "📦" },
  { href: "/memory-book", label: "Memory Book", icon: "📖" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  // Future pages live under "My Forms".
  if (href === "/forms") return pathname === "/forms" || pathname.startsWith("/futures/");
  return pathname === href || pathname.startsWith(`${href}/`);
}
