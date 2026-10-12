import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/projects";
import { TERMS } from "@/data/legal";
import { LegalPage } from "@/components/showcase/LegalPage";
import { sharingMeta } from "@/components/showcase/shared";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms of Use | DXB Creek Harbour" }, { name: "description", content: "The terms on which this independent Dubai Creek Harbour property showcase is provided: what the figures are, what they are not, and how to contact us." }, { property: "og:title", content: "Terms of Use | DXB Creek Harbour" }, { property: "og:description", content: "The terms on which this independent Dubai Creek Harbour property showcase is provided: what the figures are, what they are not, and how to contact us." }, { property: "og:type", content: "website" }, ...sharingMeta(`${SITE.url}/terms`)],
    links: [{ rel: "canonical", href: `${SITE.url}/terms` }],
  }),
  component: () => <LegalPage doc={TERMS} other={{ to: "/privacy", label: "Read the Privacy Notice →" }} />,
});
