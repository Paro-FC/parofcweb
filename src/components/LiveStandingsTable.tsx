"use client";

import Image from "next/image";

export interface StandingTeam {
  teamName: string;
  teamLogo?: string | null;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form?: string[] | null;
}

export interface StandingsZones {
  championsLeague?: number;  // top N positions get green bar
  playoff?: number;           // position gets orange bar
  relegation?: number;        // position >= this gets red bar
}

export function sortTeamsByPoints(teams: StandingTeam[]): StandingTeam[] {
  return teams
    .slice()
    .sort(
      (a, b) =>
        Number(b.points) - Number(a.points) ||
        (Number(b.goalsFor) - Number(b.goalsAgainst)) -
          (Number(a.goalsFor) - Number(a.goalsAgainst)),
    )
    .map((t, i) => ({ ...t, position: i + 1 }));
}

function formatGD(gd: number) {
  return gd > 0 ? `+${gd}` : `${gd}`;
}

function gdColor(gd: number) {
  if (gd > 0) return "text-green-400";
  if (gd < 0) return "text-red-400";
  return "text-white/70";
}

const DEFAULT_ZONES: StandingsZones = { championsLeague: 1, playoff: 8, relegation: 9 };

function ZoneBar({ position, zones = DEFAULT_ZONES }: { position: number; zones?: StandingsZones }) {
  if (zones.championsLeague && position <= zones.championsLeague)
    return <div className="absolute left-0 top-0 h-full w-[3px] bg-green-500" />;
  if (zones.playoff && position === zones.playoff)
    return <div className="absolute left-0 top-0 h-full w-[3px] bg-orange-400" />;
  if (zones.relegation && position >= zones.relegation)
    return <div className="absolute left-0 top-0 h-full w-[3px] bg-red-500" />;
  return null;
}

function FormBadge({ v, className }: { v: string; className?: string }) {
  const c = v === "W" ? "bg-green-500" : v === "D" ? "bg-yellow-500" : "bg-red-600";
  return (
    <span className={`grid h-[18px] w-[18px] place-items-center rounded-[4px] text-3xs font-black text-white ${c} ${className ?? ""}`}>
      {v}
    </span>
  );
}

function TeamInitialsLogo({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
      <span className="text-3xs font-black uppercase tracking-wide text-white/40">{initials || "—"}</span>
    </div>
  );
}

const PARO_NAMES = ["paro fc", "paro"];

function isParo(teamName: string) {
  return PARO_NAMES.some((n) => teamName.toLowerCase().includes(n));
}

interface Props {
  teams: StandingTeam[];
  zones?: StandingsZones;
}

const STAT_COLS = [
  { key: "played", label: "P" },
  { key: "won", label: "W" },
  { key: "drawn", label: "D" },
  { key: "lost", label: "L" },
  { key: "goalsFor", label: "GF" },
  { key: "goalsAgainst", label: "GA" },
  { key: "gd", label: "GD" },
  { key: "points", label: "Pts" },
] as const;

export function LiveStandingsTable({ teams, zones }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/10 text-2xs font-bold uppercase tracking-wider text-white/40">
            <th className="w-8 px-2 py-2.5 text-left">Pos</th>
            <th className="px-2 py-2.5 text-left">Club</th>
            {STAT_COLS.map((col) => (
              <th key={col.key} className="px-2 py-2.5 text-center">{col.label}</th>
            ))}
            <th className="px-2 py-2.5 text-center">Form</th>
          </tr>
        </thead>
        <tbody>
          {teams.length === 0 ? (
            <tr>
              <td colSpan={11} className="py-10 text-center text-xs text-white/30">
                No standings data available
              </td>
            </tr>
          ) : (
            teams.map((team) => {
              const gd = Number(team.goalsFor) - Number(team.goalsAgainst);
              const paro = isParo(team.teamName);
              const recentForm = team.form ?? [];
              return (
                <tr
                  key={team.teamName}
                  className={`relative border-b border-white/5 transition ${
                    paro
                      ? "bg-parofc-red/[0.07] hover:bg-parofc-red/[0.12]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <td className="px-2 py-3 font-black relative">
                    <ZoneBar position={team.position} zones={zones} />
                    <span className={paro ? "text-parofc-red" : undefined}>{team.position}</span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {team.teamLogo ? (
                        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                          <Image src={team.teamLogo} alt={team.teamName} width={28} height={28} className="h-full w-full object-contain" />
                        </div>
                      ) : (
                        <TeamInitialsLogo name={team.teamName} />
                      )}
                      <span className={`truncate font-black uppercase ${paro ? "text-parofc-red" : ""}`}>
                        {team.teamName}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center font-bold text-white/70">{team.played}</td>
                  <td className="px-2 py-3 text-center font-bold text-white/70">{team.won}</td>
                  <td className="px-2 py-3 text-center font-bold text-white/70">{team.drawn}</td>
                  <td className="px-2 py-3 text-center font-bold text-white/70">{team.lost}</td>
                  <td className="px-2 py-3 text-center font-bold text-white/70">{team.goalsFor}</td>
                  <td className="px-2 py-3 text-center font-bold text-white/70">{team.goalsAgainst}</td>
                  <td className={`px-2 py-3 text-center font-bold ${gdColor(gd)}`}>{formatGD(gd)}</td>
                  <td className="px-2 py-3 text-center font-black">{team.points}</td>
                  <td className="px-2 py-3">
                    <div className="flex justify-center gap-[3px]">
                      {/* mobile: last 3; desktop: all 5 */}
                      {recentForm.slice(-5).map((f, i) => (
                        <FormBadge
                          key={i}
                          v={f}
                          className={i < recentForm.slice(-5).length - 3 ? "hidden sm:grid" : undefined}
                        />
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
  );
}
