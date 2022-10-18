import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";

export default function PostButton(props: {
  text: string;
  endpoint: string;
  body: string;
  callback?: () => void;
}) {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (ev: ChangeEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setDisabled(true);
    fetch(props.endpoint, {
      method: "POST",
      body: props.body,
    })
      .then(() => {
        if (props.callback) {
          props.callback();
        }
        return;
      })
      .catch((err) => toast.error(JSON.stringify(err)));
  };

  return (
    <form onSubmit={handleSubmit}>
      <button className="btn" type="submit" disabled={disabled}>
        {props.text}
      </button>
    </form>
  );
}
