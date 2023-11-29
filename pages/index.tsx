
export default function Home() {
  return <main className={`
    relative max-w-6xl min-h-screen
    mx-auto mt-20 sm:mt-0 sm:p-24 sm:pb-40
    flex flex-col sm:flex-row items-center gap-12`}>

    <div className="sm:w-2/3">
      <h1 className="my-6 sm:my-8 text-3xl md:text-5xl font-black">yDiscount</h1>
      <div className={`pl-4 py-2 border-l border-l-4 border-orange-900/40
        flex flex-col gap-2`}>
        <h2 className="text-h2">Buy YFI at a discount</h2>
        <p>Bacon ipsum dolor amet biltong ham hock hamburger short loin. Kielbasa 
buffalo alcatra burgdoggen chuck hamburger. Biltong jerky beef 
andouille prosciutto meatball. Doner beef short ribs buffalo. Ham hock 
landjaeger picanha frankfurter, fatback beef burgdoggen kielbasa bresaola 
meatloaf chicken pig spare ribs sirloin.</p>
      </div>
    </div>

    <div className="sm:w-1/3">
      <div className={`w-fit p-12
        flex flex-col items-center justify-center
        border border-orange-900/40`}>
        <div className="my-6 text-3xl md:text-8xl font-mono font-black">99%</div>
        <p className="text-sm">Most important stat about yDiscount (ie northstar metric)</p>
      </div>
    </div>

  </main>
}
