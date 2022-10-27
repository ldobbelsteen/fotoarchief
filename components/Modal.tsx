import { PropsWithChildren, useEffect } from "react";

export default function Modal(props: PropsWithChildren) {
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "";
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 right-0 h-screen z-50 bg-demos-300/90">
      {props.children}
    </div>
  );
}
