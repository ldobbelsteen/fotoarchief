import type { NextPage } from "next";
import Image from "next/future/image";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import useSWR from "swr";
import { z } from "zod";
import ButtonWithConfirm from "../../components/ButtonWithConfirm";
import Modal from "../../components/Modal";
import PhotoUpload from "../../components/PhotoUpload";
import { post } from "../../utils/api";
import { placeholder } from "../../utils/misc";
import {
  albumDeleteSchema,
  albumSchema,
  albumThumbnailSchema,
  photoDeleteSchema,
  photoSchema,
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

  const filterPhoto = (id: string) => {
    mutate((data) => {
      if (data) {
        data.photos = data.photos.filter((photo) => photo.id !== id);
      }
      return data;
    }).catch(console.error);
  };

  return (
    <>
      <Head>
        <title>{"Album - " + data.name}</title>
      </Head>
      <div className="flex flex-wrap justify-center">
        <Link href="/">
          <button>
            <Image
              className="m-1"
              src="/back.svg"
              alt="Terug"
              width={20}
              height={20}
            />
          </button>
        </Link>
        <h2>
          Album <span className="font-normal">{data.name}</span>
        </h2>
      </div>
      <div className="flex flex-wrap justify-center">
        <PhotoUpload
          albumId={data.id}
          onUpload={(photo) => {
            mutate((d) => {
              d?.photos.push(photo);
              return d;
            }).catch(console.error);
          }}
        />
        <ButtonWithConfirm
          buttonText="Album verwijderen"
          confirmationText="Weet je zeker dat je dit album wilt verwijderen?"
          onConfirm={() => {
            post(
              "/api/album/delete",
              { id: data.id },
              albumDeleteSchema,
              z.object({})
            )
              .then(() => toast.success("Album verwijderd"))
              .finally(() => {
                router.push("/").catch(console.error);
              })
              .catch(() => toast.error("Fout bij verwijderen van album"));
          }}
        />
      </div>
      {data.photos.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 p-2 pt-4">
          {data.photos.map((photo, i) => (
            <button
              key={i}
              className="relative"
              style={{
                flexGrow: photo.width,
                flexShrink: photo.width,
                height: galleryPhotoHeight,
                minWidth:
                  ((photo.width * galleryPhotoHeight) / photo.height) *
                  (1 / maxGrowFactor),
                flexBasis: (photo.width * galleryPhotoHeight) / photo.height,
                maxWidth:
                  ((photo.width * galleryPhotoHeight) / photo.height) *
                  maxGrowFactor,
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
            <Modal>
              <div className="w-full h-full">
                <Image
                  placeholder="blur"
                  blurDataURL={placeholder}
                  className="object-contain"
                  src={"/api/photo/" + enlarged.id}
                  alt={enlarged.name}
                  sizes="100vw"
                  quality={100}
                  fill
                />
              </div>
              <div className="fixed left-0 top-0 right-0">
                <div className="float-left">
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
                    <button className="m-2">
                      <Image
                        className="m-2"
                        src="/back.svg"
                        alt="Terug"
                        width={20}
                        height={20}
                      />
                    </button>
                  </Link>
                </div>
                <div className="float-right">
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
                          filterPhoto(enlarged.id);
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
                </div>
              </div>
            </Modal>
          )}
        </div>
      ) : (
        <span className="p-2">Geen foto&apos;s</span>
      )}
    </>
  );
};

export default Gallery;
