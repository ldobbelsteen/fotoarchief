import { Album } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { idSchema } from "../../../utils/api";
import { prisma } from "../../../utils/db";
import { deletePhoto } from "../photo/delete";

const schema = z.object({
  id: idSchema,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Album>
) {
  const query = schema.safeParse(JSON.parse(req.body));
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
