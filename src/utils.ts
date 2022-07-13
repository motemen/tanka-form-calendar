export function fixupYMD(m: number, d: number): [number, number, number] {
  const today = new Date();

  let y = today.getFullYear();
  if (m == 1 && today.getMonth() == 11) {
    y++;
  }

  return [y, m, d];
}

export async function computeDigest(input: string): Promise<string> {
  const hash = await crypto.subtle.digest({ name: "MD5" }, new TextEncoder().encode(input));
  return [...new Uint8Array(hash)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
