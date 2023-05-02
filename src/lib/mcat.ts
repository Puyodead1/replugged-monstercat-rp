import { z } from "zod";
import { getSecret } from "../config";

const BASE_URL = "https://player.monstercat.app/api/currently-playing?";

export const MonstercatError = z.object({
  Errors: z.null(),
  Message: z.string(),
  Name: z.string(),
  StatusCode: z.number(),
});
export type MonstercatError = z.infer<typeof MonstercatError>;

export const MonstercatCurrentlyPlaying = z.object({
  CurrentlyPlaying: z.object({
    ArtistsTitle: z.string(),
    CatalogId: z.string(),
    CurrentPlayLocation: z.number(),
    Duration: z.number(),
    PlayTime: z.string(),
    ReleaseId: z.string(),
    ReleaseTitle: z.string(),
    TrackId: z.string(),
    TrackTitle: z.string(),
    TrackVersion: z.string(),
    UserId: z.string(),
  }),
});
export type MonstercatCurrentlyPlaying = z.infer<typeof MonstercatCurrentlyPlaying>;

export async function getCurrentSong(): Promise<MonstercatCurrentlyPlaying> {
  const headers = new Headers({
    Accept: "application/json",
  });

  let secret = getSecret();
  if (!secret) throw new Error("No secret provided");

  const params = new URLSearchParams({
    code: secret,
  });

  const res = await fetch(`${BASE_URL}${params}`, {
    headers,
  });
  const json = await res.json();

  const error = MonstercatError.safeParse(json);
  if (error.success) throw new Error(`Error ${error.data.Name}: ${error.data.Message}`);

  return MonstercatCurrentlyPlaying.parse(json);
}

export function getImageURL(catalogId: string): string {
  return `https://cdx.monstercat.com/?width=256&encoding=webp&url=https%3A%2F%2Fwww.monstercat.com%2Frelease%2F${catalogId}%2Fcover`;
}
