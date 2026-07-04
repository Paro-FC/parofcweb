"use client";

import { urlFor } from "@/sanity/lib/image";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  image: unknown;
  hoverImage?: unknown;
  category?: { _id: string; title: string } | null;
  price: number;
  currency: string;
  salePrice?: number;
  badge?: string;
  inStock: boolean;
}

const badgeStyles: Record<string, string> = {
  new: "bg-emerald-500 text-white",
  exclusive: "bg-dark-charcoal text-white",
  sale: "bg-parofc-red text-white",
  limited: "bg-parofc-gold text-dark-charcoal",
  bestseller: "bg-parofc-gold text-dark-charcoal",
};

const badgeLabels: Record<string, string> = {
  new: "NEW",
  exclusive: "EXCLUSIVE",
  sale: "SALE",
  limited: "LIMITED",
  bestseller: "BEST SELLER",
};

export const ProductCard = React.memo(function ProductCard({
  product,
  index = 0,
  theme = "light",
}: {
  product: ProductCardData;
  index?: number;
  theme?: "light" | "dark";
}) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = useMemo(() => {
    const price = product.salePrice || product.price;
    if (product.currency === "BTN") return `Nu. ${price.toLocaleString()}`;
    return `$${price.toFixed(2)}`;
  }, [product.salePrice, product.price, product.currency]);

  const originalPrice = useMemo(() => {
    if (!product.salePrice) return null;
    if (product.currency === "BTN") return `Nu. ${product.price.toLocaleString()}`;
    return `$${product.price.toFixed(2)}`;
  }, [product.salePrice, product.price, product.currency]);

  const mainImageUrl = useMemo(() => {
    if (!product.image) return "/images/placeholder-product.png";
    if (typeof product.image === "string") return product.image;
    try {
      return urlFor(product.image).width(600).height(750).url();
    } catch {
      return "/images/placeholder-product.png";
    }
  }, [product.image]);

  const hoverImageUrl = useMemo(() => {
    if (!product.hoverImage) return null;
    if (typeof product.hoverImage === "string") return product.hoverImage;
    try {
      return urlFor(product.hoverImage).width(600).height(750).url();
    } catch {
      return null;
    }
  }, [product.hoverImage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/shop/${product.slug}`} className="block cursor-pointer">
        {/* Image */}
        <div className={`relative aspect-[3/4] overflow-hidden ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
          <Image
            src={mainImageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ${
              isHovered && hoverImageUrl
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100"
            }`}
          />

          {hoverImageUrl && (
            <Image
              src={hoverImageUrl}
              alt={`${product.name} - alternate view`}
              fill
              className={`object-cover transition-all duration-700 absolute inset-0 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          )}

          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`${badgeStyles[product.badge]} text-2xs font-bold px-3 py-1 tracking-widest`}>
                {badgeLabels[product.badge]}
              </span>
            </div>
          )}

          {product.salePrice && product.price > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-parofc-red text-white text-2xs font-bold px-2 py-1">
                -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
              </span>
            </div>
          )}

          {/* Hover action pill */}
          {product.inStock && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
              <div className={`py-2.5 text-center text-2xs font-black uppercase tracking-widest ${theme === "dark" ? "bg-parofc-red text-white" : "bg-dark-charcoal text-white"}`}>
                View Product
              </div>
            </div>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-white text-dark-charcoal text-xs font-black px-4 py-2 uppercase tracking-widest">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          {product.category?.title && (
            <p className={`text-2xs font-bold tracking-widest uppercase ${theme === "dark" ? "text-white/40" : "text-gray-400"}`}>
              {product.category.title}
            </p>
          )}
          <h3 className={`text-sm font-bold leading-snug line-clamp-2 group-hover:text-parofc-red transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-dark-charcoal"}`}>
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className={`text-sm font-bold ${product.salePrice ? "text-parofc-red" : theme === "dark" ? "text-white" : "text-dark-charcoal"}`}>
              {formattedPrice}
            </span>
            {originalPrice && (
              <span className={`text-xs line-through ${theme === "dark" ? "text-white/40" : "text-gray-400"}`}>{originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
