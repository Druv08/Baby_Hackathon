"use client";

import Image from "next/image";
import { useId, useReducer, useState } from "react";

import {
  MESSAGE_LIMIT,
  POSTCARD_DESIGNS,
  POSTCARD_STICKERS,
  initialPostcard,
  postcardReducer,
  postcardCrop,
  wrapLines,
  type PostcardDesign,
  type PostcardSticker,
} from "@/lib/projects/cloud-projects";
import { CENTRED_HEART, CENTRED_STAR, FACE, PUFF_PATH, RAINBOW_ARCS } from "./cloud-art";
import styles from "./CloudProjects.module.css";

/** The character-free floating-islands artwork; each design shows a different part of it. */
const ARTWORK = "/stories/cloud/background.png";
const ARTWORK_SIZE = { w: 1672, h: 941 };
const DEFAULT_MESSAGE = "Wish you were here, floating above the clouds!";

const design = (id: PostcardDesign) => POSTCARD_DESIGNS.find((d) => d.id === id)!;

/** A cloud sticker in a 100 × 70 box. */
export function Sticker({ id }: { id: PostcardSticker }) {
  return (
    <svg viewBox="0 0 100 70" className={styles.stickerArt} aria-hidden="true">
      {id === "rainbow" &&
        RAINBOW_ARCS.map((a) => <path key={a.color} d={a.d} fill="none" stroke={a.color} strokeWidth={7} strokeLinecap="round" />)}
      {id === "heart" ? (
        <path d={CENTRED_HEART} transform="translate(50 36) scale(0.72)" fill="#ffd6e5" stroke="#f0a3c0" strokeWidth={4} strokeLinejoin="round" />
      ) : id === "star" ? (
        <path d={CENTRED_STAR} transform="translate(50 33) scale(0.8)" fill="#fff1b8" stroke="#e7c35a" strokeWidth={4} strokeLinejoin="round" />
      ) : (
        <path d={PUFF_PATH} transform={id === "rainbow" ? "translate(14 22) scale(0.72)" : "translate(0 4)"} fill="#fff" stroke="#b9d6f1" strokeWidth={3} strokeLinejoin="round" />
      )}
      <g transform={id === "rainbow" ? "translate(50 48) scale(0.8)" : "translate(50 38)"}>
        {FACE.eyes.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={FACE.eyeRadius} fill="#4a3a52" />
        ))}
        <path d={FACE.smile} fill="none" stroke="#4a3a52" strokeWidth={2.4} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Draws the same sticker on a canvas, inside a box at (x, y) of width w. */
function drawSticker(ctx: CanvasRenderingContext2D, id: PostcardSticker, x: number, y: number, w: number) {
  const k = w / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (id === "rainbow") {
    ctx.lineWidth = 7;
    for (const a of RAINBOW_ARCS) {
      ctx.strokeStyle = a.color;
      ctx.stroke(new Path2D(a.d));
    }
  }
  const shape = (d: string, tx: number, ty: number, s: number, fill: string, edge: string, lw: number) => {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(s, s);
    const p = new Path2D(d);
    ctx.fillStyle = fill;
    ctx.fill(p);
    ctx.strokeStyle = edge;
    ctx.lineWidth = lw;
    ctx.stroke(p);
    ctx.restore();
  };
  if (id === "heart") shape(CENTRED_HEART, 50, 36, 0.72, "#ffd6e5", "#f0a3c0", 4);
  else if (id === "star") shape(CENTRED_STAR, 50, 33, 0.8, "#fff1b8", "#e7c35a", 4);
  else if (id === "rainbow") shape(PUFF_PATH, 14, 22, 0.72, "#fff", "#b9d6f1", 3);
  else shape(PUFF_PATH, 0, 4, 1, "#fff", "#b9d6f1", 3);
  const [fx, fy, fs] = id === "rainbow" ? [50, 48, 0.8] : [50, 38, 1];
  ctx.translate(fx, fy);
  ctx.scale(fs, fs);
  ctx.fillStyle = "#4a3a52";
  for (const [ex, ey] of FACE.eyes) {
    ctx.beginPath();
    ctx.arc(ex, ey, FACE.eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#4a3a52";
  ctx.lineWidth = 2.4;
  ctx.stroke(new Path2D(FACE.smile));
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the postcard artwork."));
    img.src = src;
  });
}

/** Renders the postcard to a PNG blob (same artwork, text and sticker as the preview). */
async function renderPostcard(designId: PostcardDesign, message: string, sticker: PostcardSticker): Promise<Blob> {
  const W = 1200;
  const H = 800;
  const d = design(designId);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";

  // Card and frame.
  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, W, H);
  const pad = 36;
  const art = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };

  // Artwork, cover-cropped and zoomed around the design's focus point.
  const img = await loadImage(ARTWORK);
  const { sx, sy, sw, sh } = postcardCrop(img.naturalWidth, img.naturalHeight, art.w, art.h, d.focus, d.zoom);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(art.x, art.y, art.w, art.h, 28);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, art.x, art.y, art.w, art.h);
  ctx.restore();
  ctx.lineWidth = 10;
  ctx.strokeStyle = d.frame;
  ctx.beginPath();
  ctx.roundRect(art.x, art.y, art.w, art.h, 28);
  ctx.stroke();

  // Title banner.
  ctx.font = `800 46px ${font}`;
  const title = `Greetings from ${d.title}!`;
  const tw = ctx.measureText(title).width + 56;
  ctx.fillStyle = "rgba(255, 250, 243, 0.92)";
  ctx.beginPath();
  ctx.roundRect(art.x + 30, art.y + 30, tw, 74, 37);
  ctx.fill();
  ctx.fillStyle = "#2f6fb0";
  ctx.textBaseline = "middle";
  ctx.fillText(title, art.x + 58, art.y + 68);

  // Message note.
  const noteW = 640;
  ctx.font = `700 34px ${font}`;
  const lines = wrapLines(message || DEFAULT_MESSAGE, noteW - 64, (s) => ctx.measureText(s).width, 4);
  const noteH = 60 + lines.length * 46;
  const noteX = art.x + 30;
  const noteY = art.y + art.h - noteH - 30;
  ctx.fillStyle = "rgba(255, 250, 243, 0.94)";
  ctx.beginPath();
  ctx.roundRect(noteX, noteY, noteW, noteH, 24);
  ctx.fill();
  ctx.fillStyle = "#4a3a52";
  lines.forEach((line, i) => ctx.fillText(line, noteX + 32, noteY + 52 + i * 46));

  drawSticker(ctx, sticker, art.x + art.w - 230, art.y + art.h - 200, 190);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not save."))), "image/png"));
}

/**
 * Cloud Postcards: choose a floating-island design, write a short message,
 * add a cloud sticker and see the finished card. Visitor text is shown only
 * as plain text. The card can be saved as a PNG or the message copied.
 */
export function CloudPostcards() {
  const [state, dispatch] = useReducer(postcardReducer, initialPostcard);
  const [note, setNote] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const messageId = useId();
  const d = design(state.design);
  const shown = state.message.trim() || DEFAULT_MESSAGE;

  async function save() {
    setBusy(true);
    try {
      const blob = await renderPostcard(state.design, state.message.trim(), state.sticker);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cloud-postcard-${state.design}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNote(`Saved cloud-postcard-${state.design}.png (${Math.round(blob.size / 1024)} KB) ✉️`);
    } catch {
      setNote("Sorry, this browser couldn’t save the postcard. You can still copy the message.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    const text = `Greetings from ${d.title}! ${shown}`;
    try {
      await navigator.clipboard.writeText(text);
      setNote("Message copied! ✨");
    } catch {
      setNote("Copying isn’t allowed here. Select the message on the postcard to copy it.");
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.postcardLayout}>
        <figure className={styles.postcard} style={{ "--frame": d.frame } as React.CSSProperties} data-design={state.design}>
          <Image
            src={ARTWORK}
            alt={`Postcard artwork: ${d.title} in the Floating Sky Islands`}
            width={ARTWORK_SIZE.w}
            height={ARTWORK_SIZE.h}
            sizes="(max-width: 900px) 100vw, 1100px"
            className={styles.postcardArt}
            style={{
              objectPosition: `${d.focus.x}% ${d.focus.y}%`,
              transform: `scale(${d.zoom})`,
              transformOrigin: `${d.focus.x}% ${d.focus.y}%`,
            }}
          />
          <p className={styles.postcardTitle}>Greetings from {d.title}!</p>
          <figcaption className={styles.postcardNote} data-placeholder={state.message.trim() === ""}>
            {shown}
          </figcaption>
          <span className={styles.postcardSticker} data-sticker={state.sticker}>
            <Sticker id={state.sticker} />
          </span>
        </figure>

        <div className={styles.postcardControls}>
          <fieldset className={styles.options}>
            <legend>Postcard</legend>
            {POSTCARD_DESIGNS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.option}
                aria-pressed={state.design === p.id}
                onClick={() => dispatch({ type: "design", design: p.id })}
              >
                <span className={styles.thumb} style={{ borderColor: p.frame }} aria-hidden="true">
                  <Image
                    src={ARTWORK}
                    alt=""
                    fill
                    sizes="160px"
                    style={{
                      objectFit: "cover",
                      objectPosition: `${p.focus.x}% ${p.focus.y}%`,
                      transform: `scale(${p.zoom})`,
                      transformOrigin: `${p.focus.x}% ${p.focus.y}%`,
                    }}
                  />
                </span>
                {p.title}
              </button>
            ))}
          </fieldset>

          <label className={styles.messageLabel} htmlFor={messageId}>
            Your message
            <textarea
              data-resize-none
              id={messageId}
              className={styles.messageInput}
              value={state.message}
              maxLength={MESSAGE_LIMIT}
              rows={3}
              placeholder={DEFAULT_MESSAGE}
              onChange={(e) => dispatch({ type: "message", message: e.target.value })}
            />
          </label>
          <p className={styles.counter} aria-live="polite">
            {state.message.length} / {MESSAGE_LIMIT}
          </p>

          <fieldset className={styles.options}>
            <legend>Cloud sticker</legend>
            {POSTCARD_STICKERS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={styles.stickerOption}
                aria-pressed={state.sticker === s.id}
                aria-label={s.label}
                title={s.label}
                onClick={() => dispatch({ type: "sticker", sticker: s.id })}
              >
                <Sticker id={s.id} />
              </button>
            ))}
          </fieldset>

          <div className={styles.controls}>
            <button type="button" className={styles.primary} onClick={save} disabled={busy}>
              {busy ? "Saving…" : "💾 Save postcard"}
            </button>
            <button type="button" className={styles.secondary} onClick={copy}>
              Copy message
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                dispatch({ type: "reset" });
                setNote("");
              }}
            >
              Start a new card
            </button>
          </div>
          <p className={styles.status} role="status">
            {note || "Your postcard updates as you go. Try every design!"}
          </p>
        </div>
      </div>
    </div>
  );
}
