import { toast, Toaster, ToastBar } from "react-hot-toast";

export default function CustomToaster() {
  return (
    <Toaster>
      {(t) => (
        <button onClick={() => toast.dismiss(t.id)}>
          <ToastBar toast={t} />
        </button>
      )}
    </Toaster>
  );
}
