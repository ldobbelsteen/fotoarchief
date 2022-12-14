import { Album } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../utils/db";
import { albumDeleteSchema } from "../../../utils/schema";
import { deletePhoto } from "../photo/delete";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Album>
) {
  const query = albumDeleteSchema.safeParse(JSON.parse(req.body as string));
  if (!query.success) return res.status(400).end();

  const photos = await prisma.photo.findMany({
    where: {
      albumId: query.data.id,
    },
  });

  for (const photo of photos) {
    await deletePhoto(photo.id);
  }

  const album = await prisma.album.delete({
    where: {
      id: query.data.id,
    },
  });

  return res.json(album);
}
