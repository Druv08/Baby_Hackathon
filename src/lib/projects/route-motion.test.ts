import { describe, expect, it } from "vitest";
import { routePoint } from "./route-motion";
describe("scroll traveler follows actual route distance", () => {
  const route = [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 70 }];
  it("weights unequal path segments and supports backward scrolling", () => {
    expect(routePoint(route, .5)).toEqual({ x: 30, y: 20 });
    expect(routePoint(route, .15)).toEqual({ x: 15, y: 0 });
  });
  it("clamps endpoints and tolerates repeated landmarks", () => {
    expect(routePoint(route, -1)).toEqual(route[0]); expect(routePoint(route, 2)).toEqual(route[2]);
    expect(routePoint([route[0], route[0], route[1]], .5)).toEqual({ x: 15, y: 0 });
    expect(routePoint([], .5)).toEqual({ x: 0, y: 0 });
  });
});
