import { useState } from "react";
import Modal from "./Modal";

export default function ButtonWithConfirm(props: {
  buttonText: string;
  confirmationText: string;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <input
        type="button"
        className="btn"
        value={props.buttonText}
        onClick={() => setConfirming(true)}
      />
      {confirming && (
        <Modal>
          <div className="flex w-full h-full justify-center items-center">
            <div className="flex flex-col rounded-lg p-4 m-4 bg-demos-400">
              <p>{props.confirmationText}</p>
              <div>
                <input
                  type="button"
                  className="btn"
                  value="Bevestigen"
                  onClick={() => {
                    setConfirming(false);
                    props.onConfirm();
                  }}
                />
                <input
                  type="button"
                  className="btn"
                  value="Annuleren"
                  onClick={() => setConfirming(false)}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
