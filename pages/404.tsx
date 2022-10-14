import { NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => {
  return (
    <div className="flex flex-col">
      <h2 className="p-0">404</h2>
      <span>Pagina niet gevonden</span>
      <Link href="/">
        <button className="btn">Startpagina</button>
      </Link>
    </div>
  );
};

export default NotFound;
