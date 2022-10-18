import crypto from "crypto";

export const placeholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+uvPfwAJwwPspv4a9gAAAABJRU5ErkJggg==";

export const randomUUID = () => crypto.randomUUID();
