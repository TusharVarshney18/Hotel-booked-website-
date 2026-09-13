import { cookies } from "next/headers";

export const FOLIO_COOKIE = "aurelia-folio";

export async function readFolioIds() {
  const store = await cookies();
  const raw = store.get(FOLIO_COOKIE)?.value;
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function writeFolioIds(ids: string[]) {
  const store = await cookies();
  store.set(FOLIO_COOKIE, JSON.stringify(Array.from(new Set(ids))), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function addFolioId(id: string) {
  const current = await readFolioIds();
  await writeFolioIds([id, ...current]);
}
