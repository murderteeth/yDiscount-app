import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body style={{
        backgroundColor: 'hsl(var(--color-neutral-900))'
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
