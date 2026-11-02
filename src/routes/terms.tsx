import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/projects";
import { TERMS } from "@/data/legal";
import { LegalPage } from "@/components/showcase/LegalPage";
import { pageHead } from "@/lib/seo";
import { tFor, useT } from "@/i18n/messages";

export const Route = createFileRoute("/terms")({
  head: ({ match }) => {
    const locale = match.context.locale;
    const t = tFor(locale);
    return pageHead({ locale, path: "/terms", title: t("Terms of Use | {site}", { site: SITE.name }), description: t("The terms on which this independent Dubai Creek Harbour property showcase is provided: what the figures are, what they are not, and how to contact us."), largeCard: false });
  },
  component: TermsPage,
});

function TermsPage() {
  const t = useT();
  return <LegalPage doc={TERMS} path="/terms" other={{ to: "/privacy", label: t("Read the Privacy Notice →") }} />;
}
