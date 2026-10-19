"use client";

/** Shared by the two guestbook views; pending submissions never appear here. */
export function MemoryRefresh({ refresh, refreshing, refreshError }: { refresh: () => Promise<void>; refreshing: boolean; refreshError: boolean }) {
  return <div style={{ display: "grid", justifyItems: "center", gap: ".5rem", marginBlock: "1rem" }}>
    <button type="button" className="btn btn-secondary" onClick={() => void refresh()} disabled={refreshing} aria-busy={refreshing}>
      {refreshing ? "Refreshing lanterns…" : "Refresh memories"}
    </button>
    <p role="status" style={{ fontSize: ".85rem" }}>{refreshError ? "Could not refresh. Your open memories are still here; try again shortly." : "Approved memories refresh every 45 seconds while this page is visible."}</p>
  </div>;
}
