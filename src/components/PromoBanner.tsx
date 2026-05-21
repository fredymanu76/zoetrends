export default function PromoBanner() {
  return (
    <section className="bg-charcoal py-6 md:py-8 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
          New Around Here?
        </h3>
        <p className="text-sm md:text-base text-gray-200">
          Enter code:{" "}
          <span className="font-bold text-white">New Customer</span> at the
          checkout to recive 10% off your first order!
        </p>
      </div>
    </section>
  );
}
