"use client";

import Loader from "@/components/Loader";
import { useSanityLiveQuery } from "@/sanity/lib/live-client";
import { ALL_TOP_SCORERS_QUERY } from "@/sanity/lib/queries";
import { Award01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import Image from "next/image";

interface TopScorer {
  _id: string;
  name: string;
  image?: string | null;
  goals: number;
  club: string;
}

const rankColors = ["text-parofc-gold", "text-white/60", "text-amber-600"];
const medalBg = [
  "border-parofc-gold/30 bg-gradient-to-r from-parofc-gold/10 to-transparent",
  "border-white/20 bg-gradient-to-r from-white/5 to-transparent",
  "border-amber-700/30 bg-gradient-to-r from-amber-900/10 to-transparent",
];

function TeamInitialsLogo({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const dim = size === "md" ? "h-11 w-11" : "h-9 w-9";
  return (
    <div className={`grid ${dim} shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10`}>
      <span className="text-xs font-black uppercase text-white/40">{initials || "—"}</span>
    </div>
  );
}

export default function TopScorersPage() {
  const scorers = useSanityLiveQuery<TopScorer[] | null>(ALL_TOP_SCORERS_QUERY, {}, null);
  const loading = scorers === null;
  const scorerList = scorers ?? [];

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
        ) : scorerList.length === 0 ? (
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
              {scorerList.map((scorer, idx) => (
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
                    <TeamInitialsLogo name={scorer.name} />
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
                      className={`text-sm font-black ${idx === 0 ? "text-parofc-red" : "text-white"}`}
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
    </div>
  );
}
