"use client";

import { useState } from "react";
import Link from "next/link";

import { FiSearch, FiHeart, FiShoppingBag, FiMenu } from "react-icons/fi";
import SearchModal from "./SearchModal";
import MobileMenu from "./MobileMenu";
import { useCart } from "@/lib/cart-context";

const navItems = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  {
    label: "Clothing",
    href: "/collections/clothing",
    submenu: [
      { label: "Dresses", href: "/collections/dresses" },
      { label: "Tops", href: "/collections/tops" },
      { label: "Trousers", href: "/collections/trousers" },
      { label: "Jumpsuits", href: "/collections/jumpsuits" },
      { label: "Knitwear", href: "/collections/knitwear" },
      { label: "Jackets & Coats", href: "/collections/jackets-coats" },
    ],
  },
  {
    label: "Accessories",
    href: "/collections/accessories",
    submenu: [
      { label: "Bags", href: "/collections/bags" },
      { label: "Jewellery", href: "/collections/jewellery" },
      { label: "Scarves", href: "/collections/scarves" },
      { label: "Belts", href: "/collections/belts" },
      { label: "Hats", href: "/collections/hats" },
    ],
  },
  {
    label: "Gift Items",
    href: "/collections/gift-items",
    submenu: [
      { label: "Gift For Him", href: "/collections/gift-for-him" },
      { label: "Gift For Her", href: "/collections/gift-for-her" },
      { label: "Baby Shower", href: "/collections/baby-shower" },
      { label: "Weddings", href: "/collections/weddings" },
      { label: "Birthdays", href: "/collections/birthdays" },
      { label: "Mothers Day", href: "/collections/mothers-day" },
      { label: "Fathers Day", href: "/collections/fathers-day" },
    ],
  },
  {
    label: "Footwear",
    href: "/collections/footwear",
    submenu: [
      { label: "Sandals", href: "/collections/sandals" },
      { label: "Heels", href: "/collections/heels" },
      { label: "Flats", href: "/collections/flats" },
      { label: "Boots", href: "/collections/boots" },
    ],
  },
  { label: "Sale", href: "/collections/sale" },
  { label: "Juicy Content", href: "/blog" },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems: cartCount } = useCart();

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gold text-black text-center py-2 text-xs tracking-widest uppercase">
        Next Day Delivery &nbsp;|&nbsp; Pay in 30 Days with Klarna
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-white border-b border-dusty-pink-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-28">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="w-6 h-6 text-black" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="ZoeTrends Boutique"
                className="h-20 md:h-28 w-auto object-cover"
              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.label} className="nav-item relative group">
                  <Link
                    href={item.href}
                    className="text-sm tracking-widest uppercase text-black hover:text-gold transition-colors py-6 inline-block"
                  >
                    {item.label}
                  </Link>
                  {item.submenu && (
                    <div className="mega-menu absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-lg border border-dusty-pink-light rounded-sm py-6 px-8 min-w-[220px] z-50">
                      <ul className="space-y-3">
                        {item.submenu.map((sub) => (
                          <li key={sub.label}>
                            <Link
                              href={sub.href}
                              className="text-sm text-charcoal hover:text-gold tracking-wide transition-colors"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-dusty-pink-light">
                        <Link
                          href={item.href}
                          className="text-xs uppercase tracking-widest text-gold hover:text-gold-dark"
                        >
                          View All →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 hover:text-gold transition-colors relative group"
                title="Search"
              >
                <FiSearch className="w-5 h-5" />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[9px] uppercase tracking-wider bg-gold text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Search</span>
              </button>
              <Link
                href="/wishlist"
                className="p-2 hover:text-gold transition-colors hidden sm:block relative group"
                title="Wishlist"
              >
                <FiHeart className="w-5 h-5" />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[9px] uppercase tracking-wider bg-gold text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Wishlist</span>
              </Link>
              <Link
                href="/cart"
                className="p-2 hover:text-gold transition-colors relative group"
                title="Cart"
              >
                <FiShoppingBag className="w-5 h-5" />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[9px] uppercase tracking-wider bg-gold text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
      />
    </>
  );
}
