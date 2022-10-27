import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SWRConfig } from "swr";
import CustomToaster from "../components/CustomToaster";

const App = ({ Component, pageProps }: AppProps) => (
  <SWRConfig
    value={{
      fetcher: (url: string, init: RequestInit) =>
        fetch(url, init).then((res) => res.json()),
    }}
  >
    <Head>
      <title>Fotoarchief</title>
    </Head>
    <CustomToaster />
    <main className="flex flex-col items-center justify-center overflow-hidden bg-demos-300 text-demos-100 min-h-full text-center p-2">
      <Component {...pageProps} />
    </main>
  </SWRConfig>
);

export default App;
