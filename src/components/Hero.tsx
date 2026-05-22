"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { useMemo } from "react";

interface NewsItem {
  _id: string;
  image: unknown;
  title: string;
  badge?: string;
  publishedAt: string;
  slug: string;
}

interface HeroProps {
  blogs?: NewsItem[];
}

const fallbackNews: NewsItem = {
  _id: "1",
  image: null,
  title: "WHEN AND WHERE TO WATCH PARO FC V THIMPHU CITY",
  badge: "PARO FC",
  publishedAt: new Date().toISOString(),
  slug: "",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export function Hero({ blogs }: HeroProps) {
  const newsItem = blogs && blogs.length > 0 ? blogs[0] : fallbackNews;

  const formattedDate = useMemo(() => {
    return formatDate(newsItem.publishedAt);
  }, [newsItem.publishedAt]);

  const content = (
    <div className="mx-auto max-w-[1400px] relative z-10 flex flex-col items-center justify-end h-full pb-16 md:pb-24 px-5">
      {/* Badge */}
      {newsItem.badge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-4"
        >
          <span className="inline-block bg-parofc-gold text-dark-charcoal text-xs font-bold px-4 py-1.5 uppercase tracking-widest">
            {newsItem.badge}
          </span>
        </motion.div>
      )}

      {/* Main Headline */}
      <motion.h1
        className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-4 text-center text-white max-w-5xl leading-[0.95]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
      >
        {newsItem.title}
      </motion.h1>

      {/* Date line */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="w-8 h-[2px] bg-parofc-gold" />
        <span className="text-white/70 text-sm font-medium tracking-wider uppercase">
          {formattedDate}
        </span>
        <div className="w-8 h-[2px] bg-parofc-gold" />
      </motion.div>
    </div>
  );

  /* Fill viewport below MainNav: mobile h-16 + divider, desktop h-20 + divider */
  return (
    <section className="relative w-full overflow-hidden min-h-[calc(100dvh-4rem-1px)] md:min-h-[calc(100dvh-5rem-1px)] h-[calc(100dvh-4rem-1px)] md:h-[calc(100dvh-5rem-1px)]">
      {newsItem.image ? (
        <Image
          src={urlFor(newsItem.image).width(2560).quality(90).auto("format").url()}
          alt={newsItem.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      ) : (
        <Image
          src="/assets/Timezones K Benhavn.webp"
          alt="Hero Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      )}

      {/* Gradient overlay — dark at bottom for text, lighter at top to show image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {newsItem.slug ? (
        <Link
          href={`/blogs/${newsItem.slug}`}
          className="absolute inset-0 flex cursor-pointer"
        >
          {content}
        </Link>
      ) : (
        <div className="absolute inset-0 flex">{content}</div>
      )}
    </section>
  );
}
