"use client";

import { ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuGroups = [
  {
    label: "Club",
    items: [
      { label: "Home", href: "/" },
      { label: "Standings", href: "/standings" },
      { label: "Fixtures & Results", href: "/fixtures-results" },
      { label: "Players", href: "/players" },
      { label: "About Paro FC", href: "/about" },
      { label: "Academy", href: "/academy" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "News", href: "/news" },
      { label: "Blogs", href: "/blogs" },
      { label: "Photos", href: "/photos" },
      { label: "Ebooks", href: "/ebooks" },
      { label: "TV", href: "/tv" },
    ],
  },
  {
    label: "Store",
    items: [{ label: "Shop", href: "/shop" }],
  },
];

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  let itemIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-dark-charcoal shadow-2xl z-[70] flex flex-col overflow-hidden"
          >
            {/* Stadium lighting glow inside panel */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(206,5,5,0.08)_0%,transparent_100%)]" />

            {/* Header */}
            <div className="relative flex items-center justify-end px-5 h-14 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            <div className="h-px bg-gradient-to-r from-parofc-red via-light-gold to-bronze" />

            {/* Menu groups */}
            <div className="relative flex-1 overflow-y-auto py-6 px-5">
              {menuGroups.map((group, groupIndex) => (
                <div key={group.label} className={groupIndex > 0 ? "mt-6" : ""}>
                  {/* Group label */}
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-2 px-0">
                    {group.label}
                  </div>

                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const delay = 0.05 + itemIndex++ * 0.03;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay }}
                      >
                        <Link
                          href={item.href}
                          prefetch
                          scroll={false}
                          onClick={onClose}
                          className="group flex items-center justify-between py-3 cursor-pointer border-b border-white/[0.04]"
                        >
                          <span
                            className={`text-sm font-bold uppercase tracking-widest transition-colors duration-200 ${
                              active
                                ? "text-parofc-red"
                                : "text-white/50 group-hover:text-light-gold"
                            }`}
                          >
                            {item.label}
                          </span>
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            size={13}
                            className={`transition-colors duration-200 ${
                              active
                                ? "text-parofc-red"
                                : "text-white/10 group-hover:text-light-gold"
                            }`}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer accent */}
            <div className="h-px bg-gradient-to-r from-parofc-red via-light-gold to-bronze" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
