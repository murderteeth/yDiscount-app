import { JetBrains_Mono } from 'next/font/google'

const font = JetBrains_Mono({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={`bg-orange-900 flex min-h-screen flex-col items-center justify-between p-24 ${font.className}`}>
      <h1 className="text-orange-200 text-4xl">yDiscount</h1>
    </main>
  )
}
