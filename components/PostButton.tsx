import { ChangeEvent, PropsWithChildren, useState } from "react";
import { z } from "zod";
import { postRequest } from "../utils/api";

export default function PostButton(
  props: PropsWithChildren<{
    endpoint: string;
    body: string;
    onSuccess: () => void;
    onError: (err: unknown) => void; // eslint-disable-line no-unused-vars
  }>
) {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (ev: ChangeEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setDisabled(true);
    postRequest(props.endpoint, props.body, z.object({}))
      .then(props.onSuccess)
      .finally(() => setDisabled(false))
      .catch(props.onError);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button className="btn" type="submit" disabled={disabled}>
        {props.children}
      </button>
    </form>
  );
}
