"use client";

import Loader from "@/components/Loader";
import { sanityFetch } from "@/sanity/lib/live";
import { ALL_TOP_SCORERS_QUERY } from "@/sanity/lib/queries";
import { Award01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TopScorer {
  _id: string;
  name: string;
  image?: string | null;
  goals: number;
  club: string;
}

export default function TopScorersPage() {
  const router = useRouter();
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityFetch<TopScorer[]>({ query: ALL_TOP_SCORERS_QUERY })
      .then((result) => {
        setScorers((result.data as TopScorer[]) ?? []);
      })
      .catch(() => setScorers([]))
      .finally(() => setLoading(false));
  }, []);

  const rankColors = ["text-parofc-gold", "text-white/60", "text-amber-600"];
  const medalBg = [
    "border-parofc-gold/30 bg-gradient-to-r from-parofc-gold/10 to-transparent",
    "border-white/20 bg-gradient-to-r from-white/5 to-transparent",
    "border-amber-700/30 bg-gradient-to-r from-amber-900/10 to-transparent",
  ];

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
              Statistics
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
              Top <span className="text-parofc-gold">Scorers</span>
            </h1>
            <p className="mt-3 text-sm font-bold uppercase tracking-wider text-white/40">
              Paro FC
            </p>
          </motion.div>
        </div>
        <div className="h-1 bg-gradient-to-r from-parofc-red via-parofc-gold to-bronze" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 pb-28">
        {loading ? (
          <Loader />
        ) : scorers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <HugeiconsIcon
              icon={Award01Icon}
              size={40}
              className="text-gray-300"
            />
            <p className="text-sm font-medium text-gray-400">
              No scorer data available
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-parofc-red/20 bg-card-dark p-5">
            <h2 className="mb-5 text-xl font-black uppercase text-white">
              All Top Scorers
            </h2>
            <div className="space-y-2">
              {scorers.map((scorer, idx) => (
                <motion.div
                  key={scorer._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className={`flex items-center gap-4 rounded-md border px-4 py-3 ${
                    medalBg[idx] ?? "border-white/10"
                  }`}
                >
                  <span
                    className={`w-7 shrink-0 text-xl font-black ${rankColors[idx] ?? "text-white/30"}`}
                  >
                    {idx + 1}
                  </span>
                  {scorer.image ? (
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={scorer.image}
                        alt={scorer.name}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
                      <span className="text-xs font-black uppercase text-white/40">
                        {scorer.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black uppercase text-white">
                      {scorer.name}
                    </p>
                    <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                      {scorer.club}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span
                      className={`text-2xl font-black ${idx === 0 ? "text-parofc-red" : "text-white"}`}
                    >
                      {scorer.goals}
                    </span>
                    <span className="text-2xs font-bold uppercase text-white/40">
                      Goals
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
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
