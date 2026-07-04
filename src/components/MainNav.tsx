"use client";

import { useCart } from "@/contexts/CartContext";
import { useSideMenu } from "@/contexts/SideMenuContext";
import {
  ArrowDown01Icon,
  ArrowUpRight01Icon,
  Menu01Icon,
  Search01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchModal } from "./SearchModal";

const leftLinks = [
  { href: "/standings", label: "Standings" },
  { href: "/fixtures-results", label: "Fixtures" },
  { href: "/players", label: "Squads" },
  { href: "/about", label: "About Paro FC" },
  { href: "/academy", label: "Academy" },
];

const rightLinks = [
  { href: "/news", label: "In the News" },
  { href: "/blogs", label: "Blogs" },
];

const moreLinks = [
  { href: "/photos", label: "Photos" },
  { href: "/ebooks", label: "Ebooks" },
];

export function MainNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { openMenu } = useSideMenu();
  const { getItemCount, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const cartCount = mounted ? getItemCount() : 0;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${
      isActive(href) ? "text-parofc-red" : "text-white/35 hover:text-light-gold"
    }`;

  const showTransparent = isHome && !scrolled;

  return (
    <>
      {/* Mobile Header */}
      <nav
        className={`md:hidden sticky top-0 z-50 font-display overflow-hidden transition-colors duration-300 ${showTransparent ? "bg-dark-charcoal/80 backdrop-blur-md" : "bg-dark-charcoal"}`}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(206,5,5,0.13)_0%,transparent_100%)]" />
        <div className="relative flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/assets/paro.png"
              alt="Paro FC"
              width={128}
              height={128}
              className="w-12 h-12 object-contain drop-shadow-[0_0_16px_rgba(206,5,5,0.5)]"
              quality={100}
            />
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-white/35 hover:text-light-gold transition-colors cursor-pointer"
              aria-label="Search"
            >
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-white/35 hover:text-light-gold transition-colors cursor-pointer relative"
              aria-label="Cart"
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-parofc-red text-white text-[8px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={openMenu}
              className="w-10 h-10 flex items-center justify-center text-white/35 hover:text-white transition-colors cursor-pointer"
              aria-label="Menu"
            >
              <HugeiconsIcon icon={Menu01Icon} size={20} />
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-parofc-red via-light-gold to-bronze" />
      </nav>

      {/* Desktop Navigation */}
      <nav
        className={`hidden md:block sticky top-0 z-50 font-display transition-colors duration-300 ${showTransparent ? "bg-dark-charcoal/80 backdrop-blur-md" : "bg-dark-charcoal"}`}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_80%_at_50%_-20%,rgba(206,5,5,0.11)_0%,transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(239,226,141,0.25)] to-transparent" />

        <div className="relative container mx-auto px-6 flex items-center justify-between h-20">
          {/* Left links */}
          <div className="flex items-center gap-8 flex-1">
            {leftLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                scroll={false}
                className={linkClass(link.href)}
              >
                {link.label}
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} strokeWidth={2.5} />
              </Link>
            ))}
          </div>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex-shrink-0"
          >
            <Image
              src="/assets/paro.png"
              alt="Paro FC"
              width={128}
              height={128}
              className="w-16 h-16 object-contain drop-shadow-[0_0_24px_rgba(206,5,5,0.5)] hover:drop-shadow-[0_0_32px_rgba(206,5,5,0.7)] transition-all duration-300"
              quality={100}
            />
          </Link>

          {/* Right links + icons */}
          <div className="flex items-center gap-8 flex-1 justify-end">
            {rightLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                scroll={false}
                className={linkClass(link.href)}
              >
                {link.label}
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} strokeWidth={2.5} />
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative flex items-center" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 cursor-pointer ${
                  moreLinks.some((l) => isActive(l.href))
                    ? "text-parofc-red"
                    : "text-white/35 hover:text-light-gold"
                }`}
              >
                More
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={11}
                  className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-36 bg-dark-charcoal border border-white/10 shadow-xl z-50 py-1"
                  >
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch
                        scroll={false}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center justify-between px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-150 ${
                          isActive(link.href)
                            ? "text-parofc-red"
                            : "text-white/35 hover:text-light-gold"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Shop CTA */}
            <Link
              href="/shop"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-200 active:scale-[0.97] ${
                isActive("/shop")
                  ? "bg-parofc-red text-white"
                  : "bg-parofc-red/10 text-parofc-red border border-parofc-red/30 hover:bg-parofc-red hover:text-white"
              }`}
            >
              Shop
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={10}
                strokeWidth={2.5}
              />
            </Link>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-light-gold transition-colors cursor-pointer"
              aria-label="Search"
            >
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-light-gold transition-colors cursor-pointer relative"
              aria-label="Cart"
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-parofc-red text-white text-[8px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-parofc-red via-light-gold to-bronze" />
      </nav>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
