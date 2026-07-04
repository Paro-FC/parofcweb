"use client";

import Loader from "@/components/Loader";
import { urlFor } from "@/sanity/lib/image";
import { useSanityLiveQuery } from "@/sanity/lib/live-client";
import { NEWS_QUERY } from "@/sanity/lib/queries";
import { NewsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface NewsItem {
  _id: string;
  image: unknown;
  title: string;
  badge?: string;
  publishedAt: string;
  description?: string;
  slug: string;
}

const fallbackNews: NewsItem[] = [
  {
    _id: "1",
    image: null,
    title: "Mobility requirements and plan for Paro FC v Thimphu City",
    badge: "",
    publishedAt: new Date().toISOString(),
    slug: "mobility-requirements",
  },
  {
    _id: "2",
    image: null,
    title: "Agreement for the transfer of a Paro FC player to a partner club",
    badge: "TRANSFERS",
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
  const newsData = useSanityLiveQuery<NewsItem[] | null>(NEWS_QUERY, {}, null);
  const loading = newsData === null;
  const newsItems = newsData ?? fallbackNews;
  const featured = newsItems[0];
  const rest = newsItems.slice(1);

  return (
    <div className="min-h-screen bg-white">
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
              Paro FC
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
              In the <span className="text-parofc-gold">News</span>
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
          <div className="space-y-10">
            {/* Featured Article */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  href={`/news/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-5 gap-5 cursor-pointer"
                >
                  {/* Image — 3 cols */}
                  <div className="lg:col-span-3 relative aspect-[16/10] overflow-hidden bg-gray-50">
                    {featured.image ? (
                      <Image
                        src={urlFor(featured.image)
                          .width(900)
                          .height(563)
                          .url()}
                        alt={featured.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-charcoal to-parofc-red" />
                    )}
                  </div>

                  {/* Info — 2 cols */}
                  <div className="lg:col-span-2 flex flex-col justify-center py-2">
                    <div className="flex items-center gap-2 mb-3">
                      {featured.badge && (
                        <span className="text-2xs font-bold text-parofc-red uppercase tracking-widest">
                          {featured.badge}
                        </span>
                      )}
                      {featured.badge && (
                        <span className="text-gray-300">·</span>
                      )}
                      <span className="text-2xs text-gray-400 font-medium">
                        {formatDate(featured.publishedAt)}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-dark-charcoal leading-tight group-hover:text-parofc-red transition-colors duration-200 mb-3">
                      {featured.title}
                    </h2>

                    {featured.description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {featured.description}
                      </p>
                    )}

                    <span className="inline-flex items-center text-xs font-bold text-dark-charcoal group-hover:text-parofc-red transition-colors duration-200 uppercase tracking-wider mt-4">
                      Read Article
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Divider */}
            {rest.length > 0 && <div className="h-px bg-gray-100" />}

            {/* Rest of articles — 3-column grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
                {rest.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={`/news/${item.slug}`}
                      className="group block cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 mb-3">
                        {item.image ? (
                          <Image
                            src={urlFor(item.image)
                              .width(500)
                              .height(313)
                              .url()}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-2">
                        {item.badge && (
                          <span className="text-2xs font-bold text-parofc-red uppercase tracking-widest">
                            {item.badge}
                          </span>
                        )}
                        {item.badge && <span className="text-gray-300">·</span>}
                        <span className="text-2xs text-gray-400 font-medium">
                          {formatDate(item.publishedAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-dark-charcoal leading-snug line-clamp-2 group-hover:text-parofc-red transition-colors duration-200">
                        {item.title}
                      </h3>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-1.5">
                          {item.description}
                        </p>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
