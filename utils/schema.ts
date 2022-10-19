import { z } from "zod";

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
