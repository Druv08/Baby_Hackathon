"use client";

import { useVisitCounter } from "@/hooks/useVisitCounter";
import { useEffect, useState } from "react";
import { counterDigits } from "@/lib/side-quests";
import styles from "./VisitOdometer.module.css";

export function VisitOdometer() {
  const count = useVisitCounter();
  return <div className={styles.counter} data-visit-counter>
    <p className={styles.label}>Dreams Delivered</p>
    {count === null ? <p className={styles.unavailable}>The dream counter is resting.</p> : <>
      <Digits count={count} />
      <p className="visually-hidden" role="status">{count} dreams delivered. Recorded visits.</p>
      <small>One little visit per browser session.</small>
    </>}
  </div>;
}

function Digits({ count }: { count: number }) {
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setRolling(true)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, []);
  return <div className={styles.digits} aria-hidden="true">{counterDigits(count).map((digit, index) => <span className={styles.window} key={index}>
    <span className={styles.reel} style={{ transform: `translateY(-${rolling ? Number(digit) * 10 : 0}%)` }}>{Array.from({ length: 10 }, (_, n) => <span key={n}>{n}</span>)}</span>
  </span>)}</div>;
}
