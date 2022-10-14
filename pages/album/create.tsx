import { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";

const CreateAlbum: NextPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (ev: ChangeEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setDisabled(true);
    fetch("/api/album/create", {
      method: "POST",
      body: JSON.stringify({
        name: name,
      }),
    })
      .then((res) => res.json())
      .then((album) => router.push("/album/" + album.id));
  };

  return (
    <>
      <h2>Album aanmaken</h2>
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
          <div className="flex flex-wrap justify-center">
            <button className="btn" type="submit">
              Aanmaken
            </button>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
            >
              Terug
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
};

export default CreateAlbum;
