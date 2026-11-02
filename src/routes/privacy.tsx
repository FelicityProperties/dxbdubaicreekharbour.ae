import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/projects";
import { PRIVACY } from "@/data/legal";
import { LegalPage } from "@/components/showcase/LegalPage";
import { pageHead } from "@/lib/seo";
import { tFor, useT } from "@/i18n/messages";

export const Route = createFileRoute("/privacy")({
  head: ({ match }) => {
    const locale = match.context.locale;
    const t = tFor(locale);
    return pageHead({ locale, path: "/privacy", title: t("Privacy Notice | {site}", { site: SITE.name }), description: t("What this website collects when you enquire, why, who processes it, how long we keep it and how to ask us to delete it."), largeCard: false });
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const t = useT();
  return <LegalPage doc={PRIVACY} path="/privacy" other={{ to: "/terms", label: t("Read the Terms of Use →") }} />;
}
