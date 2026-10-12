import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/projects";
import { PRIVACY } from "@/data/legal";
import { LegalPage } from "@/components/showcase/LegalPage";
import { sharingMeta } from "@/components/showcase/shared";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Notice | DXB Creek Harbour" }, { name: "description", content: "What this website collects when you enquire, why, who processes it, how long we keep it and how to ask us to delete it." }, { property: "og:title", content: "Privacy Notice | DXB Creek Harbour" }, { property: "og:description", content: "What this website collects when you enquire, why, who processes it, how long we keep it and how to ask us to delete it." }, { property: "og:type", content: "website" }, ...sharingMeta(`${SITE.url}/privacy`)],
    links: [{ rel: "canonical", href: `${SITE.url}/privacy` }],
  }),
  component: () => <LegalPage doc={PRIVACY} other={{ to: "/terms", label: "Read the Terms of Use →" }} />,
});
