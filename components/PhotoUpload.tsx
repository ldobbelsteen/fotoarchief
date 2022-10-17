import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";

export const allowedMimes = ["image/jpeg", "image/png"] as const;

export default function PhotoUpload(props: {
  albumId: number;
  onUpload: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (ev: ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files) return toast.error("Geen bestanden geselecteerd");
    const files = Array.from(ev.target.files);
    setDisabled(true);

    let completed = 0;
    const text = () => `Uploaden (${completed}/${files.length})`;
    const progress = toast.loading(text());
    for (const file of files) {
      const form = new FormData();
      form.append("albumId", props.albumId.toString());
      form.append("photo", file);
      fetch("/api/photo/upload", {
        method: "POST",
        body: form,
      }).then(() => {
        completed += 1;
        toast.loading(text(), { id: progress });
        if (completed === files.length) {
          toast.success("Uploaden voltooid", { id: progress });
          ev.target.value = "";
          setDisabled(false);
          props.onUpload();
        }
      });
    }
  };

  return (
    <>
      <input
        multiple
        type="file"
        ref={inputRef}
        className="hidden"
        accept={allowedMimes.join(",")}
        onChange={handleSubmit}
        disabled={disabled}
      />
      <button className="btn" onClick={() => inputRef.current?.click()}>
        Toevoegen
      </button>
    </>
  );
}
