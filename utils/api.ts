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

export const albumSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Helper function for validating and sending POST requests and validating the
 * response data. Throws an error when the response is not OK or data validation
 * fails.
 */
export const post = async <T, U>(
  url: string,
  body: T,
  bodySchema: z.Schema<T>,
  responseSchema: z.Schema<U>
): Promise<U> => {
  try {
    const parsed = bodySchema.parse(body);
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    if (!res.ok) {
      throw new Error(`${res.status} POST failed`);
    }
    const json = await res.json();
    return responseSchema.parse(json);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * Helper function for posting forms and validating the response data. Throws an
 * error when the response is not OK or data validation fails.
 */
export const postForm = async <T>(
  url: string,
  body: FormData,
  responseSchema: z.Schema<T>
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
    return responseSchema.parse(json);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
