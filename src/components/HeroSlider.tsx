"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "SPRING SUMMER",
    subtitle: "The New Collection",
    cta: "SHOP NOW",
    href: "/collections/new-arrivals",
    bgColor: "bg-gradient-to-br from-dusty-pink-pale to-dusty-pink-light",
    textColor: "text-black",
    accentColor: "border-black",
  },
  {
    id: 2,
    title: "MADE IN ITALY",
    subtitle: "Italian Craftsmanship",
    cta: "DISCOVER",
    href: "/collections/made-in-italy",
    bgColor: "bg-gradient-to-br from-black to-charcoal",
    textColor: "text-white",
    accentColor: "border-gold",
  },
  {
    id: 3,
    title: "JUST ARRIVED",
    subtitle: "Fresh Styles Weekly",
    cta: "VIEW COLLECTION",
    href: "/collections/new-arrivals",
    bgColor: "bg-gradient-to-br from-[#f5e6d3] to-dusty-pink-light",
    textColor: "text-black",
    accentColor: "border-black",
  },
  {
    id: 4,
    title: "THE NEW SEASON",
    subtitle: "Curated for You",
    cta: "SHOP NOW",
    href: "/collections/new-arrivals",
    bgColor: "bg-gradient-to-br from-dusty-pink to-dusty-pink-dark",
    textColor: "text-white",
    accentColor: "border-gold",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          } ${slide.bgColor}`}
        >
          {/* Decorative gold accents */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-64 h-64 border border-gold/20 rounded-full" />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full overflow-hidden border border-gold/20">
              <img src="/logo.png" alt="ZoeTrends Boutique" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/10 rounded-full" />
          </div>

          <div className="text-center z-20 px-4">
            <p
              className={`text-sm md:text-base tracking-[0.3em] uppercase mb-4 ${slide.textColor} opacity-70 animate-slide-up`}
            >
              {slide.subtitle}
            </p>
            <h2
              className={`text-4xl md:text-7xl lg:text-8xl font-light tracking-[0.15em] ${slide.textColor} mb-8 animate-fade-in`}
            >
              {slide.title}
            </h2>
            <Link
              href={slide.href}
              className={`inline-block px-10 py-3 border-2 ${slide.accentColor} text-sm tracking-[0.2em] uppercase ${slide.textColor} hover:bg-gold hover:text-white hover:border-gold transition-all duration-300`}
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-gold scale-110"
                : "bg-white/50 hover:bg-gold/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Nav arrows */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 text-gold/70 hover:text-gold transition-colors"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 text-gold/70 hover:text-gold transition-colors"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
