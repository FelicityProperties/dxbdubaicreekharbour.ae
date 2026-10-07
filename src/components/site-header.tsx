import Link from "next/link";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/#district", label: "The district" },
  { href: "/#living", label: "Living here" },
  { href: "/#buying", label: "Buying" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="leading-tight">
          <span className="block font-display text-xl tracking-wide">{SITE.name}</span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-white/60">Independent buyer&apos;s guide</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/#enquire" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-ink hover:brightness-105">
          Find a home
        </Link>
      </div>
    </header>
  );
}
