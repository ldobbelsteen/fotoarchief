import { NextPage } from "next";
import Image from "next/future/image";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import { post } from "../../utils/api";
import { albumCreateSchema, albumSchema } from "../../utils/schema";

const CreateAlbum: NextPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (ev: ChangeEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setDisabled(true);
    post(
      "/api/album/create",
      {
        name: name,
      },
      albumCreateSchema,
      albumSchema
    )
      .then(({ id }) => router.push("/album/" + id))
      .catch(console.error);
  };

  return (
    <>
      <div className="flex flex-wrap justify-center">
        <button onClick={() => router.back()}>
          <Image
            className="m-1"
            src="/back.svg"
            alt="Terug"
            width={20}
            height={20}
          />
        </button>
        <h2>Album aanmaken</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={disabled} className="flex flex-col">
          <input
            required
            id="name"
            type="text"
            value={name}
            className="ipt"
            onChange={(e) => setName(e.target.value)}
            placeholder="Voeg een titel toe"
          />
          <div>
            <input className="btn" type="submit" value="Aanmaken" />
          </div>
        </fieldset>
      </form>
    </>
  );
};

export default CreateAlbum;
