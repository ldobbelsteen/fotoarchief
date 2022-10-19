import type { NextPage } from "next";
import Image from "next/future/image";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import useSWR from "swr";
import { z } from "zod";
import PhotoUpload from "../../components/PhotoUpload";
import { albumSchema, photoSchema, post } from "../../utils/api";
import { placeholder } from "../../utils/misc";
import {
  albumDeleteSchema,
  albumThumbnailSchema,
  photoDeleteSchema,
} from "../../utils/schema";
import { Contents } from "../api/album/contents";

const galleryPhotoHeight = 256;
const maxGrowFactor = 1.5;

const schema = z.object({
  albumId: z.string().uuid(),
  enlarged: z.string().uuid().optional(),
});

const Gallery: NextPage = () => {
  const router = useRouter();
  const query = schema.safeParse(router.query);
  const { data, mutate, error } = useSWR<Contents, Error>(
    query.success ? "/api/album/contents?id=" + query.data.albumId : null
  );
  if (error) {
    toast.error("Fout bij ophalen foto's");
    console.error(error);
  }

  if (!query.success || !data) {
    return <></>;
  }

  const enlarged = data.photos.find(
    (photo) => photo.id === query.data.enlarged
  );

  return (
    <>
      <Head>
        <title>{"Album - " + data.name}</title>
      </Head>
      <h2>
        Album <span className="font-normal">{data.name}</span>
      </h2>
      <div className="flex flex-wrap justify-center">
        <PhotoUpload
          albumId={data.id}
          onUpload={(photo) => {
            mutate((d) => {
              d?.photos.push(photo);
              return d;
            });
          }}
        />
        <input
          type="button"
          value="Verwijderen"
          className="btn"
          onClick={() => {
            post(
              "/api/album/delete",
              { id: data.id },
              albumDeleteSchema,
              z.object({})
            )
              .then(() => toast.success("Album verwijderd"))
              .finally(() => router.push("/"))
              .catch(() => toast.error("Fout bij verwijderen van album"));
          }}
        />
        <Link href="/">
          <a>
            <button className="btn">Terug</button>
          </a>
        </Link>
      </div>
      {data.photos.length > 0 ? (
        <div className="flex flex-wrap gap-2 p-2 pt-4">
          {data.photos.map((photo, i) => (
            <button
              key={i}
              className="overflow-hidden relative"
              style={{
                flexGrow: photo.width,
                flexShrink: photo.width,
                height: galleryPhotoHeight,
                width: (photo.width * galleryPhotoHeight) / photo.height,
                maxWidth:
                  (maxGrowFactor * photo.width * galleryPhotoHeight) /
                  photo.height,
              }}
            >
              <Link
                href={{
                  pathname: router.pathname,
                  query: { ...router.query, enlarged: photo.id },
                }}
              >
                <Image
                  placeholder="blur"
                  blurDataURL={placeholder}
                  className="object-cover rounded-lg"
                  src={"/api/photo/" + photo.id}
                  alt={photo.name}
                  sizes="50vw"
                  quality={50}
                  fill
                />
              </Link>
            </button>
          ))}
          {enlarged && (
            <div className="fixed left-0 top-0 w-screen h-screen bg-demos-400/90 flex flex-col">
              <div className="flex flex-col w-full h-full">
                <div className="flex flex-wrap justify-center">
                  <div className="flex justify-center items-center p-2">
                    {enlarged.name}
                  </div>
                  <button className="btn">
                    <a
                      href={"/api/photo/" + enlarged.id}
                      download={enlarged.name}
                    >
                      Downloaden
                    </a>
                  </button>
                  <input
                    type="button"
                    value="Verwijderen"
                    className="btn"
                    onClick={() => {
                      post(
                        "/api/photo/delete",
                        { id: enlarged.id },
                        photoDeleteSchema,
                        photoSchema
                      )
                        .then(() => {
                          mutate((data) => {
                            if (data) {
                              data.photos = data.photos.filter(
                                (photo) => photo.id !== enlarged.id
                              );
                            }
                            return data;
                          });
                          toast.success("Foto verwijderd");
                          return;
                        })
                        .finally(() => router.back())
                        .catch(() =>
                          toast.error("Fout bij verwijderen van foto")
                        );
                    }}
                  />
                  <input
                    type="button"
                    value="Maak omslagfoto"
                    className="btn"
                    onClick={() => {
                      post(
                        "/api/album/thumbnail",
                        {
                          albumId: data.id,
                          photoId: enlarged.id,
                        },
                        albumThumbnailSchema,
                        albumSchema
                      )
                        .then(() => toast.success("Ingesteld als omslagfoto"))
                        .catch(() =>
                          toast.error("Fout bij instellen als omslagfoto")
                        );
                    }}
                  />
                  <Link
                    href={{
                      pathname: router.pathname,
                      query: (() => {
                        const newQuery = { ...router.query };
                        delete newQuery["enlarged"];
                        return newQuery;
                      })(),
                    }}
                  >
                    <button className="btn">Sluiten</button>
                  </Link>
                </div>
                <div className="relative flex-grow">
                  <Image
                    placeholder="blur"
                    blurDataURL={placeholder}
                    className="object-contain p-2 pt-0"
                    src={"/api/photo/" + enlarged.id}
                    alt={enlarged.name}
                    sizes="100vw"
                    quality={100}
                    fill
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <span className="p-2">Geen foto&apos;s</span>
      )}
    </>
  );
};

export default Gallery;
