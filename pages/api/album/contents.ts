import { Album, Photo } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "../../../utils/db";

const schema = z.object({
  id: z.string().uuid(),
});

export type Contents = Album & { photos: Photo[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Contents>
) {
  const query = schema.safeParse(req.query);
  if (!query.success) return res.status(400).end();

  const album = await prisma.album.findUnique({
    where: {
      id: query.data.id,
    },
    include: {
      photos: true,
    },
  });
  if (!album) return res.status(404).end();

  return res.json(album);
}
