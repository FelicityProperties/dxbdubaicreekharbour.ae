import Link from "next/link";
import { INDEPENDENCE, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white/75">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="font-display text-2xl text-white">{SITE.name}</p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed">{INDEPENDENCE}</p>
        </div>
        <nav className="grid content-start gap-2 text-sm" aria-label="Footer">
          <Link className="hover:text-white" href="/#enquire">
            Send an enquiry
          </Link>
          <Link className="hover:text-white" href="/#faq">
            Questions
          </Link>
          <Link className="hover:text-white" href="/privacy">
            Privacy notice
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/50 sm:px-6">
          © {new Date().getFullYear()} {SITE.name}. Information on this site is general guidance, not an offer or advice;
          check details before you rely on them.
        </p>
      </div>
    </footer>
  );
}
