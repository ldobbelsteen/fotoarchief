import { z } from "zod";

const photoMimesEnum = ["image/jpeg", "image/png"] as const;
export const photoMimes = photoMimesEnum as readonly string[];

export const photoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  mime: z.enum(photoMimesEnum),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  albumId: z.string().uuid(),
});

export const albumSchema = z.object({
  id: z.string().uuid(),
});

export const albumCreateSchema = z.object({
  name: z.string().min(1),
});

export const albumDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const albumThumbnailSchema = z.object({
  albumId: z.string().uuid(),
  photoId: z.string().uuid(),
});

export const photoDeleteSchema = z.object({
  id: z.string().uuid(),
});
