/**
 * "Why Dubai Creek Harbour" — each entry rests on a sentence Emaar published
 * (sourceUrl) or on a figure in the DLD snapshot (src/data/transactions.json).
 * The exact source quotes are kept in design/benefits-sources.json. Never add a
 * reason that cannot be traced to one of those two.
 */
export type Benefit = { title: string; body: string; sourceUrl: string; kind: "emaar" | "dld-snapshot" };

export const BENEFITS: Benefit[] = [
  {
    "title": "Freehold ownership, open to foreign buyers",
    "body": "Emaar's guide to buying freehold property says a freehold home in Dubai is one you can fully own, outright and indefinitely, with full ownership of both property and land, the ability to resell, lease or gift it, and inheritance rights for legal heirs. The same guide lists Dubai Creek Harbour among the freehold areas open to buyers, describing it as waterfront living with vibrant dining, nightlife and luxury apartments.",
    "sourceUrl": "https://www.emaar.com/en/blog/complete-guide-to-buying-freehold-property-in-dubai",
    "kind": "emaar"
  },
  {
    "title": "A route to the UAE Golden Residency (Golden Visa)",
    "body": "Emaar's investor-visa guide describes the UAE Golden Residency as a long-term residency programme and says that, for real estate investors, the current federal framework provides it to those who own one or more qualifying properties valued at a minimum of AED 2 million. Emaar also notes the Dubai Land Department's separate Taskeen investor-residence route for property owners, and advises verifying current requirements with the UAE authorities before buying or applying.",
    "sourceUrl": "https://www.emaar.com/en/blog/dubai-investor-visa-guide-requirements-eligibility-and-benefits-2026",
    "kind": "emaar"
  },
  {
    "title": "Developer payment plans, reserved with a booking fee",
    "body": "On Emaar's online booking page for a Creek Haven apartment, checked on 9 October 2026, the reservation booking fee shown was AED 37,000, and Emaar states that your specialist confirms the payment plan before the balance falls due. Emaar's investor guide adds that phased payment plans on off-plan homes can spread payments across the development period; each project page here shows the dated schedule Emaar publishes.",
    "sourceUrl": "https://www.emaar.com/en/properties/creek-haven-at-dubai-creek-harbour",
    "kind": "emaar"
  },
  {
    "title": "Escrow protection on off-plan payments",
    "body": "Emaar says that for off-plan purchases, funds are held in escrow accounts managed by the Dubai Land Department, a mechanism that protects buyers by ensuring developers meet their contractual obligations before accessing the money. Emaar's own finance fact sheet likewise directs buyers to remit instalments directly to their project's assigned escrow account.",
    "sourceUrl": "https://www.emaar.com/en/blog/comprehensive-guide-to-freehold-property-ownership-in-dubai",
    "kind": "emaar"
  },
  {
    "title": "Minutes from the airport and Downtown, with a metro station planned for 2029",
    "body": "Emaar puts Downtown Dubai and Burj Khalifa at a 15-minute drive and Dubai International Airport at a 10-minute drive from Dubai Creek Harbour. Emaar also says the upcoming Blue Line Metro Station (2029) will provide seamless, eco-friendly transport access across Dubai.",
    "sourceUrl": "https://www.emaar.com/en/blog/dubai-creek-harbour-guide",
    "kind": "emaar"
  },
  {
    "title": "Beach, parks, marina and a wildlife sanctuary on the doorstep",
    "body": "Emaar describes a community with the Ras Al Khor Wildlife Sanctuary at its heart, Central Park as a green retreat with an amphitheatre, dog park and play areas, and Creek Marina and the Harbour Promenade for waterfront strolls, dining and views. Emaar also points to Creek Beach, Creekside Park and the Creek Play promenade.",
    "sourceUrl": "https://www.emaar.com/en/blog/dubai-creek-harbour-guide",
    "kind": "emaar"
  },
  {
    "title": "A registered rental and resale market",
    "body": "Dubai Land Department records for the 12 months to 30 September 2026 show 3,963 new tenancy contracts and 2,465 renewals registered for apartments in Dubai Creek Harbour, with a median rent of AED 96,000 across 2,611 one-bedroom contracts. The same records show 987 ready-apartment sales registered in that window; these are registered contracts and sales, not valuations or forecasts.",
    "sourceUrl": "dld-snapshot",
    "kind": "dld-snapshot"
  },
  {
    "title": "No annual property tax",
    "body": "Emaar's guide to buying freehold property says Dubai has no annual property tax, and that investors from Europe, India, China, Russia and the GCC have taken advantage of Dubai's zero property tax. Emaar still reminds buyers to budget beyond the purchase price for Dubai Land Department fees (4%), trustee fees and service charges.",
    "sourceUrl": "https://www.emaar.com/en/blog/complete-guide-to-buying-freehold-property-in-dubai",
    "kind": "emaar"
  }
];
