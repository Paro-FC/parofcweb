import { sanityFetch } from "@/sanity/lib/live";
import {
  NEWS_QUERY,
  BLOG_QUERY,
  MATCHES_QUERY,
  MAIN_PARTNERS_QUERY,
  SUB_PARTNERS_QUERY,
  TROPHIES_QUERY,
  YOUTUBE_VIDEOS_QUERY,
  STANDINGS_HOME_LATEST_QUERY,
  TOP_SCORER_QUERY,
  PRODUCTS_QUERY,
} from "@/sanity/lib/queries";
import { HomeClient } from "@/components/HomeClient";

export default async function Home() {
  const [
    newsResult,
    blogResult,
    matchesResult,
    mainPartnersResult,
    subPartnersResult,
    trophiesResult,
    youtubeVideosResult,
    standingsResult,
    topScorerResult,
    productsResult,
  ] = await Promise.all([
    sanityFetch({ query: NEWS_QUERY }).catch(() => ({ data: [] })),
    sanityFetch({ query: BLOG_QUERY }).catch(() => ({ data: [] })),
    sanityFetch({ query: MATCHES_QUERY }).catch(() => ({ data: [] })),
    sanityFetch({ query: MAIN_PARTNERS_QUERY }).catch(() => ({ data: [] })),
    sanityFetch({ query: SUB_PARTNERS_QUERY }).catch(() => ({ data: [] })),
    sanityFetch({ query: TROPHIES_QUERY }).catch(() => ({ data: [] })),
    sanityFetch({ query: YOUTUBE_VIDEOS_QUERY }).catch(() => ({ data: [] })),
    sanityFetch({ query: STANDINGS_HOME_LATEST_QUERY }).catch(() => ({
      data: null,
    })),
    sanityFetch({ query: TOP_SCORER_QUERY }).catch(() => ({ data: null })),
    sanityFetch({ query: PRODUCTS_QUERY }).catch(() => ({ data: [] })),
  ]);

  return (
    <HomeClient
      news={(newsResult.data as any) ?? []}
      blogs={(blogResult.data as any) ?? []}
      matches={(matchesResult.data as any) ?? []}
      mainPartners={(mainPartnersResult.data as any) ?? []}
      subPartners={(subPartnersResult.data as any) ?? []}
      trophies={(trophiesResult.data as any) ?? []}
      youtubeVideos={(youtubeVideosResult.data as any) ?? []}
      standings={(standingsResult.data as any) ?? null}
      topScorers={(topScorerResult.data as any) ?? []}
      topScorer={(topScorerResult.data as any)?.[0] ?? null}
      products={(productsResult.data as any) ?? []}
    />
  );
}
