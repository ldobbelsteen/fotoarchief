import { Photo } from "@prisma/client";
import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { photoMimes, photoSchema, postForm } from "../utils/api";

const concurrentUploads = 4;

export default function PhotoUpload(props: {
  albumId: string;
  onUpload: (p: Photo) => void; // eslint-disable-line no-unused-vars
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (ev: ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files) return toast.error("Geen bestanden geselecteerd");
    const files = Array.from(ev.target.files);
    const totalFiles = files.length;
    let finishedFiles = 0;
    setDisabled(true);

    const text = () => `Uploaden (${finishedFiles}/${totalFiles})`;
    const progress = toast.loading(text());

    const uploadNextPhoto = () => {
      const file = files.pop();
      if (file) uploadPhoto(file);
    };

    const uploadPhoto = (file: File) => {
      const form = new FormData();
      form.append("albumId", props.albumId.toString());
      form.append("photo", file);
      postForm("/api/photo/upload", form, photoSchema)
        .then(props.onUpload)
        .finally(() => {
          finishedFiles += 1;
          toast.loading(text(), { id: progress });
          if (finishedFiles === totalFiles) {
            toast.success("Uploaden voltooid", { id: progress });
            ev.target.value = "";
            setDisabled(false);
          } else {
            uploadNextPhoto();
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error(`Fout bij uploaden van '${file.name}'`);
        });
    };

    for (let i = 0; i < concurrentUploads; i++) {
      uploadNextPhoto();
    }
  };

  return (
    <>
      <input
        multiple
        type="file"
        ref={inputRef}
        className="hidden"
        accept={photoMimes.join(",")}
        onChange={handleSubmit}
        disabled={disabled}
      />
      <input
        type="button"
        value="Toevoegen"
        className="btn"
        onClick={() => inputRef.current?.click()}
      />
    </>
  );
}
