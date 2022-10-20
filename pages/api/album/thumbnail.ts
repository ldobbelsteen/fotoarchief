import { Album } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../utils/db";
import { albumThumbnailSchema } from "../../../utils/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Album>
) {
  const query = albumThumbnailSchema.safeParse(JSON.parse(req.body as string));
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
