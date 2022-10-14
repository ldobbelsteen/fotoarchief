import type { NextPage } from "next";
import Image from "next/future/image";
import Link from "next/link";
import toast from "react-hot-toast";
import useSWR from "swr";
import { loading } from "../utils/misc";
import { List } from "./api/album/list";

const Home: NextPage = () => {
  const { data, error } = useSWR<List, Error>("/api/album/list");
  if (error) toast.error(error.message);

  return (
    <>
      <div className="flex flex-wrap justify-center items-center rounded-xl bg-demos-400 p-2 px-4 m-2">
        <Image src="/logo.svg" alt="Logo" width={64} height={64} />
        <h1>Fotoarchief</h1>
      </div>
      <Link href="/album/create">
        <button className="btn">Nieuw album</button>
      </Link>
      {data && (
        <div className="flex flex-wrap justify-center gap-2 p-2">
          {data.map((album, i) => (
            <Link key={i} href={"/album/" + album.id}>
              <button className="card">
                <div className="w-48 h-48 relative block overflow-hidden">
                  <Image
                    placeholder="blur"
                    blurDataURL={loading}
                    src={
                      album.thumbnail
                        ? "/api/photo/" + album.thumbnail.id
                        : "/placeholder.svg"
                    }
                    alt={album.name}
                    className="object-cover rounded-md"
                    fill
                  />
                </div>
                <h4 className="pb-0 w-48">{album.name}</h4>
              </button>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Home;