import { z } from "zod";

export const idSchema = z.number().int().nonnegative();

export const stringIdSchema = z.preprocess(
  (v) => (typeof v === "string" ? parseInt(v) : v),
  idSchema
);
