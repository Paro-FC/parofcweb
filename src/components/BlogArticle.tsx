"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bookmark01Icon,
  Clock01Icon,
  Calendar03Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { urlFor } from "@/sanity/lib/image";
import { ShareButtons } from "@/components/ShareButtons";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import { useState, useEffect } from "react";

interface BlogArticleProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    image: unknown;
    badge: string;
    publishedAt: string;
    description: string;
    body?: unknown[];
    author?: string;
    readTime?: number;
  };
  relatedPosts: {
    _id: string;
    title: string;
    slug: string;
    image: unknown;
    badge: string;
    publishedAt: string;
    description?: string;
  }[];
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <div className="w-full rounded-lg overflow-hidden">
            <Image
              src={urlFor(value).width(1200).url()}
              alt={value.alt || "Blog image"}
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 800px"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold text-gray-900 mt-8 mb-3">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-lg text-gray-700 leading-relaxed mb-5">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-bronze pl-6 my-10 italic text-xl text-gray-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-2 text-lg text-gray-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-2 text-lg text-gray-700">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-parofc-gold hover:text-bronze underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export function BlogArticle({ article, relatedPosts }: BlogArticleProps) {
  const articleId = article._id;
  const bookmarkedKey = `blog_bookmarked_${articleId}`;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(bookmarkedKey);
        if (stored === "true") setIsBookmarked(true);
      } catch (e) {
        if (e instanceof DOMException) {
          console.warn("localStorage not available:", e.message);
        } else {
          console.error("Error loading bookmark state:", e);
        }
      } finally {
        setIsHydrated(true);
      }
    }
  }, [bookmarkedKey]);

  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      try {
        localStorage.setItem(bookmarkedKey, isBookmarked.toString());
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          console.error("localStorage quota exceeded");
        } else if (e instanceof DOMException) {
          console.warn("localStorage not available:", e.message);
        } else {
          console.error("Error saving bookmark state:", e);
        }
      }
    }
  }, [isBookmarked, bookmarkedKey, isHydrated]);

  const articleUrl = typeof window !== "undefined"
    ? `${window.location.origin}/blogs/${article.slug}`
    : `/blogs/${article.slug}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full">
        {article.image ? (
          <Image
            src={urlFor(article.image).width(1920).url()}
            alt={article.title}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            priority
          />
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-parofc-blue to-parofc-red" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {article.badge && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-parofc-red text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wide">
              {article.badge}
            </span>
          </div>
        )}
      </motion.div>

      {/* Article Content */}
      <motion.article
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mx-auto max-w-4xl px-4 md:px-8 lg:px-12 pt-10 pb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-parofc-red leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-500 text-sm mb-10 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar03Icon} size={16} />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Clock01Icon} size={16} />
              <span>{formatTime(article.publishedAt)}</span>
            </div>
            {article.readTime && (
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{article.readTime} min read</span>
              </div>
            )}
            {article.author && (
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>By {article.author}</span>
              </div>
            )}
          </div>

          {article.body && (
            <div className="prose prose-lg max-w-none mt-8">
              <PortableText value={article.body as any} components={portableTextComponents} />
            </div>
          )}

          {!article.body && article.description && (
            <div className="prose prose-lg max-w-none mt-8">
              <p className="text-lg text-gray-700 leading-relaxed">{article.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full transition-all ${
                isBookmarked
                  ? "bg-parofc-gold text-dark-charcoal"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <HugeiconsIcon
                icon={Bookmark01Icon}
                size={20}
                className={isBookmarked ? "text-parofc-gold" : "text-gray-400"}
              />
            </button>
            <ShareButtons
              url={articleUrl}
              title={article.title}
              description={article.description}
            />
          </div>
        </div>
      </motion.article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Posts</h2>
              <Link
                href="/blogs"
                className="flex items-center gap-1 text-parofc-gold hover:text-bronze transition-colors font-medium"
              >
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
              {relatedPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <Link href={`/blogs/${post.slug}`} className="group block cursor-pointer">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 mb-3">
                      {post.image ? (
                        <Image
                          src={urlFor(post.image).width(500).height(313).url()}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {post.badge && (
                        <span className="text-2xs font-bold text-parofc-red uppercase tracking-widest">
                          {post.badge}
                        </span>
                      )}
                      {post.badge && <span className="text-gray-300">·</span>}
                      <span className="text-2xs text-gray-400 font-medium">
                        {formatRelativeDate(post.publishedAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-dark-charcoal leading-snug line-clamp-2 group-hover:text-parofc-red transition-colors duration-200">
                      {post.title}
                    </h3>

                    {post.description && (
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-1.5">
                        {post.description}
                      </p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Close Button */}
      <Link
        href="/blogs"
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={24} />
      </Link>
    </div>
  );
}
