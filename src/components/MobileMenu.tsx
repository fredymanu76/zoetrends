"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface NavItem {
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function MobileMenu({
  isOpen,
  onClose,
  navItems,
}: MobileMenuProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-dusty-pink-light">
          <div>
            <span className="font-script text-xl text-gold" style={{ fontStyle: 'italic' }}>Zoe</span>
            <span className="text-base font-semibold tracking-[0.15em] text-black uppercase ml-0.5">TRENDS</span>
          </div>
          <button onClick={onClose} className="p-2">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="py-4">
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-dusty-pink-pale">
              <div className="flex items-center justify-between px-6 py-3">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="text-sm uppercase tracking-widest text-black"
                >
                  {item.label}
                </Link>
                {item.submenu && (
                  <button
                    onClick={() =>
                      setExpandedItem(
                        expandedItem === item.label ? null : item.label
                      )
                    }
                    className="p-1 text-gold"
                  >
                    {expandedItem === item.label ? (
                      <FiChevronUp className="w-4 h-4" />
                    ) : (
                      <FiChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {item.submenu && expandedItem === item.label && (
                <div className="bg-dusty-pink-pale py-2">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={onClose}
                      className="block px-10 py-2 text-sm text-charcoal hover:text-gold transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-dusty-pink-light">
          <Link
            href="/account"
            onClick={onClose}
            className="block py-2 text-sm uppercase tracking-widest text-black hover:text-gold"
          >
            My Account
          </Link>
        </div>
      </div>
    </div>
  );
}
