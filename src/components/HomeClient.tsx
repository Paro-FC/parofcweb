"use client";

import { Hero } from "@/components/Hero";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import {
  LiveStandingsTable,
  sortTeamsByPoints,
} from "@/components/LiveStandingsTable";
import { getYoutubeIdFromUrl } from "@/lib/youtube";
import { urlFor } from "@/sanity/lib/image";
import { useSanityLiveQuery } from "@/sanity/lib/live-client";
import { STANDINGS_HOME_LATEST_QUERY } from "@/sanity/lib/queries";
import {
  ArrowUpRight01Icon,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Play,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function useCountdown(targetDate: string | undefined) {
  const [timeLeft, setTimeLeft] = useState({
    days: "--",
    hrs: "--",
    mins: "--",
    secs: "--",
  });

  useEffect(() => {
    if (!targetDate) return;

    function calc() {
      const diff = new Date(targetDate!).getTime() - Date.now();
      if (diff <= 0) return { days: "0", hrs: "0", mins: "0", secs: "0" };
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return {
        days: String(days).padStart(2, "0"),
        hrs: String(hrs).padStart(2, "0"),
        mins: String(mins).padStart(2, "0"),
        secs: String(secs).padStart(2, "0"),
      };
    }

    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

/* ─── TYPES ─── */
interface NewsItem {
  _id: string;
  image: any;
  title: string;
  externalUrl?: string;
  publishedAt: string;
  slug: string;
}

interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string | null;
  awayCrest?: string | null;
  competition: string;
  date: string;
  event: string;
  venue: string;
  matchUrl?: string;
  showMatchLink?: boolean;
  ticketUrl?: string;
}

interface Partner {
  _id: string;
  name: string;
  logo: string;
  url: string;
  category?: string;
  order?: number | null;
}

interface TrophyItem {
  _id: string;
  name: string;
  total: number;
}

interface StandingTeam {
  position: number;
  teamName: string;
  teamLogo?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form?: string[] | null;
}

interface StandingDoc {
  _id: string;
  season: string;
  competition: string;
  competitionName?: string;
  competitionShort?: string;
  teams: StandingTeam[];
}

interface YoutubeVideo {
  _id: string;
  title: string;
  youtubeUrl: string;
  publishedAt?: string;
}

interface TopScorer {
  _id: string;
  name: string;
  image?: string | null;
  goals: number;
  club: string;
}

interface HomeClientProps {
  news: NewsItem[];
  blogs: NewsItem[];
  matches: Match[];
  mainPartners: Partner[];
  subPartners: Partner[];
  trophies: TrophyItem[];
  youtubeVideos: YoutubeVideo[];
  standings?: StandingDoc | null;
  topScorer?: TopScorer | null;
  topScorers?: TopScorer[];
  products?: ProductCardData[];
}

/* ─── SMALL COMPONENTS ─── */
function Crest({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-7 w-7", md: "h-12 w-12", lg: "h-16 w-16" }[size];
  return (
    <div className={`${s} shrink-0 overflow-hidden rounded-full`}>
      <Image
        src="/assets/paro.png"
        alt="Paro FC"
        width={64}
        height={64}
        className="h-full w-full object-contain"
      />
    </div>
  );
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

function CountdownBlock({
  value,
  label,
  showDivider = true,
}: {
  value: string;
  label: string;
  showDivider?: boolean;
}) {
  return (
    <div className="flex items-stretch">
      <div className="px-3 py-1 text-center sm:px-4">
        <div className="text-3xl font-black tabular-nums text-parofc-red sm:text-4xl">
          {value}
        </div>
        <p className="text-3xs font-bold uppercase tracking-wider text-white/40 sm:text-2xs">
          {label}
        </p>
      </div>
      {showDivider && (
        <div className="my-4 hidden w-px bg-gradient-to-b from-transparent via-parofc-red/40 to-transparent sm:block" />
      )}
    </div>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-parofc-red/20 bg-card-dark overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d
    .toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

/* ─── MAIN ─── */
export function HomeClient({
  news,
  blogs,
  matches,
  mainPartners,
  subPartners,
  trophies,
  youtubeVideos,
  standings,
  topScorer,
  topScorers = [],
  products = [],
}: HomeClientProps) {
  const nextMatch = matches?.[0];
  const countdown = useCountdown(nextMatch?.date);
  const topNews = news?.slice(0, 3) ?? [];
  const topBlogs = blogs?.slice(0, 3) ?? [];
  const topVideos = youtubeVideos?.slice(0, 5) ?? [];
  const sortedMainPartners = [...mainPartners].sort(
    (a, b) => (a.order ?? 9999) - (b.order ?? 9999),
  );
  const sortedSubPartners = [...subPartners].sort(
    (a, b) => (a.order ?? 9999) - (b.order ?? 9999),
  );
  const liveStandings = useSanityLiveQuery<StandingDoc | null>(
    STANDINGS_HOME_LATEST_QUERY,
    {},
    standings ?? null,
  );
  const standingTeams = sortTeamsByPoints(liveStandings?.teams ?? []);
  const sortedByPoints = standingTeams;

  const raceToTitle = sortedByPoints.slice(0, 5).map((t, idx) => {
    const isParo = t.teamName.toLowerCase().includes("paro");
    return {
      pos: idx + 1,
      name: t.teamName,
      pts: t.points,
      logo: t.teamLogo,
      isParo,
    };
  });

  return (
    <div className="min-h-screen bg-near-black text-white">
      {/* ══════ HERO ══════ */}
      <Hero />

      {/* ══════ NEXT MATCH BAR ══════ */}
      {nextMatch && (
        <section className="mx-auto max-w-[1400px] px-5 pt-5">
          <div className="rounded-lg border border-parofc-red/20 bg-card-dark px-4 py-5 sm:px-6">
            <div className="mb-5">
              <h2 className="text-lg font-black uppercase text-parofc-red">
                Next Match
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                {nextMatch.competition}
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-center gap-6 sm:gap-8">
                <div className="text-center">
                  {nextMatch.homeCrest ? (
                    <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={nextMatch.homeCrest}
                        alt={nextMatch.homeTeam}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <Crest size="lg" />
                  )}
                  <p className="mt-2 max-w-[80px] sm:max-w-none text-xs font-black uppercase tracking-wider sm:text-base">
                    {nextMatch.homeTeam}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="h-6 w-px bg-gradient-to-b from-transparent via-parofc-red/40 to-transparent" />
                  <span className="text-2xl font-black text-white sm:text-4xl">
                    VS
                  </span>
                  <div className="h-6 w-px bg-gradient-to-b from-transparent via-parofc-red/40 to-transparent" />
                </div>
                <div className="text-center">
                  {nextMatch.awayCrest ? (
                    <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={nextMatch.awayCrest}
                        alt={nextMatch.awayTeam}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto grid h-12 w-12 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-full bg-white/10 text-sm sm:text-base font-black">
                      {nextMatch.awayTeam
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <p className="mt-2 max-w-[80px] sm:max-w-none text-xs font-black uppercase tracking-wider sm:text-base">
                    {nextMatch.awayTeam}
                  </p>
                </div>
              </div>

              <div className="hidden h-28 w-px bg-gradient-to-b from-transparent via-parofc-red/40 to-transparent lg:block" />

              <div className="flex flex-col items-stretch sm:flex-row">
                <div className="flex items-center justify-between py-2 sm:flex-col sm:justify-center sm:px-7">
                  <HugeiconsIcon
                    icon={Calendar}
                    size={32}
                    primaryColor="currentColor"
                    className="text-white/50 sm:mb-2"
                    strokeWidth={1.8}
                  />
                  <div className="text-right sm:text-center">
                    <p className="text-sm font-black uppercase sm:text-base">
                      {new Date(nextMatch.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                      {new Date(nextMatch.date).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </p>
                  </div>
                </div>
                <div className="my-2 h-px w-full bg-gradient-to-r from-transparent via-parofc-red/40 to-transparent sm:my-2 sm:h-auto sm:w-px sm:bg-gradient-to-b" />
                <div className="flex items-center justify-between py-2 sm:flex-col sm:justify-center sm:px-7">
                  <HugeiconsIcon
                    icon={Clock}
                    size={32}
                    primaryColor="currentColor"
                    className="text-white/50 sm:mb-2"
                    strokeWidth={1.8}
                  />
                  <div className="text-right sm:text-center">
                    <p className="text-sm font-black uppercase sm:text-base">
                      {new Date(nextMatch.date).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Thimphu",
                      })}
                    </p>
                    <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                      Kick Off
                    </p>
                  </div>
                </div>
                <div className="my-2 h-px w-full bg-gradient-to-r from-transparent via-parofc-red/40 to-transparent sm:my-2 sm:h-auto sm:w-px sm:bg-gradient-to-b" />
                <div className="flex items-center justify-between py-2 sm:flex-col sm:justify-center sm:px-7">
                  <HugeiconsIcon
                    icon={MapPin}
                    size={32}
                    primaryColor="currentColor"
                    className="text-white/50 sm:mb-2"
                    strokeWidth={1.8}
                  />
                  <div className="text-right sm:text-center">
                    <p className="text-sm font-black uppercase sm:text-base">
                      {nextMatch.venue}
                    </p>
                    <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                      Venue
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden h-28 w-px bg-gradient-to-b from-transparent via-parofc-red/40 to-transparent lg:block" />

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch sm:gap-0">
                  <div className="rounded-md border border-white/10 bg-white/[0.03] sm:rounded-none sm:border-0 sm:bg-transparent">
                    <CountdownBlock value={countdown.days} label="Days" />
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] sm:rounded-none sm:border-0 sm:bg-transparent">
                    <CountdownBlock value={countdown.hrs} label="Hrs" />
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] sm:rounded-none sm:border-0 sm:bg-transparent">
                    <CountdownBlock value={countdown.mins} label="Mins" />
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] sm:rounded-none sm:border-0 sm:bg-transparent">
                    <CountdownBlock
                      value={countdown.secs}
                      label="Secs"
                      showDivider={false}
                    />
                  </div>
                </div>
                {nextMatch.ticketUrl && (
                  <a
                    href={nextMatch.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-parofc-red/50 bg-parofc-red px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-parofc-red/80"
                  >
                    Buy Tickets
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={14}
                      primaryColor="currentColor"
                      strokeWidth={1.9}
                    />
                  </a>
                )}
                {nextMatch.matchUrl && nextMatch.showMatchLink !== false ? (
                  <a
                    href={nextMatch.matchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-parofc-gold/35 bg-parofc-gold/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-parofc-gold transition hover:bg-parofc-gold hover:text-dark-charcoal"
                  >
                    Open match link
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={14}
                      primaryColor="currentColor"
                      strokeWidth={1.9}
                    />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════ STANDINGS + SIDEBAR ══════ */}
      <section className="mx-auto grid max-w-[1400px] gap-5 px-5 pt-5 lg:grid-cols-[1fr_360px]">
        <SectionCard className="p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black uppercase">
                Men&apos;s Live Standings{" "}
                <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />{" "}
                  LIVE
                </span>
              </h2>
              <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                {liveStandings?.competitionName || "Bhutan Premier League"}{" "}
                {liveStandings?.season ? liveStandings.season : "—"}
              </p>
            </div>
            <Link
              href="/standings"
              className="w-fit text-xs font-bold uppercase tracking-wider text-parofc-red hover:underline"
            >
              View Full Table →
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <LiveStandingsTable teams={standingTeams} />
          </div>
          {/* <div className="mt-4 flex flex-wrap gap-5 text-2xs font-bold uppercase tracking-wider text-white/40">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> AFC Qualification</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-400" /> Relegation Play-off</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Relegation</span>
          </div> */}
        </SectionCard>

        <div className="flex flex-col gap-5">
          {/* Race to the Title */}
          <SectionCard className="p-4">
            <Link
              href="/standings"
              className="mb-3 text-sm font-black uppercase tracking-wider hover:text-parofc-red transition-colors block"
            >
              Race to the Title
            </Link>
            <div className="space-y-2">
              {raceToTitle.map((t) => {
                const maxPts = sortedByPoints[0]?.points || 1;
                const barPct = Math.max(20, Math.round((t.pts / maxPts) * 100));
                return (
                  <div key={t.pos} className="flex items-center gap-3">
                    <span className="w-5 text-lg font-black text-white/30">
                      {t.pos}
                    </span>
                    <div
                      className={`flex-1 rounded-md border px-3 py-2.5 ${t.isParo ? "border-parofc-red/30 bg-gradient-to-r from-parofc-red/15 to-transparent" : "border-white/10"}`}
                    >
                      <div className="flex items-center gap-2">
                        {t.logo ? (
                          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                            <Image
                              src={t.logo}
                              alt={t.name}
                              width={28}
                              height={28}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <TeamInitialsLogo name={t.name} />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-xs font-black uppercase ${t.isParo ? "text-parofc-red" : ""}`}
                          >
                            {t.name}
                          </p>
                          <p
                            className={`text-base font-black ${t.isParo ? "text-parofc-red" : "text-white"}`}
                          >
                            {t.pts}{" "}
                            <span className="text-2xs font-bold text-white/40">
                              PTS
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 h-[2px] rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${t.isParo ? "bg-parofc-red" : "bg-white/30"}`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Top Scorers */}
          {topScorers.length > 0 && (
            <SectionCard className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Top Scorers of Paro FC
                </h3>
                <Link
                  href="/top-scorers"
                  className="text-xs font-bold uppercase tracking-wider text-parofc-red hover:underline"
                >
                  See More →
                </Link>
              </div>
              <div className="space-y-2">
                {topScorers.map((scorer, idx) => {
                  const rankColors = [
                    "text-parofc-gold",
                    "text-white/60",
                    "text-amber-600",
                  ];
                  return (
                    <div
                      key={scorer._id}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${idx === 0 ? "border-parofc-red/30 bg-gradient-to-r from-parofc-red/10 to-transparent" : "border-white/10"}`}
                    >
                      <span
                        className={`w-5 shrink-0 text-lg font-black ${rankColors[idx] ?? "text-white/30"}`}
                      >
                        {idx + 1}
                      </span>
                      {scorer.image ? (
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={scorer.image}
                            alt={scorer.name}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                      ) : (
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
                          <span className="text-3xs font-black uppercase text-white/40">
                            {scorer.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black uppercase">
                          {scorer.name}
                        </p>
                        <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                          {scorer.club}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-1 shrink-0">
                        <span
                          className={`text-xl font-black ${idx === 0 ? "text-parofc-red" : "text-white"}`}
                        >
                          {scorer.goals}
                        </span>
                        <span className="text-2xs font-bold uppercase text-white/40">
                          G
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>
      </section>

      {/* ══════ LATEST BLOG ══════ */}
      {topBlogs.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-5">
          <SectionCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-black uppercase">Latest Blog</h2>
              <Link
                href="/blogs"
                className="text-xs font-bold uppercase tracking-wider text-parofc-red hover:underline"
              >
                View All Posts →
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {topBlogs.map((item) => {
                const imgUrl = item.image
                  ? urlFor(item.image).width(600).height(300).url()
                  : null;
                return (
                  <Link
                    key={item._id}
                    href={`/blogs/${item.slug}`}
                    className="group cursor-pointer overflow-hidden rounded-md border border-parofc-red/20 bg-card-dark"
                  >
                    <div className="relative aspect-[2/1] overflow-hidden">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-parofc-red/30 to-near-black" />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                        {formatDate(item.publishedAt)}
                      </p>
                      <h3 className="mt-2 text-lg font-black leading-snug">
                        {item.title}
                      </h3>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-parofc-red">
                        Read More{" "}
                        <HugeiconsIcon
                          icon={ChevronRight}
                          size={14}
                          primaryColor="currentColor"
                          strokeWidth={2}
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        </section>
      )}

      {/* ══════ LATEST NEWS ══════ */}
      {topNews.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-5">
          <SectionCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-black uppercase">In the News</h2>
              <Link
                href="/news"
                className="text-xs font-bold uppercase tracking-wider text-parofc-red hover:underline"
              >
                View All News →
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {topNews.map((item) => {
                const imgUrl = item.image
                  ? urlFor(item.image).width(600).height(300).url()
                  : null;
                return (
                  <Link
                    key={item._id}
                    href={item.externalUrl ?? `/news/${item.slug}`}
                    {...(item.externalUrl
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group cursor-pointer overflow-hidden rounded-md border border-parofc-red/20 bg-card-dark"
                  >
                    <div className="relative aspect-[2/1] overflow-hidden">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-parofc-red/30 to-near-black" />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                        {formatDate(item.publishedAt)}
                      </p>
                      <h3 className="mt-2 text-lg font-black leading-snug">
                        {item.title}
                      </h3>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-parofc-red">
                        Read More{" "}
                        <HugeiconsIcon
                          icon={ChevronRight}
                          size={14}
                          primaryColor="currentColor"
                          strokeWidth={2}
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        </section>
      )}

      {/* ══════ PARO FC TV ══════ */}
      {topVideos.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-5">
          <SectionCard className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase">Paro FC TV</h2>
              <Link
                href="/tv"
                className="rounded-lg border border-parofc-red/30 px-4 py-2 text-2xs font-black uppercase tracking-wider text-parofc-red transition hover:bg-parofc-red/10"
              >
                View All Videos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {topVideos.map((v) => {
                const ytId = getYoutubeIdFromUrl(v.youtubeUrl);
                const thumb = ytId
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                  : null;
                return (
                  <a
                    key={v._id}
                    href={v.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-md bg-gradient-to-br from-parofc-red/30 to-near-black">
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={v.title}
                          fill
                          className="object-cover opacity-70"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur-sm transition group-hover:bg-parofc-red/80">
                          <HugeiconsIcon
                            icon={Play}
                            size={18}
                            primaryColor="currentColor"
                            className="text-white ml-0.5"
                            strokeWidth={2.1}
                          />
                        </div>
                      </div>
                    </div>
                    <h4 className="mt-2 text-xs font-black line-clamp-1">
                      {v.title}
                    </h4>
                  </a>
                );
              })}
            </div>
          </SectionCard>
        </section>
      )}

      {/* ══════ SHOP ══════ */}
      {products.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-5">
          <SectionCard className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase">Official Store</h2>
                <p className="text-2xs font-bold uppercase tracking-wider text-white/40">
                  Paro FC Merchandise
                </p>
              </div>
              <Link
                href="/shop"
                className="rounded-lg border border-parofc-gold/30 px-4 py-2 text-2xs font-black uppercase tracking-wider text-parofc-gold transition hover:bg-parofc-gold/10"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.slice(0, 4).map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} theme="dark" />
              ))}
            </div>
          </SectionCard>
        </section>
      )}

      {/* ══════ PARTNERS ══════ */}
      {mainPartners.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-5 pb-8">
          <SectionCard className="p-6">
            <h2 className="mb-6 text-base font-black uppercase">
              Our Partners
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {sortedMainPartners.map((p) => (
                <a
                  key={p._id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 py-4 md:py-6 transition hover:border-white/20"
                >
                  <div className="relative flex h-24 md:h-32 w-full items-center justify-center">
                    {p.logo ? (
                      <Image
                        src={p.logo}
                        alt={p.name}
                        width={220}
                        height={110}
                        className="relative z-10 h-20 md:h-28 w-auto object-contain"
                      />
                    ) : (
                      <span className="relative z-10 text-2xs font-bold uppercase tracking-widest text-white/30">
                        Logo
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </SectionCard>
        </section>
      )}

      {/* ══════ SUB PARTNERS ══════ */}
      {subPartners.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-8">
          <SectionCard className="p-6">
            <h2 className="mb-6 text-base font-black uppercase">
              Sub Partners
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {sortedSubPartners.map((p) => (
                <a
                  key={p._id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 py-4 md:py-6 transition hover:border-white/20"
                >
                  <div className="relative flex h-24 md:h-32 w-full items-center justify-center">
                    {p.logo ? (
                      <Image
                        src={p.logo}
                        alt={p.name}
                        width={220}
                        height={110}
                        className="relative z-10 h-20 md:h-28 w-auto object-contain"
                      />
                    ) : (
                      <span className="relative z-10 text-2xs font-bold uppercase tracking-widest text-white/30">
                        Logo
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </SectionCard>
        </section>
      )}
    </div>
  );
}
