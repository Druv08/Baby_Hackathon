/** Length-weighted interpolation in SVG viewBox coordinates, including reverse scroll. */
export function routePoint(points: { x: number; y: number }[], progress: number) {
  if (!points.length) return { x: 0, y: 0 };
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let distance = lengths.reduce((sum, length) => sum + length, 0) * Math.max(0, Math.min(1, progress));
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] && lengths[i] > 0) {
      const ratio = distance / lengths[i];
      return { x: points[i].x + (points[i + 1].x - points[i].x) * ratio, y: points[i].y + (points[i + 1].y - points[i].y) * ratio };
    }
    distance -= lengths[i];
  }
  return points.at(-1)!;
}
