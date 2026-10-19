import { narrationParagraphs } from "@/lib/story-text";
import styles from "./StoryText.module.css";

/** Narration as readable paragraphs; spoken lines are set apart. */
export function StoryText({ narration }: { narration: string }) {
  return (
    <div className={styles.text}>
      {narrationParagraphs(narration).map((p, i) =>
        p.spoken ? (
          <p key={i} className={styles.spoken}>
            {p.text}
          </p>
        ) : (
          <p key={i}>{p.text}</p>
        ),
      )}
    </div>
  );
}
