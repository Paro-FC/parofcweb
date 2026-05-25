"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ShoppingBag01Icon,
  Share01Icon,
  Tick02Icon,
  TruckIcon,
  RotateLeft01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PRODUCT_QUERY, PRODUCTS_QUERY } from "@/sanity/lib/queries";
import { useParams } from "next/navigation";
import type { SanityImageSource } from "@sanity/image-url";
import { useCart } from "@/contexts/CartContext";
import Loader from "@/components/Loader";
import { isShareUserCanceled } from "@/lib/share";

interface Category {
  _id: string;
  title: string;
  slug: string;
  image?: SanityImageSource | string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  image: SanityImageSource | string;
  hoverImage?: SanityImageSource | string;
  category: Category | null;
  price: number;
  currency: string;
  salePrice?: number;
  badge?: string;
  sizes?: string[];
  inStock: boolean;
  description?: string;
  assemblyRequired?: boolean;
  color?: string;
  dimensions?: string;
  featured?: boolean;
  images?: Array<{
    _key: string;
    _type: string;
    asset: { _ref: string; _type: string };
  }>;
  material?: string;
  stock?: number;
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

function RelatedProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === "BTN") return `Nu. ${price.toLocaleString()}`;
    return `$${price.toFixed(2)}`;
  };

  const getImageUrl = (image: SanityImageSource | string) => {
    if (typeof image === "string") return image;
    try {
      return urlFor(image).width(400).height(500).url();
    } catch {
      return "/images/placeholder-product.png";
    }
  };

  return (
    <Link href={`/shop/${product.slug}`} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Image
          src={getImageUrl(product.image)}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <div className="absolute top-2 left-2">
            <span
              className={`${badgeStyles[product.badge]} text-3xs font-bold px-2 py-0.5 tracking-widest`}
            >
              {badgeLabels[product.badge]}
            </span>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-dark-charcoal text-white text-3xs font-bold px-3 py-1 uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        {product.category?.title && (
          <p className="text-2xs font-bold text-gray-400 tracking-widest uppercase">
            {product.category.title}
          </p>
        )}
        <h3 className="text-sm font-semibold text-dark-charcoal line-clamp-1 group-hover:text-parofc-red transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-sm font-bold ${product.salePrice ? "text-parofc-red" : "text-dark-charcoal"}`}
          >
            {formatPrice(product.salePrice || product.price, product.currency)}
          </span>
          {product.salePrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSizeError, setShowSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const [productData, allProducts] = await Promise.all([
          client.fetch(PRODUCT_QUERY, { slug }),
          client.fetch(PRODUCTS_QUERY),
        ]);

        if (productData) {
          setProduct(productData);
          const related = allProducts
            .filter(
              (p: Product) =>
                p._id !== productData._id &&
                p.category?._id === productData.category?._id,
            )
            .slice(0, 4);
          if (related.length === 0) {
            const otherProducts = allProducts
              .filter((p: Product) => p._id !== productData._id)
              .slice(0, 4);
            setRelatedProducts(otherProducts);
          } else {
            setRelatedProducts(related);
          }
        } else {
          setProduct(null);
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const formatPrice = (price: number, currency: string) => {
    if (currency === "BTN") return `Nu. ${price.toLocaleString()}`;
    return `$${price.toFixed(2)}`;
  };

  const getImageUrl = (image: SanityImageSource | string) => {
    if (typeof image === "string") return image;
    try {
      return urlFor(image).width(800).height(1000).url();
    } catch {
      return "/images/placeholder-product.png";
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }

    const imageUrl = getImageUrl(product.image);

    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      image: imageUrl,
      price: product.price,
      currency: product.currency,
      salePrice: product.salePrice,
      size: selectedSize || "One Size",
      quantity: 1,
    });

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setIsCartOpen(true);
    }, 500);
  };

  const images = product
    ? [product.image, product.hoverImage, ...(product.images ?? [])].filter(Boolean)
    : [];

  // Loading state — fullScreen centers in viewport (inline Loader sits under nav otherwise)
  if (isLoading) {
    return <Loader fullScreen />;
  }

  // Not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <h1 className="text-4xl font-black text-dark-charcoal mb-4 uppercase">
            Not Found
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            This product doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-dark-charcoal text-white px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-parofc-red transition-colors duration-200 cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const salePercent =
    product.salePrice && product.price > 0
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top band — same language as /shop (hero + gradient) */}
      <div className="relative bg-dark-charcoal overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 21px)",
          }}
        />
        <div className="container mx-auto px-4 py-8 md:py-10 relative z-10">
          <p className="text-xs font-bold text-parofc-gold uppercase tracking-[0.2em] mb-3">
            Official Merchandise
          </p>
          <nav
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/65"
            aria-label="Breadcrumb"
          >
            <Link
              href="/shop"
              className="hover:text-white transition-colors cursor-pointer font-semibold"
            >
              Shop
            </Link>
            <span className="text-white/35" aria-hidden>
              /
            </span>
            {product.category?.title && (
              <>
                <span className="text-white/90 font-medium">
                  {product.category.title}
                </span>
                <span className="text-white/35" aria-hidden>
                  /
                </span>
              </>
            )}
            <span className="text-white font-semibold truncate max-w-[min(100%,20rem)]">
              {product.name}
            </span>
          </nav>
        </div>
        <div className="h-1 bg-gradient-to-r from-parofc-red via-parofc-gold to-bronze" />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Product Images — thumbnails left, main image right */}
          <div className="flex flex-col-reverse md:flex-row gap-3">
            {/* Thumbnail strip (left on desktop, bottom on mobile) */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2 md:w-20 flex-shrink-0 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[75vh] scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 overflow-hidden transition-all duration-200 cursor-pointer ${
                      currentImageIndex === idx
                        ? "opacity-100"
                        : "opacity-40 hover:opacity-70"
                    }`}
                  >
                    <Image
                      src={getImageUrl(img || product.image)}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image (right on desktop, top on mobile) */}
            <div className="flex-1 relative aspect-square md:aspect-[3/4] md:max-h-[75vh] overflow-hidden bg-gray-50">
              <Image
                src={getImageUrl(images[currentImageIndex] || product.image)}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`${badgeStyles[product.badge]} text-2xs font-bold px-3 py-1.5 tracking-widest`}
                  >
                    {badgeLabels[product.badge]}
                  </span>
                </div>
              )}

              {/* Sale tag */}
              {salePercent && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-parofc-red text-white text-xs font-bold px-2.5 py-1">
                    -{salePercent}%
                  </span>
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev > 0 ? prev - 1 : images.length - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      size={18}
                      className="text-dark-charcoal"
                    />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev < images.length - 1 ? prev + 1 : 0,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                    aria-label="Next image"
                  >
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={18}
                      className="text-dark-charcoal"
                    />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Category */}
              {product.category?.title && (
                <p className="text-2xs font-bold text-gray-400 tracking-widest uppercase">
                  {product.category.title}
                </p>
              )}

              {/* Name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-dark-charcoal leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl md:text-3xl font-black text-parofc-red">
                      {formatPrice(product.salePrice, product.currency)}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {salePercent && (
                      <span className="text-xs font-bold text-parofc-red bg-parofc-red/10 px-2 py-0.5">
                        Save {salePercent}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl md:text-3xl font-black text-dark-charcoal">
                    {formatPrice(product.price, product.currency)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-500 leading-relaxed">
                  {typeof product.description === "string"
                    ? product.description
                    : "Product description coming soon..."}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-dark-charcoal uppercase tracking-widest">
                      Size
                    </label>
                    {showSizeError && (
                      <span className="text-xs font-semibold text-parofc-red">
                        Please select a size
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setShowSizeError(false);
                        }}
                        className={`min-w-[48px] h-12 px-4 font-bold text-sm transition-all duration-200 cursor-pointer ${
                          selectedSize === size
                            ? "bg-dark-charcoal text-white"
                            : "bg-gray-50 text-dark-charcoal hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product details */}
              {(product.color || product.material || product.dimensions) && (
                <div className="space-y-2">
                  {product.color && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-20">
                        Color
                      </span>
                      <span className="text-sm text-dark-charcoal">
                        {product.color}
                      </span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-20">
                        Material
                      </span>
                      <span className="text-sm text-dark-charcoal">
                        {product.material}
                      </span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-20">
                        Size
                      </span>
                      <span className="text-sm text-dark-charcoal">
                        {product.dimensions}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Out of stock */}
              {!product.inStock && (
                <div className="bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm font-bold text-dark-charcoal">
                    Out of Stock
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This item is currently unavailable.
                  </p>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addedToCart}
                className={`w-full h-14 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  product.inStock
                    ? addedToCart
                      ? "bg-emerald-500 text-white"
                      : "bg-dark-charcoal text-white hover:bg-parofc-red"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <HugeiconsIcon icon={Tick02Icon} size={18} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
                    {product.inStock ? "Add to Cart" : "Sold Out"}
                  </>
                )}
              </button>

              {/* Share */}
              <button
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: product.name,
                        text: `Check out ${product.name} on Paro FC Shop!`,
                        url,
                      });
                    } catch (err) {
                      if (isShareUserCanceled(err)) return;
                      try {
                        await navigator.clipboard.writeText(url);
                        alert("Link copied to clipboard!");
                      } catch {
                        /* ignore */
                      }
                    }
                  } else {
                    await navigator.clipboard.writeText(url);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="w-full h-11 font-bold text-xs uppercase tracking-wider bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-dark-charcoal transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <HugeiconsIcon icon={Share01Icon} size={14} />
                Share
              </button>

              {/* Trust signals */}
              <div className="pt-2 space-y-3">
                {/* <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    icon={TruckIcon}
                    size={16}
                    className="text-parofc-gold flex-shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-dark-charcoal">
                      Free Shipping
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      on orders over Nu. 5,000
                    </span>
                  </div>
                </div> */}
                {/* <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    icon={RotateLeft01Icon}
                    size={16}
                    className="text-parofc-gold flex-shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-dark-charcoal">
                      Easy Returns
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      30-day return policy
                    </span>
                  </div>
                </div> */}
                <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    icon={Shield01Icon}
                    size={16}
                    className="text-parofc-gold flex-shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-dark-charcoal">
                      Authentic
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      100% official Paro FC
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 mt-12 md:mt-20">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <h2 className="text-4xl md:text-5xl font-black text-dark-charcoal uppercase tracking-tight leading-none mb-10">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <RelatedProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 lg:hidden z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium truncate">
              {product.name}
            </p>
            <p className="text-sm font-black text-dark-charcoal">
              {formatPrice(
                product.salePrice || product.price,
                product.currency,
              )}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`h-12 px-8 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              product.inStock
                ? addedToCart
                  ? "bg-emerald-500 text-white"
                  : "bg-dark-charcoal text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {addedToCart ? (
              <>
                <HugeiconsIcon icon={Tick02Icon} size={16} />
                Added
              </>
            ) : (
              <>
                <HugeiconsIcon icon={ShoppingBag01Icon} size={16} />
                {product.inStock ? "Add to Cart" : "Sold Out"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
