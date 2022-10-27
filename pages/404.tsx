import { NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => {
  return (
    <div className="flex flex-col">
      <h2 className="p-0">404</h2>
      <span>Pagina niet gevonden</span>
      <div>
        <Link href="/">
          <input className="btn" type="button" value="Startpagina" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
