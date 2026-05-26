"use client";

import { urlFor } from "@/sanity/lib/image";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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

  const imageSrc = newsItem.image
    ? urlFor(newsItem.image).width(2560).quality(90).auto("format").url()
    : "/assets/Timezones K Benhavn.webp";

  const imageAlt = newsItem.title;

  const textBlock = (
    <>
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

      <motion.h1
        className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-4 text-center text-white max-w-5xl leading-[0.95]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
      >
        {newsItem.title}
      </motion.h1>

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
    </>
  );

  /* ── Mobile: stacked image + text, no black gap ── */
  const mobileLayout = (
    <div className="md:hidden w-full bg-black">
      <div className="relative w-full aspect-video">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="flex flex-col items-center px-5 py-8">{textBlock}</div>
    </div>
  );

  /* ── Desktop: full viewport overlay ── */
  const desktopContent = (
    <div className="mx-auto max-w-[1400px] relative z-10 flex flex-col items-center justify-end h-full pb-24 px-5">
      {textBlock}
    </div>
  );

  const desktopLayout = (
    <div className="hidden md:block relative w-full min-h-[calc(100dvh-5rem-1px)] h-[calc(100dvh-5rem-1px)]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      {newsItem.slug ? (
        <Link href={`/blogs/${newsItem.slug}`} className="absolute inset-0 flex cursor-pointer">
          {desktopContent}
        </Link>
      ) : (
        <div className="absolute inset-0 flex">{desktopContent}</div>
      )}
    </div>
  );

  if (newsItem.slug) {
    return (
      <section className="w-full">
        <Link href={`/blogs/${newsItem.slug}`} className="block md:hidden cursor-pointer">
          {mobileLayout}
        </Link>
        {desktopLayout}
      </section>
    );
  }

  return (
    <section className="w-full">
      {mobileLayout}
      {desktopLayout}
    </section>
  );
}
