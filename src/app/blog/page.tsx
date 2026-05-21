"use client";

import { useState } from "react";
import { FiPlay, FiClock, FiEye } from "react-icons/fi";

const videos = [
  {
    id: "1",
    title: "Spring Styling Tips: From Day to Night",
    description:
      "Discover how to transition your favourite spring pieces from a daytime look to an elegant evening outfit.",
    date: "May 15, 2026",
    category: "Style Guide",
    duration: "3:45",
    views: "1.2K",
    thumbnail: null,
  },
  {
    id: "2",
    title: "The Art of Italian Craftsmanship",
    description:
      "A closer look at the artisans behind our made-in-Italy collections and the traditions that inspire every piece.",
    date: "May 10, 2026",
    category: "Behind the Scenes",
    duration: "5:20",
    views: "890",
    thumbnail: null,
  },
  {
    id: "3",
    title: "Colours of the Season: Gold, Pink & Black",
    description:
      "Why these three timeless hues are dominating the fashion scene this season and how to wear them.",
    date: "May 5, 2026",
    category: "Trends",
    duration: "4:10",
    views: "2.1K",
    thumbnail: null,
  },
  {
    id: "4",
    title: "Building a Capsule Wardrobe",
    description:
      "Our guide to creating a versatile wardrobe with just 15 essential pieces that mix and match effortlessly.",
    date: "April 28, 2026",
    category: "Style Guide",
    duration: "6:30",
    views: "3.4K",
    thumbnail: null,
  },
  {
    id: "5",
    title: "How to Accessorise Any Outfit",
    description:
      "From statement jewellery to the perfect bag — learn how accessories can transform a simple look.",
    date: "April 20, 2026",
    category: "Tips & Tricks",
    duration: "2:55",
    views: "1.8K",
    thumbnail: null,
  },
  {
    id: "6",
    title: "ZoeTrends Summer Lookbook 2026",
    description:
      "A visual journey through our latest summer collection featuring the hottest trends of the season.",
    date: "April 15, 2026",
    category: "Lookbook",
    duration: "7:15",
    views: "5.6K",
    thumbnail: null,
  },
];

const categories = ["All", ...Array.from(new Set(videos.map((v) => v.category)))];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredVideos =
    activeCategory === "All"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-dusty-pink-pale py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-black">
          Juicy Content
        </h1>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        <p className="text-sm text-charcoal/70 mt-4 font-light">
          Style videos, tips, and behind the scenes
        </p>
      </div>

      {/* Category filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs uppercase tracking-widest px-4 py-2 rounded-sm transition-colors ${
                activeCategory === cat
                  ? "bg-gold text-white"
                  : "bg-dusty-pink-pale text-charcoal hover:bg-gold hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <article
              key={video.id}
              className="group cursor-pointer"
            >
              {/* Video thumbnail */}
              <div className="relative aspect-video bg-charcoal rounded-sm overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gold/80 group-hover:bg-gold flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <FiPlay className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {video.duration}
                </div>
                {/* Category badge */}
                <div className="absolute top-3 left-3 bg-gold text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm">
                  {video.category}
                </div>
              </div>

              {/* Video info */}
              <h2 className="text-base font-semibold text-black group-hover:text-gold transition-colors mb-2 leading-snug">
                {video.title}
              </h2>
              <p className="text-sm text-charcoal/70 font-light leading-relaxed mb-3 line-clamp-2">
                {video.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-charcoal/50">
                <span>{video.date}</span>
                <span className="flex items-center gap-1">
                  <FiEye className="w-3 h-3" />
                  {video.views} views
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
