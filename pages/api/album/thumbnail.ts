import { Album } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { idSchema } from "../../../utils/api";
import { prisma } from "../../../utils/db";

const schema = z.object({
  albumId: idSchema,
  photoId: idSchema,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Album>
) {
  const query = schema.safeParse(JSON.parse(req.body));
  if (!query.success) return res.status(400).end();

  const album = await prisma.album.update({
    where: {
      id: query.data.albumId,
    },
    data: {
      thumbnailId: query.data.photoId,
    },
  });

  return res.json(album);
}
