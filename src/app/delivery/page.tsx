export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Delivery & Collection
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <p className="text-sm text-charcoal/80 font-light leading-relaxed">
          At ZoeTrends, we are committed to delivering your order quickly, securely, and with the premium service expected from a modern luxury fashion brand.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">UK Delivery</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            We offer reliable delivery across the United Kingdom through trusted courier partners. Standard UK delivery typically arrives within 2–4 working days, while selected items may qualify for next-day delivery when ordered before the daily cut-off time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">International Shipping</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            ZoeTrends ships internationally to selected destinations across Europe, North America, and other regions. Shipping times and costs vary depending on the destination country and customs requirements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Order Processing</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Orders are processed Monday to Friday, excluding public holidays. Once your order has been dispatched, you will receive a confirmation email containing your tracking information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Click & Collect</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Selected collections may be available for local collection. Customers choosing this option will receive an email notification once their order is ready for pickup.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Delivery Charges</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Shipping costs are calculated at checkout based on your location and selected delivery method. Promotional free delivery offers may apply periodically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Customs & Duties</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            International customers are responsible for any applicable customs duties, import taxes, or local handling charges imposed by their country.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Delivery Delays</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            While we aim to meet all estimated delivery times, occasional delays may occur during peak periods, promotional campaigns, or due to courier disruptions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Need Assistance?</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            For delivery queries, tracking support, or collection arrangements, please contact our customer care team at{" "}
            <a href="mailto:info@zoetrends.co.uk" className="text-gold hover:text-gold-dark transition-colors">
              info@zoetrends.co.uk
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
