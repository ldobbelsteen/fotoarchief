import { ChangeEvent, useRef, useState } from "react";

export const allowedMimes = ["image/jpeg", "image/png"] as const;

export default function PhotoUpload(props: {
  albumId: number;
  onUpload: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = (ev: ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files) {
      setIsUploading(true);
      const form = new FormData();
      form.append("albumId", props.albumId.toString());
      for (const file of Array.from(ev.target.files)) {
        form.append("photos", file);
      }
      fetch("/api/photo/upload", {
        method: "POST",
        body: form,
      }).then(() => {
        ev.target.value = "";
        setIsUploading(false);
        props.onUpload();
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
        onChange={handleFiles}
        disabled={isUploading}
      />
      <button className="btn" onClick={() => inputRef.current?.click()}>
        Toevoegen
      </button>
    </>
  );
}
