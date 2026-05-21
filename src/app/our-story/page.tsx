export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Our Story
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero image placeholder */}
        <div className="aspect-[16/9] bg-dusty-pink-pale rounded-sm mb-12" />

        <div className="text-center mb-12">
          <p
            className="font-script text-2xl text-gold mb-4"
            style={{ fontStyle: "italic" }}
          >
            Our Journey
          </p>
          <h2 className="text-2xl md:text-3xl font-light text-black tracking-wide">
            Fashion with Heart
          </h2>
        </div>

        <div className="space-y-6 text-charcoal/80 font-light leading-relaxed">
          <p>
            ZoeTrends was born from a simple belief: every woman deserves to
            feel confident, beautiful, and empowered through what she wears.
            What started as a passion for Italian craftsmanship has grown into a
            boutique that celebrates style, quality, and self-expression.
          </p>
          <p>
            We travel to Italy to handpick each piece in our collection,
            working directly with artisans who share our commitment to quality
            and timeless design. Every garment tells a story of tradition,
            skill, and modern elegance.
          </p>
          <p>
            Our curated collections are designed to help you build a wardrobe
            that reflects who you are — confident, stylish, and unapologetically
            you.
          </p>
        </div>

        <div className="text-center mt-12">
          <p
            className="font-script text-xl text-gold"
            style={{ fontStyle: "italic" }}
          >
            ...love yourself
          </p>
        </div>
      </div>
    </div>
  );
}
