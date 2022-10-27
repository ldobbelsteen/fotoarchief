import { NextPage } from "next";
import Link from "next/link";

const InternalServerError: NextPage = () => {
  return (
    <div className="flex flex-col">
      <h2 className="p-0">500</h2>
      <span>Interne server error</span>
      <div>
        <Link href="/">
          <input className="btn" type="button" value="Startpagina" />
        </Link>
      </div>
    </div>
  );
};

export default InternalServerError;
