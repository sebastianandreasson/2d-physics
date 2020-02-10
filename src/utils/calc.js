export const withinCircle = (xA, yA, xB, yB, radius) => {
  const xdiff = Math.abs(xA - xB)
  const ydiff = Math.abs(yA - yB)

  return Math.sqrt(xdiff * xdiff + ydiff * ydiff) < radius
}
