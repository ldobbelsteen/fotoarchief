import { Album } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../utils/db";
import { randomUUID } from "../../../utils/misc";
import { albumCreateSchema } from "../../../utils/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Album>
) {
  const query = albumCreateSchema.safeParse(JSON.parse(req.body as string));
  if (!query.success) return res.status(400).end();

  const album = await prisma.album.create({
    data: {
      id: randomUUID(),
      name: query.data.name,
    },
  });

  return res.json(album);
}
