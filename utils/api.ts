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

/**
 * Helper function for sending POST requests and validating the response data.
 * Throws an error when the response is not OK or the response data validation
 * fails.
 */
export const postRequest = async <T = never>(
  url: string,
  body: string | FormData,
  schema: z.Schema<T>
): Promise<T> => {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: body,
    });
    if (!res.ok) {
      throw new Error(`${res.status} POST failed`);
    }
    const json = await res.json();
    return schema.parse(json);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
