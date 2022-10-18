import { createReadStream, createWriteStream, promises as fs } from "fs";
import { Photo } from "@prisma/client";
import busboy from "busboy";
import type { NextApiRequest, NextApiResponse } from "next";
import probe from "probe-image-size";
import { z } from "zod";
import { photoMimes } from "../../../utils/api";
import { prisma } from "../../../utils/db";
import { randomUUID } from "../../../utils/misc";

const maxPhotoSize = 8 * 1024 * 1024;
export const photoDir = "./data/photos/";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Photo>
) {
  await fs.mkdir(photoDir, { recursive: true });

  return new Promise<Photo>((resolve, reject) => {
    const bb = busboy({
      headers: req.headers,
      limits: {
        fields: 1, // only allow albumId field
        fieldNameSize: 7,
        fieldSize: 36,
        files: 1, // only allow single photo
        fileSize: maxPhotoSize,
      },
    });

    interface Upload {
      id: string;
      name: string;
      mime: string;
    }

    let albumId: string | null = null;
    let photo: Upload | null = null;

    const abort = (err: unknown) => {
      req.unpipe(bb);
      if (photo) {
        fs.unlink(photoDir + photo.id);
      }
      reject(err);
    };

    bb.on("error", abort);
    bb.on("fieldsLimit", abort);
    bb.on("filesLimit", abort);
    bb.on("partsLimit", abort);

    bb.on("field", (name, value) => {
      if (name !== "albumId") {
        bb.emit("error", new Error("wrong field name"));
        return;
      }
      const parse = z.string().uuid().safeParse(value);
      if (!parse.success) {
        bb.emit("error", new Error("invalid identifier"));
        return;
      }
      albumId = parse.data;
    });

    bb.on("file", (name, file, info) => {
      if (name !== "photo") {
        bb.emit("error", new Error("wrong file name"));
        return;
      }
      const mimes = photoMimes as readonly string[];
      if (!mimes.includes(info.mimeType)) {
        bb.emit("error", new Error("unsupported mime type"));
        return;
      }
      photo = {
        id: randomUUID(),
        name: info.filename,
        mime: info.mimeType,
      };
      file.on("limit", () => bb.emit("error", new Error("file limit reached")));
      const write = createWriteStream(photoDir + photo.id);
      file.pipe(write);
    });

    bb.on("close", async () => {
      if (!albumId || !photo) {
        bb.emit("error", new Error("incomplete request body"));
        return;
      }
      const dimensions = await probe(createReadStream(photoDir + photo.id));
      if (!dimensions.width || !dimensions.height) {
        bb.emit("error", new Error("could not determine image dimensions"));
        return;
      }
      const record = await prisma.photo.create({
        data: {
          id: photo.id,
          name: photo.name,
          mime: photo.mime,
          width: dimensions.width,
          height: dimensions.height,
          albumId: albumId,
        },
      });
      res.json(record);
      resolve(record);
    });

    req.pipe(bb);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
