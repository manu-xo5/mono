export function between(start: number, end: number) {
  const x = Math.random();

  return (end - start + 1) * x + start;
}

export function rgb() {
  const values = [between(0, 255), between(0, 255), between(0, 255)].map(
    Math.floor,
  );

  return `rgb(${values})`;
}

export function hsl() {
  const hueStart = between(0, 40);
  const hueEnd = between(70, 360);

  const hue = Math.random() > 0.5 ? hueEnd : hueStart;
  const saturation = between(50, 100);
  const lightness = between(30, 60);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
