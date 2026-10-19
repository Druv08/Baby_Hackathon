import type { Metadata } from "next";

import { RenderStory } from "@/components/story/StoryPageContent";
import { getStoryRouteSlugs, getFutureBySlug } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
type Params = { params: Promise<{ slug: string }> };

// Only ready stories get a page; everything else is a 404.
export function generateStaticParams() {
  return getStoryRouteSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const intro = getFutureBySlug(slug)?.storyIntro;
  const view = loadFutureView(slug);
  if (!view) return {};
  return {
    title: intro?.title ?? `${view.character.name}'s Story`,
    description: intro?.subtitle,
  };
}

export default async function StoryPage({ params }: Params) { return RenderStory({ params }); }
