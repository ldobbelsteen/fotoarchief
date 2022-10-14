import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { stringIdSchema } from "../../../utils/api";
import { prisma } from "../../../utils/db";
import { photoDir } from "./upload";

const schema = z.object({
  photoId: stringIdSchema,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer>
) {
  const query = schema.safeParse(req.query);
  if (!query.success) return res.status(400).end();

  const photo = await prisma.photo.findUnique({
    where: {
      id: query.data.photoId,
    },
  });

  if (!photo) {
    return res.status(404).end();
  }

  const buffer = await fs.readFile(photoDir + query.data.photoId);
  res.setHeader("Content-Type", photo.mime);
  return res.send(buffer);
}
