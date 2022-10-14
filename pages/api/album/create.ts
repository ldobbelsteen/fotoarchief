import { Album } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "../../../utils/db";

const schema = z.object({
  name: z.string().min(1),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Album>
) {
  const query = schema.safeParse(JSON.parse(req.body));
  if (!query.success) return res.status(400).end();

  const album = await prisma.album.create({
    data: {
      name: query.data.name,
    },
  });

  return res.json(album);
}
