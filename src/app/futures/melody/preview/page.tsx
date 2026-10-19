import { RenderStory } from "@/components/story/StoryPageContent";
export const metadata = { title: "Melody Path ? artwork preview", robots: { index: false, follow: false } };
export default function MelodyPreview() { return RenderStory({ params: Promise.resolve({ slug: "melody" }), preview: true }); }
