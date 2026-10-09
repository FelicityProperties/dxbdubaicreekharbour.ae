// The enquiry section used on every page: the Neon-backed form with a WhatsApp fallback.
import { EnquiryForm } from "./EnquiryForm";

export function EnquirySection({ project }: { project?: string | undefined }) {
  return <section id="enquire" className={project ? "enquiry-section enquiry-compact" : "enquiry-section section"}>
    <div className={project ? "enquiry-card" : "container"}>
      <div className={project ? "enquiry-content" : "enquiry-card"}>
        <h2>{project ? `Ask about ${project}` : "Tell us what you're looking for"}</h2>
        <p>{project ? "Tell us your budget and timing — we'll send today's availability, the payment schedule and the registered prices in this tower." : "Tell us your budget, bedrooms and timing — we'll send what's available today, with Emaar's current terms and the registered prices to compare."}</p>
        <EnquiryForm project={project} compact={Boolean(project)} />
      </div>
    </div>
  </section>;
}
