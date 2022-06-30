export function fixupYMD(m: number, d: number): [number, number, number] {
  const today = new Date();

  let y = today.getFullYear();
  if (m == 1 && today.getMonth() == 11) {
    y++;
  }

  return [y, m, d];
}
