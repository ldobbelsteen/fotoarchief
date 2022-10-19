import { promises as fs } from "fs";
import { Photo } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../utils/db";
import { photoDeleteSchema } from "../../../utils/schema";
import { photoDir } from "../photo/upload";

export const deletePhoto = async (id: string) => {
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
  const query = photoDeleteSchema.safeParse(JSON.parse(req.body));
  if (!query.success) return res.status(400).end();

  const photo = await deletePhoto(query.data.id);

  return res.json(photo);
}
