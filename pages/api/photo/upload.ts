import { promises as fs } from "fs";
import { Photo } from "@prisma/client";
import imageSize from "image-size";
import { Form } from "multiparty";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { allowedMimes } from "../../../components/PhotoUpload";
import { stringIdSchema } from "../../../utils/api";
import { prisma } from "../../../utils/db";

export const photoDir = "./data/photos/";
const tmpPhotoDir = photoDir + "uploads/";

const schema = z.object({
  albumId: z
    .array(stringIdSchema)
    .length(1)
    .transform((arr) => arr[0]),
  photo: z
    .array(
      z.object({
        originalFilename: z.string().min(1),
        path: z.string().min(1),
        headers: z.object({
          "content-type": z.enum(allowedMimes),
        }),
      })
    )
    .length(1)
    .transform((arr) => arr[0]),
});

type Upload = z.infer<typeof schema>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Photo>
) {
  await fs.mkdir(tmpPhotoDir, { recursive: true });

  const form = new Form({
    uploadDir: tmpPhotoDir,
  });

  const data = await new Promise<Upload>((res, rej) => {
    form.parse(req, (err, rawFields, rawFiles) => {
      if (err) return rej({ err });
      const rawBody = { ...rawFields, ...rawFiles };
      const body = schema.safeParse(rawBody);
      if (!body.success) return rej(body.error);
      res(body.data);
    });
  });

  const dimensions = imageSize(data.photo.path);
  if (!dimensions.width || !dimensions.height)
    throw Error("image dimensions could not be determined");

  const photo = await prisma.photo.create({
    data: {
      name: data.photo.originalFilename,
      mime: data.photo.headers["content-type"],
      width: dimensions.width,
      height: dimensions.height,
      albumId: data.albumId,
    },
  });

  await fs.rename(data.photo.path, photoDir + photo.id);

  await prisma.album.update({
    where: {
      id: data.albumId,
    },
    data: {
      thumbnailId: photo.id,
    },
  });

  return res.json(photo);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
