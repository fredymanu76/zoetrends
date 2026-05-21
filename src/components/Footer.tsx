import Link from "next/link";

import { FiInstagram, FiFacebook } from "react-icons/fi";
import { FaPinterestP } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <div className="mb-4">
              <img
                src="/logo.jpeg"
                alt="ZoeTrends Boutique"
                className="w-28 h-28 object-contain"
              />
            </div>
            <p className="text-sm text-white/60 font-light leading-relaxed">
              Curated Italian fashion for the modern woman. Confidence, style,
              and beauty — delivered to your door.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-6">
              <Link
                href="#"
                className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
              >
                <FiInstagram className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
              >
                <FiFacebook className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
              >
                <FaPinterestP className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-semibold">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Gift Vouchers", href: "/gift-vouchers" },
                { label: "Our Story", href: "/our-story" },
                { label: "Juicy Content", href: "/blog" },
                { label: "Our Stores", href: "/stores" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-semibold">
              Customer Service
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Delivery & Collection", href: "/delivery" },
                { label: "Returns & Refunds", href: "/returns" },
                { label: "Ways to Pay", href: "/payment" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-semibold">
              Know the Secret...
            </h3>
            <p className="text-sm text-white/60 font-light mb-4">
              Subscribe for exclusive offers, new arrivals, and style
              inspiration.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2.5 bg-white/10 border border-gold/20 text-sm font-light text-white outline-none focus:border-gold transition-colors placeholder:text-white/40 rounded-sm"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold text-black text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors rounded-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Payment methods */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                "Visa",
                "Mastercard",
                "Amex",
                "Apple Pay",
                "PayPal",
                "Klarna",
                "Google Pay",
              ].map((method) => (
                <span
                  key={method}
                  className="text-[10px] text-white/40 border border-white/10 px-2 py-1 rounded-sm"
                >
                  {method}
                </span>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} ZoeTrends. All rights reserved.
            </p>

            {/* Currency */}
            <div className="text-xs text-white/40">
              <span className="mr-1">Currency:</span>
              <select className="bg-transparent border border-white/10 text-white/60 text-xs px-2 py-1 rounded-sm outline-none">
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
