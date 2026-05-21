"use client";

import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Contact Us
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact form */}
          <div>
            <h2 className="text-xl font-light tracking-wide text-black mb-6">
              Get in Touch
            </h2>
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="px-10 py-4 bg-black text-gold text-sm uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div>
            <h2 className="text-xl font-light tracking-wide text-black mb-6">
              Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <FiMail className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-charcoal mb-1">
                    Email
                  </p>
                  <p className="text-sm text-charcoal/70 font-light">
                    hello@zoetrends.com
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiPhone className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-charcoal mb-1">
                    Phone
                  </p>
                  <p className="text-sm text-charcoal/70 font-light">
                    +44 (0) 123 456 7890
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiMapPin className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-charcoal mb-1">
                    Address
                  </p>
                  <p className="text-sm text-charcoal/70 font-light">
                    123 Fashion Street
                    <br />
                    London, UK
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiClock className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-charcoal mb-1">
                    Opening Hours
                  </p>
                  <p className="text-sm text-charcoal/70 font-light">
                    Mon - Sat: 9am - 6pm
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
