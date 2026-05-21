"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-16 md:py-20 bg-dusty-pink-pale">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <p className="font-script text-xl text-gold mb-2" style={{ fontStyle: 'italic' }}>
          Stay in the know
        </p>
        <h2 className="text-2xl md:text-3xl font-light text-black tracking-wide mb-4">
          Know the Secret...
        </h2>
        <p className="text-sm text-charcoal font-light mb-8">
          Subscribe to get special offers, free giveaways, and
          once-in-a-lifetime deals.
        </p>

        {submitted ? (
          <div className="bg-white border border-gold/30 rounded-sm p-6">
            <p className="text-gold font-semibold">Thank you for subscribing!</p>
            <p className="text-sm text-charcoal mt-1">
              We&apos;ll keep you updated with the latest trends.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3 border border-dusty-pink text-sm font-light outline-none focus:border-gold transition-colors placeholder:text-dusty-pink-dark/50 rounded-sm"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-gold text-black text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 rounded-sm"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
