"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl mx-auto mt-20 rounded-sm shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-dusty-pink-light px-6 py-4">
          <FiSearch className="w-5 h-5 text-gold mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search our store..."
            className="flex-1 text-lg font-light outline-none placeholder:text-dusty-pink-dark/60"
          />
          <button onClick={onClose} className="p-1 hover:text-gold">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        {query && (
          <div className="px-6 py-8 text-center text-charcoal">
            <p className="text-sm">
              Search results for &quot;{query}&quot; will appear here.
            </p>
          </div>
        )}
        {!query && (
          <div className="px-6 py-8">
            <p className="text-xs uppercase tracking-widest text-gold mb-4">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {["Dresses", "Linen", "Summer", "New Arrivals", "Sale"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-dusty-pink-pale text-sm text-charcoal rounded-sm hover:bg-dusty-pink-light transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
