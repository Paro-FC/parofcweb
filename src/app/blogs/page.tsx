"use client";

import Loader from "@/components/Loader";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import { BLOG_QUERY } from "@/sanity/lib/queries";
import { Cancel01Icon, NewsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BlogItem {
  _id: string;
  image: unknown;
  title: string;
  publishedAt: string;
  description?: string;
  slug: string;
}

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

export default function BlogPage() {
  const router = useRouter();
  const [blogItems, setBlogItems] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const result = await sanityFetch({ query: BLOG_QUERY }).catch(() => ({
          data: [],
        }));
        if (
          result.data &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          setBlogItems(result.data as BlogItem[]);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const featured = blogItems[0];
  const rest = blogItems.slice(1);

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
              Thoughts & Stories
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
              Paro FC <span className="text-parofc-gold">Blog</span>
            </h1>
          </motion.div>
        </div>
        <div className="h-1 bg-gradient-to-r from-parofc-red via-parofc-gold to-bronze" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <Loader />
        ) : blogItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <HugeiconsIcon
              icon={NewsIcon}
              size={32}
              className="text-gray-200 mb-3"
            />
            <span className="text-sm text-gray-400 font-medium">
              No blog posts yet
            </span>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Post */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  href={`/blogs/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-5 gap-5 cursor-pointer"
                >
                  <div className="lg:col-span-3 relative aspect-[16/10] overflow-hidden bg-gray-50">
                    {featured.image ? (
                      <Image
                        src={urlFor(featured.image)
                          .width(900)
                          .height(563)
                          .url()}
                        alt={featured.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-charcoal to-parofc-red" />
                    )}
                  </div>

                  <div className="lg:col-span-2 flex flex-col justify-center py-2">
                    <span className="text-2xs text-gray-400 font-medium mb-3">
                      {formatDate(featured.publishedAt)}
                    </span>

                    <h2 className="text-2xl md:text-3xl font-black text-dark-charcoal leading-tight group-hover:text-parofc-red transition-colors duration-200 mb-3">
                      {featured.title}
                    </h2>

                    {featured.description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {featured.description}
                      </p>
                    )}

                    <span className="inline-flex items-center text-xs font-bold text-dark-charcoal group-hover:text-parofc-red transition-colors duration-200 uppercase tracking-wider mt-4">
                      Read Post
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}

            {rest.length > 0 && <div className="h-px bg-gray-100" />}

            {/* Grid */}
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
                      href={`/blogs/${item.slug}`}
                      className="group block cursor-pointer"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 mb-3">
                        {item.image ? (
                          <Image
                            src={urlFor(item.image)
                              .width(500)
                              .height(313)
                              .url()}
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

                      <h3 className="text-base font-bold text-dark-charcoal leading-snug line-clamp-2 group-hover:text-parofc-red transition-colors duration-200">
                        {item.title}
                      </h3>

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
      {/* Floating close button */}
      <button
        onClick={() => router.push("/")}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={24} />
      </button>
    </div>
  );
}
