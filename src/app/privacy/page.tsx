export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Privacy Policy
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <p className="text-sm text-charcoal/80 font-light leading-relaxed">
          ZoeTrends respects your privacy and is committed to protecting your personal information.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Information We Collect</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-3">
            We may collect:
          </p>
          <ul className="list-disc list-inside text-sm text-charcoal/80 font-light leading-relaxed space-y-1 ml-2">
            <li>Name and contact details</li>
            <li>Billing and delivery information</li>
            <li>Order history</li>
            <li>Device and browsing information</li>
            <li>Marketing preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">How We Use Your Information</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-3">
            Your data may be used to:
          </p>
          <ul className="list-disc list-inside text-sm text-charcoal/80 font-light leading-relaxed space-y-1 ml-2">
            <li>Process orders and payments</li>
            <li>Deliver products and customer support</li>
            <li>Improve website performance</li>
            <li>Personalise your shopping experience</li>
            <li>Send promotional communications (where consent is provided)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Marketing Communications</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Customers can unsubscribe from marketing emails at any time using the unsubscribe link included in our communications.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Data Security</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            We use secure technologies and industry-standard safeguards to protect customer information against unauthorised access or misuse.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Third-Party Services</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Certain trusted third-party providers may process data on our behalf, including payment processors, delivery companies, and analytics providers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Cookies</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Our website uses cookies to improve site functionality, analyse traffic, and personalise content. Customers can manage cookie settings through their browser preferences.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Your Rights</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-3">
            Depending on your jurisdiction, you may have rights to:
          </p>
          <ul className="list-disc list-inside text-sm text-charcoal/80 font-light leading-relaxed space-y-1 ml-2">
            <li>Access your data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion</li>
            <li>Restrict processing</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Contact</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            For privacy-related enquiries, contact:{" "}
            <a href="mailto:info@zoetrends.co.uk" className="text-gold hover:text-gold-dark transition-colors">
              info@zoetrends.co.uk
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
