"use client";

import Loader from "@/components/Loader";
import { PlayerCard, type PlayerCardPlayer } from "@/components/PlayerCard";
import { urlFor } from "@/sanity/lib/image";
import { useSanityLiveQuery } from "@/sanity/lib/live-client";
import {
  COACHING_STAFF_QUERY,
  PLAYERS_BY_TEAM_QUERY,
} from "@/sanity/lib/queries";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface Player extends PlayerCardPlayer {
  team?: string;
}

interface StaffCategory {
  _id: string;
  title: string;
  order?: number | null;
}

interface CoachingStaff {
  _id: string;
  name: string;
  role: string;
  category?: StaffCategory | null;
  image?: unknown | null;
}

type PositionCategory =
  | "goalkeepers"
  | "defenders"
  | "midfielders"
  | "forwards"
  | "coaching";
type TeamType = "mens" | "womens";

const positionCategories: { id: PositionCategory; label: string }[] = [
  { id: "goalkeepers", label: "Goalkeepers" },
  { id: "defenders", label: "Defenders" },
  { id: "midfielders", label: "Midfielders" },
  { id: "forwards", label: "Forwards" },
  { id: "coaching", label: "Staff" },
];

export default function PlayersPage() {
  const [activeTeam, setActiveTeam] = useState<TeamType>("mens");
  const [activeCategory, setActiveCategory] =
    useState<PositionCategory>("goalkeepers");

  const playersData = useSanityLiveQuery<Player[] | null>(PLAYERS_BY_TEAM_QUERY, { team: activeTeam }, null);
  const coachingData = useSanityLiveQuery<CoachingStaff[] | null>(COACHING_STAFF_QUERY, { team: activeTeam }, null);
  const loading = playersData === null;
  const players = playersData ?? [];
  const coachingStaff = coachingData ?? [];

  const grouped: Record<string, Player[]> = {
    goalkeepers: players.filter((p) => p.position === "Goalkeeper"),
    defenders: players.filter((p) => p.position === "Defender"),
    midfielders: players.filter((p) => p.position === "Midfielder"),
    forwards: players.filter((p) => p.position === "Forward"),
  };

  const currentPlayers = grouped[activeCategory] || [];

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
              Players
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
              The <span className="text-parofc-gold">Squads</span>
            </h1>
          </motion.div>
        </div>

        <div className="h-1 bg-gradient-to-r from-parofc-red via-parofc-gold to-bronze" />
      </div>

      {/* Team Tabs — sticky */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 -mb-px">
              {(["mens", "womens"] as const).map((team) => (
                <button
                  key={team}
                  onClick={() => {
                    setActiveTeam(team);
                    // keep current section; if switching team while on coaching, keep it.
                  }}
                  className={`relative px-5 md:px-6 py-3.5 text-sm font-bold whitespace-nowrap transition-colors duration-200 uppercase tracking-wider cursor-pointer ${
                    activeTeam === team
                      ? "text-dark-charcoal"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {team === "mens" ? "Men's" : "Women's"}
                  {activeTeam === team && (
                    <motion.div
                      layoutId="activeTeamMainTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-parofc-gold"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Count */}
            {/* <span className="text-xs text-gray-400 tabular-nums hidden md:block">
              {players.length} players
            </span> */}
          </div>
        </div>
      </div>

      {/* Position Filter */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto -mb-px scrollbar-hide">
            {positionCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-4 md:px-5 py-3 text-xs font-bold whitespace-nowrap transition-colors duration-200 uppercase tracking-widest cursor-pointer ${
                  activeCategory === cat.id
                    ? "text-dark-charcoal"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="activePositionTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-dark-charcoal"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <Loader />
        ) : activeCategory === "coaching" ? (
          /* Coaching Staff */
          <AnimatePresence mode="wait">
            <motion.div
              key="coaching"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {coachingStaff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    size={32}
                    className="text-gray-200 mb-3"
                  />
                  <span className="text-sm text-gray-400 font-medium">
                    No coaching staff listed yet
                  </span>
                </div>
              ) : (
                (() => {
                  type GroupEntry = { category: StaffCategory | null; members: CoachingStaff[] };
                  const groupMap = new Map<string, GroupEntry>();

                  for (const staff of coachingStaff) {
                    const key = staff.category?._id ?? "__uncategorized__";
                    if (!groupMap.has(key)) {
                      groupMap.set(key, { category: staff.category ?? null, members: [] });
                    }
                    groupMap.get(key)!.members.push(staff);
                  }

                  const groups = Array.from(groupMap.values()).sort((a, b) => {
                    const aOrder = a.category?.order ?? 999;
                    const bOrder = b.category?.order ?? 999;
                    return aOrder - bOrder;
                  });

                  let globalIndex = 0;
                  return (
                    <div className="space-y-10">
                      {groups.map((group) => (
                        <div key={group.category?._id ?? "__uncategorized__"}>
                          {group.category && (
                          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-parofc-gold mb-5">
                            {group.category.title}
                          </h2>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {group.members.map((staff) => {
                              const idx = globalIndex++;
                              return (
                                <motion.div
                                  key={staff._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                                  className="group"
                                >
                                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                                    {staff.image ? (
                                      <Image
                                        src={urlFor(staff.image)
                                          .width(600)
                                          .height(900)
                                          .fit("max")
                                          .auto("format")
                                          .url()}
                                        alt={staff.name}
                                        fill
                                        className="object-cover object-top"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 bg-gradient-to-br from-dark-charcoal to-parofc-red flex items-center justify-center">
                                        <span className="text-5xl font-black text-white/20">
                                          {staff.name
                                            .split(/\s+/)
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                      <p className="text-2xs font-bold text-parofc-gold uppercase tracking-widest mb-1">
                                        {staff.role}
                                      </p>
                                      <p className="text-base md:text-lg font-black text-white uppercase leading-tight">
                                        {staff.name}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Player Grid */
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    size={32}
                    className="text-gray-200 mb-3"
                  />
                  <span className="text-sm text-gray-400 font-medium">
                    No players found for the{" "}
                    {activeTeam === "mens" ? "Men's" : "Women's"} Team
                  </span>
                </div>
              ) : currentPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    size={32}
                    className="text-gray-200 mb-3"
                  />
                  <span className="text-sm text-gray-400 font-medium">
                    No{" "}
                    {positionCategories.find((c) => c.id === activeCategory)
                      ?.label || "players"}{" "}
                    found
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {currentPlayers.map((player, index) => (
                    <PlayerCard
                      key={player._id || player.id || index}
                      player={player}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
