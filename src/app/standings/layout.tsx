import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "League Standings | Paro FC",
  description:
    "Live league table standings for Paro FC and all Bhutan Football Federation competitions.",
  openGraph: {
    title: "League Standings | Paro FC",
    description:
      "Live league table standings for Paro FC and all Bhutan Football Federation competitions.",
    url: "/standings",
    siteName: "Paro FC",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "League Standings | Paro FC",
    description:
      "Live league table standings for Paro FC and all Bhutan Football Federation competitions.",
  },
};

export default function StandingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
