import { ChatbotScript } from "@/components/ChatbotScript";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { sanityFetch } from "@/sanity/lib/live";
import { SanityLive } from "@/sanity/lib/live-client";
import { PARTNERS_QUERY, NEXT_MATCH_TICKET_QUERY } from "@/sanity/lib/queries";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Script from "next/script";
import "../index.css";

const getCachedPartners = unstable_cache(
  async () => {
    const partnersResult = await sanityFetch({ query: PARTNERS_QUERY }).catch(
      () => ({ data: [] }),
    );
    return (partnersResult.data as unknown[]) || [];
  },
  ["layout-partners"],
  { revalidate: 120 },
);

const getCachedNextMatchTicketUrl = unstable_cache(
  async () => {
    const result = await sanityFetch({ query: NEXT_MATCH_TICKET_QUERY }).catch(
      () => ({ data: null }),
    );
    return (result.data as { ticketUrl?: string } | null)?.ticketUrl || null;
  },
  ["layout-next-match-ticket"],
  { revalidate: 120 },
);

export const metadata: Metadata = {
  metadataBase: new URL("https://parofc.com"),
  title: "Paro FC - Official Website",
  description:
    "Official home of Paro FC: news, fixtures, squad, tickets, and the club shop.",
  icons: {
    icon: "/assets/paro.png",
    apple: "/assets/paro.png",
    shortcut: "/assets/paro.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const partners = await getCachedPartners();
  const nextMatchTicketUrl = await getCachedNextMatchTicketUrl();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-near-black">
        <ConditionalLayout partners={partners as any} nextMatchTicketUrl={nextMatchTicketUrl}>
          {children}
        </ConditionalLayout>
        <SanityLive />
        <ChatbotScript />
        {/* Privacy-friendly analytics by Plausible */}
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init();`}
        </Script>
        <Script
          src="http://localhost:8080/js/pa-19zkOjsnH4gqiklTplcwP.js"
          strategy="afterInteractive"
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
