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
  Share01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [sharing, setSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const captureTable = async (): Promise<{ blob: Blob; dataUrl: string }> => {
    if (!tableRef.current) throw new Error("Table not found");
    const canvas = await html2canvas(tableRef.current, {
      backgroundColor: "#1a1a2e",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png"),
    );
    return { blob, dataUrl };
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const { dataUrl } = await captureTable();
      setCapturedImage(dataUrl);
      setShowShareMenu(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  const copyImageToClipboard = async (): Promise<boolean> => {
    if (!capturedImage) return false;
    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      return true;
    } catch {
      return false;
    }
  };

  const openPlatform = async (url: string) => {
    const copied = await copyImageToClipboard();
    window.open(url, "_blank", "noopener,noreferrer");
    showToast(
      copied
        ? "Image copied — paste it into your post!"
        : "Opening platform — screenshot the standings to share.",
    );
  };

  const downloadImage = () => {
    if (!capturedImage) return;
    const a = document.createElement("a");
    a.href = capturedImage;
    a.download = `paro-fc-standings-${selectedSeason}.png`;
    a.click();
    showToast("Image saved!");
  };

  const shareToNative = async () => {
    if (!capturedImage) return;
    const res = await fetch(capturedImage);
    const blob = await res.blob();
    const file = new File([blob], "paro-fc-standings.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Paro FC Standings - ${selectedCompName} ${selectedSeason}`,
        text: "Check out the latest standings! 🏆",
      });
    } else {
      downloadImage();
    }
  };

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
        <div ref={tableRef} className="rounded-lg border border-parofc-red/20 bg-card-dark p-5">
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
            <button
              onClick={handleShare}
              disabled={sharing || teams.length === 0}
              className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-parofc-red px-4 py-2 text-xs font-bold text-white uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HugeiconsIcon icon={Share01Icon} size={14} />
              {sharing ? "Capturing…" : "Share"}
            </button>
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

      {/* Share modal */}
      <AnimatePresence>
        {showShareMenu && capturedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              onClick={() => setShowShareMenu(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-[#111] pb-safe shadow-2xl md:bottom-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[420px] md:rounded-2xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>

              <div className="px-5 pt-3 pb-6">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Share Standings
                  </h3>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/60 hover:text-white transition"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  </button>
                </div>

                {/* Preview */}
                <img
                  src={capturedImage}
                  alt="Standings preview"
                  className="mb-4 w-full rounded-xl object-cover ring-1 ring-white/10"
                />

                {/* Toast */}
                <AnimatePresence>
                  {toast && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-3 rounded-xl bg-green-500/20 border border-green-500/30 px-4 py-2.5 text-center text-xs font-bold text-green-400"
                    >
                      {toast}
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mb-3 text-center text-2xs font-bold uppercase tracking-wider text-white/30">
                  Image is copied to clipboard — just paste when posting
                </p>

                {/* Platform grid */}
                {(() => {
                  const siteUrl = "https://parofc.bt/standings";
                  const shareText = `🏆 Paro FC Standings — ${selectedCompName} ${selectedSeason}`;
                  const platforms = [
                    {
                      label: "Facebook",
                      color: "bg-[#1877F2]",
                      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`,
                      icon: (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.254h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Twitter",
                      color: "bg-black ring-1 ring-white/20",
                      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`,
                      icon: (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                    },
                    {
                      label: "WhatsApp",
                      color: "bg-[#25D366]",
                      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${siteUrl}`)}`,
                      icon: (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      ),
                    },
                    {
                      label: "LinkedIn",
                      color: "bg-[#0A66C2]",
                      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}&title=${encodeURIComponent(shareText)}&summary=${encodeURIComponent(`Check out the latest ${selectedCompName} standings on Paro FC!`)}`,
                      icon: (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      ),
                    },
                  ];
                  return (
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {platforms.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => openPlatform(p.url)}
                          className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 py-4 transition active:scale-95"
                        >
                          <div className={`grid h-10 w-10 place-items-center rounded-full ${p.color}`}>
                            {p.icon}
                          </div>
                          <span className="text-2xs font-bold text-white/70">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* Download */}
                <button
                  onClick={downloadImage}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 py-3 text-xs font-bold text-white/60 uppercase tracking-wider transition mb-3"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 2h14v2H5v-2z" />
                  </svg>
                  Download Image
                </button>

                {/* Native share (mobile) */}
                <button
                  onClick={shareToNative}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 py-3 text-xs font-bold text-white/70 uppercase tracking-wider transition"
                >
                  <HugeiconsIcon icon={Share01Icon} size={14} />
                  More options…
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
