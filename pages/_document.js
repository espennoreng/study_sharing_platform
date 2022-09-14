import { Html, Head, Main, NextScript } from "next/document";
import { GA_TRACKING_ID } from "../lib/gtag";

export default function Document() {
  return (
    <Html lang="no">
      <Head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favi.png" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Finnfasit" />
        <meta name="application-name" content="Finnfasit" />

        <meta name="apple-touch-icon" ref="/favi.png" />
        <meta name="msapplication-TileImage" content="/favi.png" />
        <meta name="msapplication-TileColor" content="#FFFFFF" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Finnfasit.no" />
        <meta property="og:image" content="/favi.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="Finnfasit.no logo" />
        <meta property="og:locale" content="nb_NO" />
        <meta property="og:locale:alternate" content="nn_NO" />

        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </>
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
