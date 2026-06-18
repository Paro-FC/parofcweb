"use client";

// import { TopNav } from "./TopNav";
import { MainNav } from "./MainNav";
import { Footer } from "./Footer";
import { SideMenu } from "./SideMenu";
import { CartSlider } from "./CartSlider";
import { SideMenuProvider, useSideMenu } from "@/contexts/SideMenuContext";
import { CartProvider } from "@/contexts/CartContext";

interface LayoutWrapperProps {
  children: React.ReactNode;
  partners?: any[];
  nextMatchTicketUrl?: string | null;
}

function LayoutContent({
  children,
  partners = [],
  nextMatchTicketUrl,
}: LayoutWrapperProps) {
  const { isOpen, closeMenu } = useSideMenu();

  return (
    <>
      <MainNav />
      {children}
      <Footer partners={partners} nextMatchTicketUrl={nextMatchTicketUrl} />
      <SideMenu isOpen={isOpen} onClose={closeMenu} />
      <CartSlider />
    </>
  );
}

export function LayoutWrapper({
  children,
  partners = [],
  nextMatchTicketUrl,
}: LayoutWrapperProps) {
  return (
    <CartProvider>
      <SideMenuProvider>
        <LayoutContent partners={partners} nextMatchTicketUrl={nextMatchTicketUrl}>
          {children}
        </LayoutContent>
      </SideMenuProvider>
    </CartProvider>
  );
}
