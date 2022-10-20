import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

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
    <Toaster />
    <main className="flex flex-col items-center justify-center bg-demos-300 text-demos-100 min-h-full text-center p-2">
      <Component {...pageProps} />
    </main>
  </SWRConfig>
);

export default App;
