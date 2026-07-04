import {
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  Ticket01Icon,
  TiktokIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";

interface Partner {
  _id: string;
  name: string;
  logo: string;
  url: string;
  category?: string;
}

interface FooterProps {
  partners?: Partner[];
  nextMatchTicketUrl?: string | null;
}

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/fixtures-results", label: "Fixtures" },
  { href: "/about", label: "About Paro FC" },
  { href: "/players", label: "Squads" },
  { href: "/standings", label: "Standings" },
  { href: "/news", label: "In the News" },
  { href: "/blogs", label: "Blogs" },
  { href: "/photos", label: "Photos" },
];

const ticketLinks = [{ href: "/shop", label: "Shop" }];

const academyLinks = [
  { href: "/academy", label: "Youth Teams" },
  { href: "/academy", label: "Grassroots" },
];

const socialLinks = [
  {
    icon: Facebook01Icon,
    label: "Facebook",
    href: "https://www.facebook.com/parofc",
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    href: "https://www.instagram.com/parofc",
  },
  {
    icon: YoutubeIcon,
    label: "YouTube",
    href: "https://www.youtube.com/parofc",
  },
  { icon: TiktokIcon, label: "TikTok", href: "https://www.tiktok.com/parofc" },
  { icon: NewTwitterIcon, label: "X (Twitter)", href: "https://x.com/Paro_FC" },
  {
    icon: Linkedin01Icon,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/karma-jigme-48958312a/",
  },
];

export function Footer({ nextMatchTicketUrl }: FooterProps) {
  return (
    <footer className="border-t border-parofc-red/15 bg-near-black">
      {/* Footer columns */}
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/paro.png"
              alt="Paro FC"
              width={48}
              height={48}
              className="object-contain"
            />
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-parofc-red">
            PARO FC
            <br />
            Live Your Dreams
          </p>
          <div className="mt-4 flex gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-parofc-red/40 hover:text-parofc-red"
              >
                <HugeiconsIcon icon={s.icon} size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <b className="text-2xs font-black uppercase tracking-wider text-parofc-red">
            Quick Links
          </b>
          <div className="mt-3 space-y-2 text-xs text-white/40">
            {quickLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="block transition hover:text-parofc-red"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tickets & Shop */}
        <div>
          <b className="text-2xs font-black uppercase tracking-wider text-parofc-red">
            Shop
          </b>
          <div className="mt-3 space-y-2 text-xs text-white/40">
            {ticketLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="block transition hover:text-parofc-red"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Academy */}
        <div>
          <b className="text-2xs font-black uppercase tracking-wider text-parofc-red">
            Academy
          </b>
          <div className="mt-3 space-y-2 text-xs text-white/40">
            {academyLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="block transition hover:text-parofc-red"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <b className="text-2xs font-black uppercase tracking-wider text-parofc-red">
            Contact Us
          </b>
          <div className="mt-3 space-y-2 text-xs text-white/40">
            <p>info@parofc.bt</p>
            <p>+975-16180205</p>
            <p>
              Woochu Sports Arena,
              <br />
              Paro, Bhutan
            </p>
          </div>
        </div>

        {/* Buy Tickets */}
        <div>
          <b className="text-2xs font-black uppercase tracking-wider text-parofc-red">
            Tickets
          </b>
          <p className="mt-2 text-2xs text-white/30">
            Get your match tickets and cheer for Paro FC live at the stadium.
          </p>
          <Link
            href={nextMatchTicketUrl || "/fixtures-results"}
            target={nextMatchTicketUrl ? "_blank" : undefined}
            rel={nextMatchTicketUrl ? "noopener noreferrer" : undefined}
            className="mt-4 flex items-center justify-center gap-2 w-full rounded-lg bg-parofc-red py-2.5 text-2xs font-black uppercase tracking-wider text-white transition hover:bg-parofc-red/85 active:scale-[0.98]"
          >
            <HugeiconsIcon icon={Ticket01Icon} size={13} />
            Buy Tickets
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-4 text-2xs text-white/25">
          <span>
            © {new Date().getFullYear()} Paro Football Club. All Rights
            Reserved.
          </span>
          <div className="flex gap-5"></div>
          <span className="text-sm italic text-parofc-red/40">
            pride of paro
          </span>
        </div>
      </div>
    </footer>
  );
}
