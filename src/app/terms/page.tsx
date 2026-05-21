export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Terms of Service
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <p className="text-sm text-charcoal/80 font-light leading-relaxed">
          By using the ZoeTrends website and purchasing from us, you agree to the following terms and conditions.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">General</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            ZoeTrends reserves the right to update, modify, or discontinue any part of the website, services, or product offerings without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Product Information</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            We aim to ensure all product descriptions, pricing, and images are accurate. However, slight variations in colour, texture, or appearance may occur due to screen settings and manufacturing differences.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Pricing & Availability</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            All prices are subject to change without notice. Products remain subject to availability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Orders</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Once an order is placed, you will receive an order confirmation email. ZoeTrends reserves the right to refuse or cancel orders where fraud, pricing errors, or stock issues arise.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Intellectual Property</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            All website content including logos, images, graphics, text, and branding remains the property of ZoeTrends and may not be copied or reproduced without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">User Conduct</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            Customers agree not to misuse the website, attempt unauthorised access, distribute malicious software, or engage in fraudulent activity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Limitation of Liability</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            ZoeTrends shall not be liable for indirect, incidental, or consequential damages arising from use of the website or purchased products, except where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Governing Law</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            These terms are governed by the laws of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gold mb-3">Contact Information</h2>
          <p className="text-sm text-charcoal/80 font-light leading-relaxed">
            For legal or customer service enquiries:{" "}
            <a href="mailto:info@zoetrends.co.uk" className="text-gold hover:text-gold-dark transition-colors">
              info@zoetrends.co.uk
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
