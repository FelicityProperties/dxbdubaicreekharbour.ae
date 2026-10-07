// Vercel-only override of Lovable's EnquirySection: same wrapper and heading,
// with the Neon-backed form in place of the WhatsApp-only card. Lovable keeps
// its own version; the copy into the GitHub repo swaps this one in.
import { EnquiryForm } from "./EnquiryForm";

export function EnquirySection({ project }: { project?: string | undefined }) {
  return <section id="enquire" className={project ? "enquiry-section enquiry-compact" : "enquiry-section section"}>
    <div className={project ? "enquiry-card" : "container"}>
      <div className={project ? "enquiry-content" : "enquiry-card"}>
        <h2>Tell us what you're looking for</h2>
        <p>Tell us your budget, bedrooms and timing — we'll send what's available today.</p>
        <EnquiryForm project={project} compact={Boolean(project)} />
      </div>
    </div>
  </section>;
}
