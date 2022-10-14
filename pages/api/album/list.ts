import { Photo } from "@prisma/client";
import type { Album } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../utils/db";

export type List = (Album & { thumbnail: Photo | null })[];

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<List>
) {
  const albums = await prisma.album.findMany({
    include: {
      thumbnail: true,
    },
  });

  return res.json(albums);
}
