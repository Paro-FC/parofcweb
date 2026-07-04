"use client";

import Loader from "@/components/Loader";
import {
  LiveStandingsTable,
  sortTeamsByPoints,
  type StandingTeam,
} from "@/components/LiveStandingsTable";
import { sanityFetch } from "@/sanity/lib/live";
import { useSanityLiveQuery } from "@/sanity/lib/live-client";
import {
  STANDINGS_COMPETITIONS_QUERY,
  STANDINGS_QUERY,
  STANDINGS_SEASONS_QUERY,
} from "@/sanity/lib/queries";
import { ArrowDown01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface Competition {
  id: string;
  name: string;
  short: string;
  order?: number;
  logo?: string;
}

export default function StandingsPage() {
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [seasons, setSeasons] = useState<string[]>([]);

  const liveCompetitions = useSanityLiveQuery<Competition[]>(
    STANDINGS_COMPETITIONS_QUERY,
    {},
    [],
  );

  const competitions = useMemo(
    () => (liveCompetitions || []).filter((c) => c?.id),
    [liveCompetitions],
  );

  useEffect(() => {
    if (competitions.length === 0) return;
    if (!competitions.some((c) => c.id === selectedCompetition)) {
      setSelectedCompetition(competitions[0].id);
    }
  }, [competitions, selectedCompetition]);

  useEffect(() => {
    if (!selectedCompetition) return;
    const fetchSeasons = async () => {
      try {
        const seasonsResult = await sanityFetch<{ season: string }[]>({
          query: STANDINGS_SEASONS_QUERY,
          params: { competition: selectedCompetition },
        }).catch(() => ({ data: [] as { season: string }[] }));

        const data = seasonsResult.data;
        if (Array.isArray(data)) {
          const uniqueSeasons = Array.from(
            new Set(data.map((s) => s.season).filter(Boolean)),
          ).sort((a, b) => b.localeCompare(a)) as string[];
          setSeasons(uniqueSeasons);
          setSelectedSeason((prev) =>
            prev && uniqueSeasons.includes(prev)
              ? prev
              : uniqueSeasons[0] || "",
          );
        }
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };

    fetchSeasons();
  }, [selectedCompetition]);

  const liveStandingDoc = useSanityLiveQuery<{
    teams?: {
      teamName: string;
      teamLogo?: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
      form?: ("W" | "D" | "L")[];
    }[];
  } | null>(
    STANDINGS_QUERY,
    { competition: selectedCompetition, season: selectedSeason || "" },
    null,
  );

  const displayTeams = useMemo<StandingTeam[]>(() => {
    if (!selectedSeason || !liveStandingDoc?.teams) return [];
    return sortTeamsByPoints(
      liveStandingDoc.teams.map((t) => ({
        teamName: t.teamName,
        teamLogo: t.teamLogo,
        position: 0,
        played: t.played,
        won: t.won,
        drawn: t.drawn,
        lost: t.lost,
        goalsFor: t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        points: t.points,
        form: t.form ?? [],
      }))
    );
  }, [liveStandingDoc, selectedSeason]);

  const selectedComp = competitions.find((c) => c.id === selectedCompetition);
  const selectedCompName = selectedComp?.name || "";
  const selectedCompLogo = selectedComp?.logo;

  return (
    <div className="min-h-screen bg-near-black text-white">
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
              Standings
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
              League <span className="text-parofc-gold">Tables</span>
            </h1>
          </motion.div>
        </div>

        <div className="h-1 bg-gradient-to-r from-parofc-red via-parofc-gold to-bronze" />
      </div>

      {/* Competition Tabs + Season Filter */}
      <div className="sticky top-0 z-30 bg-near-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 overflow-x-auto -mb-px">
              {competitions.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetition(comp.id)}
                  className={`relative px-5 md:px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors duration-200 uppercase tracking-wider cursor-pointer ${
                    selectedCompetition === comp.id
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span className="hidden md:inline">{comp.name}</span>
                  <span className="md:hidden">{comp.short}</span>
                  {selectedCompetition === comp.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-parofc-red"
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

            {/* Season Selector */}
            {seasons.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white/70 hover:text-parofc-red transition-colors duration-200 cursor-pointer"
                >
                  <span>{selectedSeason}</span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={14}
                    className={`transition-transform duration-200 ${showSeasonDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showSeasonDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSeasonDropdown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 bg-card-dark border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[100px]"
                      >
                        {seasons.map((season) => (
                          <button
                            key={season}
                            onClick={() => {
                              setSelectedSeason(season);
                              setShowSeasonDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-sm text-left transition-colors duration-150 cursor-pointer ${
                              selectedSeason === season
                                ? "bg-white/10 text-white font-bold"
                                : "text-white/50 font-medium hover:bg-white/5"
                            }`}
                          >
                            {season}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Table Title */}
        <div className="flex items-center gap-3 mb-6">
          {selectedCompLogo ? (
            <Image
              src={selectedCompLogo}
              alt={selectedCompName}
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          ) : (
            <HugeiconsIcon
              icon={Shield01Icon}
              size={20}
              className="text-parofc-gold"
            />
          )}
          <h2 className="text-lg font-bold text-white">
            {selectedCompName}{" "}
            <span className="text-white/40 font-medium">{selectedSeason}</span>
          </h2>
        </div>

        {/* Table — dark card */}
        <div className="rounded-lg border border-parofc-red/20 bg-card-dark p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black uppercase text-white">
                Live Standings
                <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                </span>
              </h2>
              <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                {selectedCompName} {selectedSeason}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            {!selectedSeason ? (
              <div className="py-16 text-center">
                <Loader />
              </div>
            ) : (
              <LiveStandingsTable teams={displayTeams} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
