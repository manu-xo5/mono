export function fromSvgString(svg: string) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
