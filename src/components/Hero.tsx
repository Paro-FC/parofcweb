"use client";

import Image from "next/image";
import Link from "next/link";
import shopDesktop from "@/assets/Shop-Hompage-Landing.webp";
import shopMobile from "@/assets/Shop-mobile.webp";

export function Hero() {
  return (
    <section className="w-full">
      {/* Mobile */}
      <Link href="/shop" className="md:hidden block relative w-full min-h-[calc(100dvh-5rem-1px)] h-[calc(100dvh-5rem-1px)]">
        <Image
          src={shopMobile}
          alt="Paro FC Shop"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </Link>

      {/* Tablet & Desktop */}
      <Link href="/shop" className="hidden md:block relative w-full min-h-[calc(100dvh-5rem-1px)] h-[calc(100dvh-5rem-1px)]">
        <Image
          src={shopDesktop}
          alt="Paro FC Shop"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </Link>
    </section>
  );
}
