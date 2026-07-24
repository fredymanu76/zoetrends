const points = [
  {
    title: "Made in Italy",
    body: "Every piece in our collection is crafted in Italy by skilled artisans, using time-honoured techniques passed down through generations of Italian tailoring.",
  },
  {
    title: "Premium Fabrics",
    body: "We source natural linens, soft cottons and fine knits chosen for their quality, comfort and the way they drape — clothing designed to be lived in and loved.",
  },
  {
    title: "Effortless Style",
    body: "Relaxed, flattering silhouettes that move with you. Timeless pieces you can dress up or down, season after season, with confidence and ease.",
  },
];

export default function MadeInItaly() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-gold mb-3">
            Our Promise
          </p>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-black mb-6">
            Italian Fashion for the Modern Woman
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-8" />
          <p className="text-base md:text-lg text-charcoal leading-relaxed font-light">
            At ZoeTrends we bring you beautifully made, Italian-crafted clothing
            for every occasion. From relaxed everyday staples to statement pieces
            for special moments, our curated edit is designed to help you feel
            elegant, comfortable and effortlessly yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {points.map((point) => (
            <div key={point.title} className="text-center px-4">
              <div className="w-12 h-12 mx-auto mb-5 rounded-full border border-gold/40 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-gold" />
              </div>
              <h3 className="text-lg font-medium text-black mb-3 tracking-wide">
                {point.title}
              </h3>
              <p className="text-sm text-charcoal/80 leading-relaxed font-light">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
