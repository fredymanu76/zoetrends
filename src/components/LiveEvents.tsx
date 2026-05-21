import Link from "next/link";
import { FiFacebook, FiInstagram } from "react-icons/fi";

export default function LiveEvents() {
  return (
    <section className="py-16 md:py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
          Don&apos;t Miss Out
        </p>
        <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-6">
          We&apos;re Live in 3, 2, 1...
        </h2>
        <div className="w-16 h-0.5 bg-gold mx-auto mb-8" />

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          {/* Manic Monday */}
          <div className="bg-white/5 border border-gold/20 rounded-sm p-8 hover:border-gold/40 transition-colors">
            <h3 className="text-xl font-semibold text-gold tracking-wide mb-3">
              Manic Monday
            </h3>
            <p className="text-sm text-white/80 font-light leading-relaxed mb-4">
              Join us every Monday for exclusive flash sales and new arrivals
              revealed live. Grab the best deals before they&apos;re gone!
            </p>
            <p className="text-xs text-gold/80 uppercase tracking-widest">
              Every Monday &bull; Live on Facebook
            </p>
          </div>

          {/* Curvy Club Saturday */}
          <div className="bg-white/5 border border-dusty-pink/30 rounded-sm p-8 hover:border-dusty-pink/50 transition-colors">
            <h3 className="text-xl font-semibold text-dusty-pink tracking-wide mb-3">
              Curvy Club Saturday
            </h3>
            <p className="text-sm text-white/80 font-light leading-relaxed mb-4">
              Celebrating all body types with our plus-size collection.
              Live styling sessions and exclusive discounts every Saturday.
            </p>
            <p className="text-xs text-dusty-pink/80 uppercase tracking-widest">
              Saturdays at 11am &bull; Live on Facebook
            </p>
          </div>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <Link
            href="#"
            className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
          >
            <FiFacebook className="w-5 h-5" />
            <span className="text-sm tracking-wide">Follow on Facebook</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-dusty-pink hover:text-dusty-pink-light transition-colors"
          >
            <FiInstagram className="w-5 h-5" />
            <span className="text-sm tracking-wide">Follow on Instagram</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
