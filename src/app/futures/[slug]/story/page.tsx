import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FloralDivider } from "@/components/decor/Sparkles";
import { RecordFutureVisit } from "@/components/progress/RecordFutureVisit";
import { Portfolio } from "@/components/projects/Portfolio";
import { FadeIn } from "@/components/story/FadeIn";
import { RainbowCloud } from "@/components/cloud/RainbowCloud";
import { HiddenConstellation } from "@/components/star/HiddenConstellation";
import { HiddenSecret } from "@/components/story/GoldenSeed";
import { StoryCompletion } from "@/components/story/StoryCompletion";
import { PetalLayer } from "@/components/story/PetalLayer";
import { StarfieldLayer } from "@/components/story/StarfieldLayer";
import { OceanLayer } from "@/components/story/OceanLayer";
import { SkyLayer } from "@/components/story/SkyLayer";
import { SceneInteraction } from "@/components/story/SceneInteraction";
import { StoryProgress } from "@/components/story/StoryProgress";
import { StoryText } from "@/components/story/StoryText";
import { isAssetVerified } from "@/data/assets";
import { CHARACTER_THEMES, themeStyle } from "@/data/future-themes";
import { getFutureBySlug, getStoryRouteSlugs } from "@/lib/content";
import { loadFutureView, type SceneView } from "@/lib/future-view";
import styles from "./page.module.css";

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

export default async function StoryPage({ params }: Params) {
  const { slug } = await params;
  const view = loadFutureView(slug);
  const future = getFutureBySlug(slug);
  if (!view || !future || !view.story.canEnter || !view.story.reveal) notFound();

  const intro = future.storyIntro;
  const theme = CHARACTER_THEMES[view.slug];
  const { origin, reveal } = view.story;
  const size = sceneSize(view.slug);
  // Story-world landscape, by convention, only when the file was supplied.
  const backdrop = `/stories/${view.slug}/background.png`;
  const hasBackdrop = isAssetVerified(backdrop);

  return (
    <div className={styles.world} data-world={view.slug} data-backdrop={hasBackdrop} style={themeStyle(view.slug)}>
      <RecordFutureVisit futureId={view.id} />
      {hasBackdrop && (
        // Fixed to the viewport (clipped to this page), so every scene scrolls
        // over the same landscape — cover-cropped, never stretched.
        <div className={styles.backdrop} aria-hidden="true">
          <Image src={backdrop} alt="" fill priority sizes="100vw" className={styles.backdropImage} />
          <div className={styles.backdropVeil} />
        </div>
      )}
      <AmbientLayer slug={view.slug} />

      <div className={styles.content}>
      {/* ── Introduction ─────────────────────────────────────────────── */}
      <section className={styles.intro} aria-labelledby="story-title">
        <div className={`container ${styles.introInner}`}>
          <div className={styles.introMaria}>
            <Image
              src={view.normalMaria.characterImage}
              alt={CHARACTER_THEMES.normal.portraitAlt}
              width={1086}
              height={1448}
              priority
              sizes="(max-width: 800px) 60vw, 380px"
            />
            <p className={styles.introSign} aria-hidden="true">
              A new journey begins…
            </p>
          </div>
          <div className={styles.introCopy}>
            <p className="eyebrow">
              <span aria-hidden="true">{theme.icon}</span> {String(view.id).padStart(2, "0")} — {theme.label}
            </p>
            <h1 id="story-title" className={styles.introTitle}>
              {intro?.title ?? `${theme.label} Path`}
            </h1>
            {intro && <p className={styles.introSubtitle}>{intro.subtitle}</p>}
            {intro && <p className={styles.introBlurb}>{intro.blurb}</p>}
            <a href="#scene-1" className="btn btn-primary btn-large">
              <span aria-hidden="true">🐾</span> Start Story <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <StoryProgress scenes={view.story.scenes.map((s) => ({ id: s.id, title: s.title }))} />

      {/* ── Scenes 1–4: Normal Maria ─────────────────────────────────── */}
      {origin.map((scene) => (
        <OriginScene
          key={scene.id}
          scene={scene}
          size={size}
          secret={SECRET_SPOTS[view.slug]?.sceneId === scene.id ? { slug: view.slug, spot: SECRET_SPOTS[view.slug]! } : undefined}
        />
      ))}

      {/* ── Scene 5: the reveal ──────────────────────────────────────── */}
      <section
        id={`scene-${reveal.id}`}
        data-scene={reveal.id}
        className={styles.reveal}
        aria-labelledby={`scene-${reveal.id}-title`}
      >
        <div className="container">
          <header className={styles.revealHead}>
            <h2 id={`scene-${reveal.id}-title`}>{reveal.title}</h2>
          </header>

          <FadeIn className={styles.revealFrame}>
            {reveal.verifiedImage && (
              <Image
                src={reveal.verifiedImage}
                alt={SCENE_ALT[reveal.image ?? ""] ?? reveal.title}
                width={size.width}
                height={size.height}
                sizes="(max-width: 1100px) 94vw, 1100px"
              />
            )}
            <SceneInteraction id={reveal.interactionId} />
          </FadeIn>

          <div className={styles.revealBody}>
            <FadeIn className={styles.panel}>
              <StoryText narration={reveal.narration} />
            </FadeIn>

            <FadeIn className={styles.characterCard}>
              <div className={styles.cardPortrait}>
                <Image
                  src={reveal.character.characterImage}
                  alt={theme.portraitAlt}
                  width={1086}
                  height={1448}
                  sizes="(max-width: 800px) 70vw, 320px"
                />
              </div>
              <p className={styles.cardName}>
                {reveal.character.name} — <span>The {reveal.character.profession}</span>
              </p>
              {reveal.character.tagline && <p className={styles.cardTagline}>“{reveal.character.tagline}”</p>}
              <a href={future.profile ? "#portfolio" : `/futures/${view.slug}#creations`} className="btn btn-primary">
                Explore My Creations <span aria-hidden="true">↓</span>
              </a>
            </FadeIn>
          </div>

          <StoryCompletion futureId={view.id} />
        </div>
      </section>

      {/* ── Portfolio and creations ──────────────────────────────────── */}
      {future.profile && <Portfolio view={view} profile={future.profile} />}

      <FloralDivider />

      <nav className={`container ${styles.return}`} aria-label="Futures">
        <Link href={`/futures/${view.slug}`} className="btn btn-secondary">
          <span aria-hidden="true">←</span> Back to {theme.label}
        </Link>
        <Link href="/#futures" className="btn btn-secondary">
          Return to Eight Futures
        </Link>
      </nav>
      </div>
    </div>
  );
}

/** Each world's moving atmosphere; Blossom (and any new world) keeps its petals. */
function AmbientLayer({ slug }: { slug: string }) {
  if (slug === "star") return <StarfieldLayer />;
  if (slug === "cloud") return <SkyLayer />;
  if (slug === "aqua") return <OceanLayer />;
  return <PetalLayer />;
}

type SecretSpot =
  | { kind: "seed"; sceneId: number; left: string; top: string }
  | { kind: "constellation"; sceneId: number }
  | { kind: "rainbow-cloud"; sceneId: number; left: string; top: string };

/** Where each future's hidden collectible is tucked into its story. */
const SECRET_SPOTS: Partial<Record<string, SecretSpot>> = {
  // Among the blooming flowers on the left of "The Garden Wakes Up".
  blossom: { kind: "seed", sceneId: 4, left: "11%", top: "71%" },
  // Three faint stars in the sky inside "The Forgotten Observatory".
  star: { kind: "constellation", sceneId: 2 },
  // A tiny cloud drifting among the pink clouds of "Lost in the Endless Sky".
  cloud: { kind: "rainbow-cloud", sceneId: 3, left: "91%", top: "63%" },
};

/**
 * Pixel size of a world's scene illustrations. Most worlds are 16:9; Aqua's
 * are 4:3. Overlays on each world's art use the same ratio.
 */
const SCENE_SIZES: Partial<Record<string, { width: number; height: number }>> = {
  aqua: { width: 1448, height: 1086 },
};

function sceneSize(slug: string) {
  return SCENE_SIZES[slug] ?? { width: 1672, height: 941 };
}

function OriginScene({
  scene,
  size,
  secret,
}: {
  scene: SceneView;
  size: { width: number; height: number };
  secret?: { slug: string; spot: SecretSpot };
}) {
  return (
    <section
      id={`scene-${scene.id}`}
      data-scene={scene.id}
      className={styles.scene}
      data-layout={scene.layout}
      aria-labelledby={`scene-${scene.id}-title`}
    >
      <div className={`container ${styles.sceneInner}`}>
        <FadeIn className={styles.frame}>
          {scene.verifiedImage && (
            <Image
              src={scene.verifiedImage}
              alt={SCENE_ALT[scene.image ?? ""] ?? scene.title}
              width={size.width}
              height={size.height}
              sizes="(max-width: 900px) 94vw, 60vw"
            />
          )}
          <SceneInteraction id={scene.interactionId} />
          {secret?.spot.kind === "seed" && (
            <HiddenSecret futureSlug={secret.slug} left={secret.spot.left} top={secret.spot.top} />
          )}
          {secret?.spot.kind === "constellation" && <HiddenConstellation futureSlug={secret.slug} />}
          {secret?.spot.kind === "rainbow-cloud" && (
            <RainbowCloud futureSlug={secret.slug} left={secret.spot.left} top={secret.spot.top} />
          )}
        </FadeIn>

        <FadeIn className={styles.panel}>
          <h2 id={`scene-${scene.id}-title`} className={styles.sceneTitle}>
            {scene.title}
          </h2>
          <StoryText narration={scene.narration} />
        </FadeIn>
      </div>
    </section>
  );
}

/** Descriptions of each illustration for screen readers. */
const SCENE_ALT: Record<string, string> = {
  "/stories/blossom/scene-1.png":
    "Maria, in her pink floral scarf, looks worried as she gently touches a wilted flower in a forgotten garden.",
  "/stories/blossom/scene-2.png": "Maria waters a newly planted seed with a little watering can among drooping flowers.",
  "/stories/blossom/scene-3.png": "Maria crouches beside a tiny green sprout in freshly dug soil.",
  "/stories/blossom/scene-4.png": "Maria dances happily as flowers bloom all around her and butterflies return.",
  "/stories/blossom/scene-5.png": "Blossom Maria in the restored garden, holding a basket of flowers.",
  "/stories/star/scene-1.png":
    "Maria, in her pink floral scarf, gazes up at a lonely shooting star drifting toward a distant observatory.",
  "/stories/star/scene-2.png": "Maria stands on a stool, peering through a huge brass telescope in the old observatory.",
  "/stories/star/scene-3.png": "Maria sits at a desk covered in unfinished star maps, thinking hard, beside the starry window.",
  "/stories/star/scene-4.png": "Maria joyfully traces glowing lines between stars with a star wand, creating her first Dream Map.",
  "/stories/star/scene-5.png":
    "Star Maria in her purple hooded celestial cloak and jeweled bow, holding up a glowing jar of stars on the observatory terrace.",
  "/stories/cloud/scene-1.png":
    "Maria, in her pink floral scarf, looks up in surprise at floating islands and a broken sky bridge, beside a small worried cloud on the clifftop.",
  "/stories/cloud/scene-2.png":
    "Maria cautiously climbs a staircase of fluffy clouds beside a waterfall while the little cloud floats beside her.",
  "/stories/cloud/scene-3.png":
    "Maria sits alone on a floating rock surrounded by pink clouds, looking toward golden wind chimes hanging from a distant island.",
  "/stories/cloud/scene-4.png":
    "Maria happily guides glowing cloud platforms into a bridge between two floating islands as golden wind chimes ring.",
  "/stories/cloud/scene-5.png":
    "Cloud Maria in her light-blue aviator hood, brass goggles and cloud-trimmed scarf, holding up a cloud jar as she strides across a golden cloud bridge.",
  "/stories/aqua/scene-1.png":
    "Maria, in her pink floral scarf, floats inside a shimmering magic bubble during an underwater storm, reaching toward a frightened baby sea turtle.",
  "/stories/aqua/scene-2.png":
    "Maria swims beside the little turtle past glowing jellyfish toward an underwater kingdom, where pale coral is tangled in old fishing nets.",
  "/stories/aqua/scene-3.png":
    "Maria carefully studies a fishing net caught around pale, damaged coral while the worried little turtle waits beside her.",
  "/stories/aqua/scene-4.png":
    "Maria happily lifts the tangled net away from the reef as the little turtle reaches for her paw and colorful fish return.",
  "/stories/aqua/scene-5.png":
    "Aqua Maria in her turquoise ocean hood and dress decorated with shells, pearls and starfish, hugging the little turtle in the glowing underwater kingdom.",
};
