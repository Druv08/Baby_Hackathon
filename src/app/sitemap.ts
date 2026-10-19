import type { MetadataRoute } from "next";
import { CHARACTERS } from "@/data/characters";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/journey", "/forms", "/creations", "/memory-book", "/meet-maria",
    ...CHARACTERS.filter(character => character.id !== 1).flatMap(character => [
      `/futures/${character.slug}`, `/futures/${character.slug}/story`,
    ])];
  return paths.map(path => ({ url: `https://maria-eight-dreams.vercel.app${path}` }));
}
