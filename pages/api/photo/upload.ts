import { createWriteStream, unlinkSync, promises } from "fs";
import { PassThrough } from "stream";
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
  await promises.mkdir(photoDir, { recursive: true });

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

    let albumId: string | null = null;
    let photoId: string | null = null;
    let photoName: string | null = null;
    let photoMime: string | null = null;
    let photoWidth: number | null = null;
    let photoHeight: number | null = null;

    bb.on("error", (err: unknown) => {
      req.unpipe(bb);
      if (photoId) {
        unlinkSync(photoDir + photoId);
      }
      reject(err);
    });

    bb.on("fieldsLimit", () =>
      bb.emit("error", new Error("field limit reached"))
    );
    bb.on("filesLimit", () =>
      bb.emit("error", new Error("files limit reached"))
    );
    bb.on("partsLimit", () =>
      bb.emit("error", new Error("parts limit reached"))
    );

    bb.on("field", (name, value) => {
      try {
        if (name !== "albumId") {
          throw new Error("invalid field name");
        }
        albumId = z.string().uuid().parse(value);
      } catch (err) {
        bb.emit("error", err);
      }
    });

    let waitingForDimensions = false;

    bb.on("file", (name, file, info) => {
      try {
        if (name !== "photo") {
          throw new Error("wrong file name");
        }
        if (!photoMimes.includes(info.mimeType)) {
          throw new Error("unsupported mime type");
        }
        photoId = randomUUID();
        photoName = info.filename;
        photoMime = info.mimeType;
        file.on("limit", () => {
          throw new Error("file limit reached");
        });
        const fileStream = file.pipe(new PassThrough());
        const dimensionsStream = file.pipe(new PassThrough());
        fileStream.pipe(createWriteStream(photoDir + photoId));
        probe(dimensionsStream)
          .then((dims) => {
            photoWidth = dims.width;
            photoHeight = dims.height;
            if (waitingForDimensions) {
              bb.emit("close");
            }
            return;
          })
          .catch((err) => bb.emit("error", err));
      } catch (err) {
        bb.emit("error", err);
      }
    });

    bb.on("close", () => {
      try {
        if (!photoWidth || !photoHeight) {
          waitingForDimensions = true;
          return;
        }
        if (!albumId || !photoId || !photoName || !photoMime) {
          throw new Error("incomplete request body");
        }
        prisma.photo
          .create({
            data: {
              id: photoId,
              name: photoName,
              mime: photoMime,
              width: photoWidth,
              height: photoHeight,
              albumId: albumId,
            },
          })
          .then((record) => {
            res.json(record);
            resolve(record);
            return;
          })
          .catch((err) => {
            throw err;
          });
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
