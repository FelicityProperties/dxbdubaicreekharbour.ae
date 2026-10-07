import Link from "next/link";
import { EnquiryForm } from "@/components/enquiry-form";
import { Skyline } from "@/components/skyline";
import { BUYING_STEPS, DISTRICT, INDEPENDENCE, SITE } from "@/lib/site";

const FAQ = [
  {
    q: "Is this the official Dubai Creek Harbour website?",
    a: INDEPENDENCE,
  },
  {
    q: "Can foreigners buy in Dubai Creek Harbour?",
    a: "Yes. Dubai Creek Harbour is in one of Dubai's freehold areas, where buyers of any nationality can own property outright.",
  },
  {
    q: "Who builds there?",
    a: "Emaar is the master developer and most towers in the district are its own projects. Resale homes are sold by their owners, usually through a broker.",
  },
  {
    q: "What does a flat there cost?",
    a: "It depends heavily on the building, the view, the floor and whether it's ready or off-plan, so we don't publish a single figure that would be out of date by next month. Send an enquiry and we'll come back with recent registered sales for the buildings and sizes you're considering.",
  },
  {
    q: "Does enquiring commit me to anything?",
    a: "No. Enquiring is free. We'll call to understand what you're after and send you options; whether you go ahead is entirely up to you.",
  },
];

function Section({
  id,
  eyebrow,
  title,
  children,
  tone = "light",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  tone?: "light" | "white";
}) {
  return (
    <section id={id} className={tone === "white" ? "bg-white" : undefined}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-deep">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: SITE.name, url: SITE.url, inLanguage: "en" },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <Skyline className="absolute inset-0 h-full w-full opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">Dubai Creek Harbour · Buyer&apos;s guide</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] sm:text-6xl">
            Buying on the creek? <em className="text-accent">Know the district</em> before you choose the tower.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            An independent guide to living and investing in Dubai Creek Harbour — and a quick way to hear about homes that fit
            your budget.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#enquire" className="rounded-md bg-accent px-6 py-3 font-medium text-ink hover:brightness-105">
              Tell us what you&apos;re looking for
            </Link>
            <Link href="#district" className="rounded-md border border-white/30 px-6 py-3 font-medium hover:bg-white/10">
              Read the guide
            </Link>
          </div>
        </div>
      </section>

      <Section id="district" eyebrow="The district" title="A new waterfront city between Downtown and the airport">
        <div className="grid gap-8 md:grid-cols-2">
          <p className="text-lg leading-relaxed text-ink">{DISTRICT.overview}</p>
          <div className="rounded-lg border border-rule bg-white p-6">
            <p className="text-sm font-medium text-ink">Good to know</p>
            <p className="mt-2 leading-relaxed text-ink-muted">{DISTRICT.officialArea}</p>
          </div>
        </div>
      </Section>

      <Section id="living" eyebrow="Living here" title="Beach, marina and a flamingo sanctuary across the water" tone="white">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DISTRICT.living.map((l) => (
            <div key={l.title} className="rounded-lg border border-rule bg-bg p-6">
              <h3 className="font-display text-xl text-ink">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{l.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Getting around" title="Close to everything you'll drive to">
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <ul className="divide-y divide-rule rounded-lg border border-rule bg-white">
            {DISTRICT.gettingAround.map((g) => (
              <li key={g.to} className="flex items-baseline justify-between gap-4 px-6 py-4">
                <span className="text-ink">{g.to}</span>
                <span className="text-sm text-ink-muted">{g.time} by car</span>
              </li>
            ))}
          </ul>
          <div>
            <p className="leading-relaxed text-ink">{DISTRICT.roads}</p>
            <h3 className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-accent-deep">Still being built</h3>
            <ul className="mt-4 grid gap-4">
              {DISTRICT.pipeline.map((p) => (
                <li key={p.title}>
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section eyebrow="Who it suits" title="Two kinds of buyer do well here" tone="white">
        <div className="grid gap-5 md:grid-cols-2">
          {DISTRICT.suits.map((s) => (
            <div key={s.who} className="rounded-lg border border-rule bg-bg p-6 sm:p-8">
              <h3 className="font-display text-2xl text-ink">{s.who}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <p className="text-sm font-medium text-ink">Buildings buyers ask about most</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {DISTRICT.landmarks.map((b) => (
              <li key={b} className="rounded-full border border-rule bg-white px-4 py-1.5 text-sm text-ink">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="buying" eyebrow="Before you offer" title="Four things to settle before you buy">
        <ol className="grid gap-5 md:grid-cols-2">
          {BUYING_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-5 rounded-lg border border-rule bg-white p-6">
              <span className="font-display text-4xl leading-none text-accent">{i + 1}</span>
              <div>
                <h3 className="font-medium text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <section id="enquire" className="bg-water">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.3fr]">
          <div className="text-white">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Looking to buy?</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Tell us what you want. We&apos;ll come back with homes that fit.
            </h2>
            <p className="mt-5 leading-relaxed text-white/75">
              Ready or off-plan, to live in or to rent out. Give us a budget and a timeframe and we&apos;ll call you with
              options and the recent sale prices in those buildings, so you know what a fair offer looks like.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-white/75">
              <li>— Free, and no obligation</li>
              <li>— We call back, usually the same day</li>
              <li>— Your details are used only for your enquiry</li>
            </ul>
          </div>
          <EnquiryForm />
        </div>
      </section>

      <Section id="faq" eyebrow="Questions" title="What buyers ask first" tone="white">
        <div className="divide-y divide-rule rounded-lg border border-rule">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                {f.q}
                <span className="text-accent transition group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  );
}
