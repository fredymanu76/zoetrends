"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-light tracking-wide text-black text-center mb-2">
          My Account
        </h1>
        <div className="w-12 h-0.5 bg-gold mx-auto mb-10" />

        {/* Tabs */}
        <div className="flex border-b border-dusty-pink-light mb-8">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 text-sm uppercase tracking-widest transition-colors ${
              activeTab === "login"
                ? "text-gold border-b-2 border-gold"
                : "text-charcoal/60"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 text-sm uppercase tracking-widest transition-colors ${
              activeTab === "register"
                ? "text-gold border-b-2 border-gold"
                : "text-charcoal/60"
            }`}
          >
            Register
          </button>
        </div>

        {activeTab === "login" ? (
          <form className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gold text-black text-sm uppercase tracking-widest hover:bg-gold-dark transition-all duration-300"
            >
              Sign In
            </button>
            <p className="text-center">
              <Link
                href="#"
                className="text-xs text-charcoal/60 hover:text-gold transition-colors"
              >
                Forgot your password?
              </Link>
            </p>
          </form>
        ) : (
          <form className="space-y-5">
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
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-dusty-pink-light text-sm font-light outline-none focus:border-gold transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gold text-black text-sm uppercase tracking-widest hover:bg-gold-dark transition-all duration-300"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
