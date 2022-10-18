import { z } from "zod";

export const photoMimes = ["image/jpeg", "image/png"] as const;

export const photoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  mime: z.enum(photoMimes),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  albumId: z.string().uuid(),
});
