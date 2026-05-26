"use client";

import Loader from "@/components/Loader";
import { ProductCard } from "@/components/ProductCard";
import type { ProductCardData } from "@/components/ProductCard";
import { client } from "@/sanity/lib/client";
import { CATEGORIES_QUERY, PRODUCTS_QUERY } from "@/sanity/lib/queries";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  ShoppingBag01Icon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SanityImageSource } from "@sanity/image-url";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Category {
  _id: string;
  title: string;
  slug: string;
  image?: SanityImageSource | string;
}

type Product = ProductCardData & {
  sizes?: string[];
  _createdAt?: string;
};

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          client.fetch(PRODUCTS_QUERY),
          client.fetch(CATEGORIES_QUERY),
        ]);

        if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          setProducts([]);
        }

        if (categoriesData && Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!product) return false;
    if (selectedCategory === "all") return true;
    return product.category?._id === selectedCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        if (a._createdAt && b._createdAt) {
          return (
            new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
          );
        }
        if (a._createdAt && !b._createdAt) return -1;
        if (!a._createdAt && b._createdAt) return 1;
        return 0;
      case "price-low":
        return (a.salePrice ?? a.price ?? 0) - (b.salePrice ?? b.price ?? 0);
      case "price-high":
        return (b.salePrice ?? b.price ?? 0) - (a.salePrice ?? a.price ?? 0);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      default:
        return 0;
    }
  });

  const selectedCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : categories.find((c) => c._id === selectedCategory)?.title ||
        "All Products";

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
              Official Merchandise
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
              Paro FC <span className="text-parofc-gold">Shop</span>
            </h1>
          </motion.div>
        </div>

        <div className="h-1 bg-gradient-to-r from-parofc-red via-parofc-gold to-bronze" />
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12 md:h-14">
            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 text-xs font-bold text-dark-charcoal uppercase tracking-wider hover:text-parofc-red transition-colors duration-200 cursor-pointer"
            >
              <HugeiconsIcon icon={SlidersHorizontalIcon} size={14} />
              <span>Filter & Sort</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={12}
                className={`transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Active filter + count */}
            <div className="flex items-center gap-3">
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-2xs font-bold text-parofc-red uppercase tracking-wider cursor-pointer hover:underline"
                >
                  Clear filter
                </button>
              )}
              <span className="text-xs text-gray-400 tabular-nums">
                {sortedProducts.length}{" "}
                {sortedProducts.length === 1 ? "product" : "products"}
              </span>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-2xs font-bold text-gray-400 mb-3 tracking-widest uppercase">
                      Category
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                          selectedCategory === "all"
                            ? "bg-dark-charcoal text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => setSelectedCategory(category._id)}
                          className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            selectedCategory === category._id
                              ? "bg-dark-charcoal text-white"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {category.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <h3 className="text-2xs font-bold text-gray-400 mb-3 tracking-widest uppercase">
                      Sort by
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "newest", label: "Newest" },
                        { value: "price-low", label: "Price: Low" },
                        { value: "price-high", label: "Price: High" },
                        { value: "name", label: "A - Z" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            sortBy === option.value
                              ? "bg-dark-charcoal text-white"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <Loader />
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
            {sortedProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <HugeiconsIcon
              icon={ShoppingBag01Icon}
              size={40}
              className="mx-auto text-gray-200 mb-4"
            />
            <p className="text-sm font-semibold text-gray-400 mb-1">
              {products.length === 0
                ? "No products available yet"
                : `No products in "${selectedCategoryName}"`}
            </p>
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-xs font-bold text-parofc-red hover:underline cursor-pointer mt-2"
              >
                View all products
              </button>
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
