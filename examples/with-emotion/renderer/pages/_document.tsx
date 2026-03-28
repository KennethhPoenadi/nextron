import { Html, Head, Main, NextScript } from 'next/document'
import { css, Global } from '@emotion/react'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
      </Head>
      <Global
        styles={css`
          html,
          body {
            margin: 0;
            padding: 0;
            min-height: 100%;
          }

          body {
            padding: 2rem 4rem;
            background: papayawhip;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 24px;
          }
        `}
      />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
