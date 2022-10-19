import { createReadStream, createWriteStream, promises as fs } from "fs";
import { Photo } from "@prisma/client";
import busboy from "busboy";
import type { NextApiRequest, NextApiResponse } from "next";
import probe from "probe-image-size";
import { z } from "zod";
import { prisma } from "../../../utils/db";
import { randomUUID } from "../../../utils/misc";
import { photoMimes } from "../../../utils/schema";

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
      try {
        if (name !== "albumId") {
          throw new Error("wrong field name");
        }
        const parse = z.string().uuid().safeParse(value);
        if (!parse.success) {
          throw new Error("invalid identifier");
        }
        albumId = parse.data;
      } catch (err) {
        bb.emit("error", err);
      }
    });

    bb.on("file", (name, file, info) => {
      try {
        if (name !== "photo") {
          throw new Error("wrong file name");
        }
        if (!photoMimes.includes(info.mimeType)) {
          throw new Error("unsupported mime type");
        }
        photo = {
          id: randomUUID(),
          name: info.filename,
          mime: info.mimeType,
        };
        file.on("limit", () => {
          throw new Error("file limit reached");
        });
        const write = createWriteStream(photoDir + photo.id);
        file.pipe(write);
      } catch (err) {
        bb.emit("error", err);
      }
    });

    bb.on("close", async () => {
      try {
        if (!albumId || !photo) {
          throw new Error("incomplete request body");
        }
        const dimensions = await probe(createReadStream(photoDir + photo.id));
        if (!dimensions.width || !dimensions.height) {
          throw new Error("could not determine image dimensions");
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
      } catch (err) {
        bb.emit("error", err);
      }
    });

    req.pipe(bb);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
