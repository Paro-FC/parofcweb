"use client";

import Loader from "@/components/Loader";
import { sanityFetch } from "@/sanity/lib/live";
import { useSanityLiveQuery } from "@/sanity/lib/live-client";
import {
  STANDINGS_COMPETITIONS_QUERY,
  STANDINGS_QUERY,
  STANDINGS_SEASONS_QUERY,
} from "@/sanity/lib/queries";
import {
  ArrowDown01Icon,
  Award01Icon,
  Cancel01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Competition {
  id: string;
  name: string;
  short: string;
  order?: number;
  logo?: string;
}

interface Team {
  id: number;
  position: number;
  name: string;
  logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ("W" | "D" | "L")[];
}

function FormBadge({ v }: { v: "W" | "D" | "L" }) {
  const c =
    v === "W" ? "bg-green-500" : v === "D" ? "bg-yellow-500" : "bg-red-600";
  return (
    <span
      className={`grid h-[18px] w-[18px] place-items-center rounded-[4px] text-3xs font-black text-white ${c}`}
    >
      {v}
    </span>
  );
}

function zoneFromPosition(position: number, total: number) {
  if (position === 1) return "green";
  if (total >= 4 && position > total - 3) return "red";
  return null;
}

function ZoneBar({ zone }: { zone: string | null }) {
  if (!zone) return null;
  const c = zone === "green" ? "bg-green-500" : "bg-red-500";
  return <div className={`absolute left-0 top-0 h-full w-[3px] ${c}`} />;
}

function TeamInitialsLogo({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
      <span className="text-3xs font-black uppercase tracking-wide text-white/40">
        {initials || "—"}
      </span>
    </div>
  );
}

function formatGD(gd: number) {
  return gd > 0 ? `+${gd}` : `${gd}`;
}

export default function StandingsPage() {
  const router = useRouter();
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!selectedSeason) {
      setTeams([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const doc = liveStandingDoc;
    if (doc?.teams) {
      const teamsData = doc.teams
        .slice()
        .sort(
          (a, b) =>
            Number(b.points) - Number(a.points) ||
            Number(b.goalsFor) -
              Number(b.goalsAgainst) -
              (Number(a.goalsFor) - Number(a.goalsAgainst)),
        )
        .map((team, index) => ({
          id: index + 1,
          position: index + 1,
          name: team.teamName,
          logo: team.teamLogo,
          played: team.played,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalsFor - team.goalsAgainst,
          points: team.points,
          form: (team.form || []) as ("W" | "D" | "L")[],
        }));
      setTeams(teamsData);
    } else {
      setTeams([]);
    }
    setLoading(false);
  }, [liveStandingDoc, selectedSeason]);

  const selectedComp = competitions.find((c) => c.id === selectedCompetition);
  const selectedCompName = selectedComp?.name || "";
  const selectedCompLogo = selectedComp?.logo;

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
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 overflow-x-auto -mb-px">
              {competitions.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetition(comp.id)}
                  className={`relative px-5 md:px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors duration-200 uppercase tracking-wider cursor-pointer ${
                    selectedCompetition === comp.id
                      ? "text-dark-charcoal"
                      : "text-gray-400 hover:text-gray-600"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-dark-charcoal hover:text-parofc-red transition-colors duration-200 cursor-pointer"
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
                        className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden min-w-[100px]"
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
                                ? "bg-dark-charcoal text-white font-bold"
                                : "text-gray-600 font-medium hover:bg-gray-50"
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
          <h2 className="text-lg font-bold text-dark-charcoal">
            {selectedCompName}{" "}
            <span className="text-gray-400 font-medium">{selectedSeason}</span>
          </h2>
        </div>

        {/* Table — dark card */}
        <div className="rounded-lg border border-parofc-red/20 bg-card-dark p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black uppercase text-white">
                Live Standings
                <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />{" "}
                  LIVE
                </span>
              </h2>
              <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                {selectedCompName} {selectedSeason}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[700px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-2xs font-bold uppercase tracking-wider text-white/40">
                  <th className="w-8 px-2 py-2.5 text-left text-white">Pos</th>
                  <th className="px-2 py-2.5 text-left text-white">Club</th>
                  {["P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((h) => (
                    <th
                      key={h}
                      className={`px-2 py-2.5 text-center ${h === "Pts" ? "text-white" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 text-center">Form</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-16">
                      <Loader />
                    </td>
                  </tr>
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <HugeiconsIcon
                          icon={Award01Icon}
                          size={32}
                          className="text-white/20"
                        />
                        <span className="text-sm text-white/30 font-medium">
                          No standings data available
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => {
                    const isParo = team.name === "Paro FC";
                    const zone = zoneFromPosition(team.position, teams.length);
                    const gd = team.goalDifference;

                    return (
                      <tr
                        key={team.id}
                        className={`relative border-b border-white/5 transition ${
                          isParo ? "bg-parofc-red/10" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <td className="px-2 py-3 font-black text-white relative">
                          <ZoneBar zone={zone} />
                          {team.position}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            {team.logo ? (
                              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                                <Image
                                  src={team.logo}
                                  alt={team.name}
                                  width={28}
                                  height={28}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            ) : (
                              <TeamInitialsLogo name={team.name} />
                            )}
                            <span
                              className={`truncate font-black uppercase ${isParo ? "text-parofc-red" : "text-white"}`}
                            >
                              {team.name}
                            </span>
                          </div>
                        </td>
                        {[
                          team.played,
                          team.won,
                          team.drawn,
                          team.lost,
                          team.goalsFor,
                          team.goalsAgainst,
                          formatGD(gd),
                          team.points,
                        ].map((v, i) => (
                          <td
                            key={i}
                            className={`px-2 py-3 text-center font-bold ${i === 7 ? (isParo ? "text-lg text-parofc-red" : "text-lg text-white") : "text-white/70"}`}
                          >
                            {v}
                          </td>
                        ))}
                        <td className="px-2 py-3">
                          <div className="flex justify-center gap-[3px]">
                            {team.form?.map((f, i) => (
                              <FormBadge key={i} v={f} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <button
        onClick={() => router.push("/")}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={24} />
      </button>
    </div>
  );
}
