"use client";

import { usePathname } from "next/navigation";
import { LayoutWrapper } from "./LayoutWrapper";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  partners?: any[];
  nextMatchTicketUrl?: string | null;
}

export function ConditionalLayout({
  children,
  partners = [],
  nextMatchTicketUrl,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <LayoutWrapper partners={partners} nextMatchTicketUrl={nextMatchTicketUrl}>{children}</LayoutWrapper>
  );
}
