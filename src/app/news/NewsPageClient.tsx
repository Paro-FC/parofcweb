"use client";

import Loader from "@/components/Loader";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import { NEWS_QUERY } from "@/sanity/lib/queries";
import { NewsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NewsItem {
  _id: string;
  image: unknown;
  title: string;
  publishedAt: string;
  description?: string;
  slug: string;
  externalUrl?: string;
}

const fallbackNews: NewsItem[] = [
  {
    _id: "1",
    image: null,
    title: "Mobility requirements and plan for Paro FC v Thimphu City",
    publishedAt: new Date().toISOString(),
    slug: "mobility-requirements",
  },
  {
    _id: "2",
    image: null,
    title: "Agreement for the transfer of a Paro FC player to a partner club",
    publishedAt: new Date().toISOString(),
    description: "Paro FC retains a percentage of any future sale...",
    slug: "transfer-agreement",
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(fallbackNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const newsResult = await sanityFetch({ query: NEWS_QUERY }).catch(
          () => ({ data: [] }),
        );
        if (
          newsResult.data &&
          Array.isArray(newsResult.data) &&
          newsResult.data.length > 0
        ) {
          setNewsItems(newsResult.data as NewsItem[]);
        } else {
          setNewsItems(fallbackNews);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsItems(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-near-black">
      {/* Hero Header */}
      <div className="relative bg-dark-charcoal overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 21px)",
          }}
        />

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold text-parofc-gold uppercase tracking-[0.2em] mb-3">
              Latest Updates
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
              Paro FC
              <br />
              <span className="text-parofc-gold">News</span>
            </h1>
          </motion.div>
        </div>

        <div className="h-1 bg-gradient-to-r from-parofc-red via-parofc-gold to-bronze" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <Loader />
        ) : newsItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <HugeiconsIcon
              icon={NewsIcon}
              size={32}
              className="text-gray-200 mb-3"
            />
            <span className="text-sm text-gray-400 font-medium">
              No news available yet
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
            {newsItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <Link
                  href={item.externalUrl ?? `/news/${item.slug}`}
                  {...(item.externalUrl
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group block cursor-pointer"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/5 mb-3">
                    {item.image ? (
                      <Image
                        src={urlFor(item.image).width(500).height(313).url()}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                  </div>

                  <span className="text-2xs text-gray-400 font-medium mb-2 block">
                    {formatDate(item.publishedAt)}
                  </span>

                  <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-parofc-red transition-colors duration-200">
                    {item.title}
                    {item.externalUrl && " ↗"}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mt-1.5">
                      {item.description}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
