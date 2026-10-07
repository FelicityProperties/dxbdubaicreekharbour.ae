import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="font-display text-4xl text-ink">Privacy notice</h1>
      <div className="mt-8 grid gap-6 leading-relaxed text-ink-muted">
        <section>
          <h2 className="font-medium text-ink">What we collect</h2>
          <p className="mt-2">
            When you send an enquiry on {SITE.name} we keep what you type into the form: your name, phone number, email if
            you give one, what you&apos;re looking for, and any message. We don&apos;t use advertising trackers.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-ink">Why</h2>
          <p className="mt-2">
            Only to answer your enquiry — to call, WhatsApp or email you about homes in Dubai Creek Harbour that match what
            you asked for. We don&apos;t sell your details or add you to unrelated mailing lists.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-ink">How long</h2>
          <p className="mt-2">
            We keep enquiries for as long as we&apos;re helping you, and delete them on request. Ask us to stop contacting you
            at any time and we will.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-ink">Your rights</h2>
          <p className="mt-2">
            You can ask to see, correct or delete what we hold about you. Reply to any message we send you, or send a new
            enquiry saying so, and we&apos;ll act on it.
          </p>
        </section>
      </div>
    </main>
  );
}
