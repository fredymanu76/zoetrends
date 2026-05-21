export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Ways to Pay
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <p className="text-sm text-charcoal/80 font-light leading-relaxed">
          ZoeTrends offers secure and flexible payment options to provide a seamless shopping experience.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Accepted Payment Methods</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-3">
            We currently accept:
          </p>
          <ul className="list-disc list-inside text-sm text-charcoal/80 font-light leading-relaxed space-y-1 ml-2">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>American Express</li>
            <li>Apple Pay</li>
            <li>PayPal</li>
            <li>Klarna</li>
            <li>Google Pay (where available)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Buy Now, Pay Later</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Eligible customers may choose Klarna instalment options at checkout, allowing purchases to be split into manageable payments.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Currency Support</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Prices may be displayed in multiple currencies depending on your location. Final billing currency is confirmed during checkout.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Payment Security</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            All payments are processed using encrypted secure payment gateways. ZoeTrends does not store full card payment details on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Failed Transactions</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-3">
            If your payment is declined:
          </p>
          <ul className="list-disc list-inside text-sm text-charcoal/80 font-light leading-relaxed space-y-1 ml-2">
            <li>Verify your card details</li>
            <li>Ensure sufficient funds are available</li>
            <li>Contact your payment provider</li>
            <li>Try an alternative payment method</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Fraud Prevention</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            For security purposes, some transactions may undergo additional verification checks before dispatch.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Promotional Codes</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Discount codes must be applied during checkout and cannot usually be added retrospectively after payment.
          </p>
        </section>

        <section>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            For payment enquiries, contact us at{" "}
            <a href="mailto:info@zoetrends.co.uk" className="text-gold hover:text-gold-dark transition-colors">
              info@zoetrends.co.uk
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
