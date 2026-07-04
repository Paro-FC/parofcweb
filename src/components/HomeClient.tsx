"use client";

import { Hero } from "@/components/Hero";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import {
  LiveStandingsTable,
  sortTeamsByPoints,
  type StandingTeam,
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

function TeamInitialsLogo({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dim = size === "md" ? "h-9 w-9" : "h-7 w-7";
  return (
    <div className={`grid ${dim} shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10`}>
      <span className="text-3xs font-black uppercase tracking-wide text-white/40">
        {initials || "—"}
      </span>
    </div>
  );
}

const SCORER_RANK_COLORS = ["text-parofc-gold", "text-white/60", "text-amber-600"];

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
  const leaderPts = sortedByPoints[0]?.points || 1;

  const raceToTitle = sortedByPoints.slice(0, 5).map((t, idx) => ({
    pos: idx + 1,
    name: t.teamName,
    pts: t.points,
    gap: t.points - leaderPts,
    logo: t.teamLogo,
    isParo: t.teamName.toLowerCase().includes("paro"),
  }));

  return (
    <div className="min-h-screen bg-near-black text-white">
      {/* ══════ HERO ══════ */}
      <Hero />

      {/* ══════ MATCHDAY BANNER ══════ */}
      {nextMatch && (
        <section className="relative overflow-hidden border-b border-white/5">
          {/* Stadium atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c0404] via-[#0d0808] to-near-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_100%_at_10%_50%,rgba(206,5,5,0.14)_0%,transparent_100%)]" />
          {/* Ghost VS watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="select-none text-[18vw] font-black uppercase leading-none text-white/[0.03]">VS</span>
          </div>

          <div className="relative mx-auto max-w-[1400px] px-5 py-8 lg:py-10">
            {/* Header strip */}
            <div className="mb-8 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-parofc-red/60">Next Match</span>
              <span className="h-px flex-1 bg-parofc-red/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/20">{nextMatch.competition}</span>
            </div>

            {/* Teams vs Countdown grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto_1fr]">

              {/* Home Team */}
              <div className="flex items-center justify-center gap-4 lg:justify-end lg:text-right">
                <div className="order-2 text-center lg:order-1 lg:text-right">
                  <p className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl lg:text-5xl">
                    {nextMatch.homeTeam}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Home</p>
                </div>
                <div className="order-1 shrink-0 overflow-hidden lg:order-2">
                  {nextMatch.homeCrest ? (
                    <Image src={nextMatch.homeCrest} alt={nextMatch.homeTeam} width={72} height={72} className="h-14 w-14 object-contain sm:h-18 sm:w-18" />
                  ) : (
                    <Crest size="lg" />
                  )}
                </div>
              </div>

              {/* Center: details + countdown */}
              <div className="flex flex-col items-center gap-5">
                {/* Date / Time / Venue */}
                <div className="flex items-center gap-5 text-center">
                  <div>
                    <HugeiconsIcon icon={Calendar} size={20} className="mx-auto text-parofc-red/60 mb-1" strokeWidth={1.8} />
                    <p className="text-sm font-black uppercase">
                      {new Date(nextMatch.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-2xs font-bold uppercase tracking-wider text-white/30">
                      {new Date(nextMatch.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div>
                    <HugeiconsIcon icon={Clock} size={20} className="mx-auto text-parofc-red/60 mb-1" strokeWidth={1.8} />
                    <p className="text-sm font-black uppercase">
                      {new Date(nextMatch.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Thimphu" })}
                    </p>
                    <p className="text-2xs font-bold uppercase tracking-wider text-white/30">Kick Off</p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div>
                    <HugeiconsIcon icon={MapPin} size={20} className="mx-auto text-parofc-red/60 mb-1" strokeWidth={1.8} />
                    <p className="text-sm font-black uppercase">{nextMatch.venue}</p>
                    <p className="text-2xs font-bold uppercase tracking-wider text-white/30">Venue</p>
                  </div>
                </div>

                {/* Countdown */}
                <div className="flex items-stretch divide-x divide-white/10 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
                  {[
                    { v: countdown.days, l: "D" },
                    { v: countdown.hrs, l: "H" },
                    { v: countdown.mins, l: "M" },
                    { v: countdown.secs, l: "S" },
                  ].map(({ v, l }) => (
                    <div key={l} className="px-4 py-3 text-center">
                      <div className="text-2xl font-black tabular-nums text-parofc-red">{v}</div>
                      <p className="text-3xs font-bold uppercase tracking-wider text-white/30">{l}</p>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex w-full max-w-xs flex-col gap-2">
                  {nextMatch.ticketUrl && (
                    <a
                      href={nextMatch.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 bg-parofc-red px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-parofc-red/80 active:scale-[0.98]"
                    >
                      Buy Tickets
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={2} />
                    </a>
                  )}
                  {nextMatch.matchUrl && nextMatch.showMatchLink !== false && (
                    <a
                      href={nextMatch.matchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 border border-parofc-gold/30 bg-parofc-gold/8 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-parofc-gold transition hover:bg-parofc-gold hover:text-black active:scale-[0.98]"
                    >
                      Match Details
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={2} />
                    </a>
                  )}
                </div>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-center gap-4 lg:justify-start">
                <div className="shrink-0 overflow-hidden">
                  {nextMatch.awayCrest ? (
                    <Image src={nextMatch.awayCrest} alt={nextMatch.awayTeam} width={72} height={72} className="h-14 w-14 object-contain sm:h-18 sm:w-18" />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-white/8 ring-1 ring-white/10">
                      <span className="text-sm font-black uppercase">{nextMatch.awayTeam.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl lg:text-5xl">
                    {nextMatch.awayTeam}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Away</p>
                </div>
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
                const barPct = Math.max(4, Math.round((t.pts / leaderPts) * 100));
                return (
                  <div key={t.pos} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-black text-white/30">
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
                            className={`text-xs font-black ${t.isParo ? "text-parofc-red" : "text-white"}`}
                          >
                            {t.pts}{" "}
                            <span className="text-2xs font-bold text-white/40">
                              PTS
                            </span>
                          </p>
                        </div>
                        {t.gap < 0 && (
                          <span className="shrink-0 text-2xs font-bold text-white/30">
                            {t.gap}
                          </span>
                        )}
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
                  return (
                    <div
                      key={scorer._id}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${idx === 0 ? "border-parofc-red/30 bg-gradient-to-r from-parofc-red/10 to-transparent" : "border-white/10"}`}
                    >
                      <span
                        className={`w-5 shrink-0 text-xs font-black ${SCORER_RANK_COLORS[idx] ?? "text-white/30"}`}
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
                        <TeamInitialsLogo name={scorer.name} size="md" />
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
                          className={`text-sm font-black ${idx === 0 ? "text-parofc-red" : "text-white"}`}
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
          <div className="rounded-lg border border-parofc-red/20 bg-card-dark overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-parofc-red/20 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-[3px] bg-parofc-gold" />
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Official Store</h2>
                  <p className="text-2xs font-bold uppercase tracking-wider text-white/30">Paro FC Merchandise</p>
                </div>
              </div>
              <Link
                href="/shop"
                className="flex w-fit items-center gap-2 bg-parofc-gold px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-dark-charcoal transition hover:bg-parofc-gold/80 active:scale-[0.98]"
              >
                View All
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} strokeWidth={2.5} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4 md:gap-5">
              {products.slice(0, 4).map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} theme="dark" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ PARTNERS ══════ */}
      {mainPartners.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-5 pb-8">
          <SectionCard className="p-6">
            <h2 className="mb-6 text-base font-black uppercase">Our Partners</h2>
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
            <h2 className="mb-6 text-base font-black uppercase">Sub Partners</h2>
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
