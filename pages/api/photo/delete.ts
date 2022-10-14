import { promises as fs } from "fs";
import { Photo } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { idSchema } from "../../../utils/api";
import { prisma } from "../../../utils/db";
import { photoDir } from "../photo/upload";

const schema = z.object({
  id: idSchema,
});

export const deletePhoto = async (id: number) => {
  await fs.unlink(photoDir + id);
  return await prisma.photo.delete({
    where: {
      id: id,
    },
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Photo>
) {
  const query = schema.safeParse(JSON.parse(req.body));
  if (!query.success) return res.status(400).end();

  const photo = await deletePhoto(query.data.id);

  return res.json(photo);
}
