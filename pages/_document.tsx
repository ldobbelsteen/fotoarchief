import { Html, Head, Main, NextScript } from "next/document";

const Document = () => (
  <Html lang="nl" className="h-full">
    <Head>
      <style>{`#__next { height: 100% }`}</style>
      <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=optional"
        rel="stylesheet"
      />
    </Head>
    <body className="h-full">
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
