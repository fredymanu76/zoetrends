export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Returns & Refunds
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <p className="text-sm text-charcoal/80 font-light leading-relaxed">
          We want you to shop with confidence. If you are not completely satisfied with your purchase, ZoeTrends offers a straightforward returns process.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Returns Window</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Customers may return eligible items within 14 days of receiving their order.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Eligibility for Returns</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-3">
            Returned items must:
          </p>
          <ul className="list-disc list-inside text-sm text-charcoal/80 font-light leading-relaxed space-y-1 ml-2">
            <li>Be unused and unworn</li>
            <li>Include original tags and packaging</li>
            <li>Be in resalable condition</li>
            <li>Not show signs of damage, perfume, makeup, or washing</li>
          </ul>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mt-3">
            For hygiene reasons, earrings, underwear, swimwear, and certain beauty products may not be eligible for return unless faulty.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">How to Request a Return</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-3">
            To initiate a return:
          </p>
          <ol className="list-decimal list-inside text-sm text-charcoal/80 font-light leading-relaxed space-y-1 ml-2">
            <li>Contact our customer service team with your order number</li>
            <li>Wait for return instructions and approval</li>
            <li>Send the item back using the recommended shipping method</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Refund Processing</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Once your return has been inspected and approved, refunds will be processed to the original payment method within 5–10 working days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Exchanges</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Exchanges are subject to stock availability. If your requested item is unavailable, a refund or store credit may be offered.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Faulty or Incorrect Items</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with supporting photographs.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Return Shipping Costs</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Customers are responsible for return shipping costs unless the item is faulty or sent in error.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Non-Refundable Charges</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Original shipping fees and customs charges are generally non-refundable unless legally required.
          </p>
        </section>

        <section>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            For returns enquiries, contact us at{" "}
            <a href="mailto:info@zoetrends.co.uk" className="text-gold hover:text-gold-dark transition-colors">
              info@zoetrends.co.uk
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
