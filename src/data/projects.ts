// Generated on 9 October 2026 by scratchpad/enhance/gen/build.py — do not hand-edit figures.
// Every price, size, unit count and date comes from Emaar's own pages (emaarUrl) checked on 9 October 2026;
// construction status comes from PropertyIndex (Dubai Land Department data, DLD registrations loaded through September 2026).
// Images are Emaar's official renders and photos, self-hosted under /public/img.

export const SITE = {
  name: "DXB Creek Harbour",
  url: "https://dxbdubaicreekharbour.ae",
  whatsapp: "971563520611",
  whatsappDisplay: "+971 56 352 0611",
  email: "mouhannadnwilati@gmail.com",
  dldPermit: "", // shown in the footer only once filled in
  pricesCheckedOn: "9 October 2026",
  constructionSource: "PropertyIndex — DLD registrations loaded through September 2026",
};

export type Status = "Now selling" | "Ready" | "Resale";
export type Construction = "completed" | "under_construction" | null;
export type PlanStep = { label: string; percent: number };
export type ScheduleRow = { label: string; percent: number; date: string };
export type ProjectImage = { base: string; caption: string; w: number; h: number; widths: number[] };
export type SourcedText = { text: string; note: string; source: string };
export type PaymentPlan = { steps: PlanStep[]; schedule: ScheduleRow[]; note: string; source: string };

export type Project = {
  slug: string;
  name: string;
  brand: string | null;
  status: Status;
  statusNote: string;
  construction: Construction;
  isNewLaunch: boolean;
  district: string | null;
  unitTypes: string[];
  bedrooms: string;
  propertyTypes: string | null;
  startingPrice: string | null;
  startingPriceAed: number | null;
  startingPriceNote: string | null;
  pricesFrom: string | null;
  pricesFromAed: number | null;
  unitsListed: number | null;
  pricesFromNote: string | null;
  sizes: string | null;
  sizesNote: string | null;
  handover: SourcedText | null;
  paymentPlan: PaymentPlan | null;
  overview: string;
  highlights: string[];
  amenities: string[];
  nearby: string[] | null;
  lat: number | null;
  lng: number | null;
  brochureUrl: string | null;
  floorPlanUrl: string | null;
  emaarUrl: string;
  pixUrl: string | null;
  images: ProjectImage[];
  ogImage: string | null;
};

/** srcset helper: every image has 480/960/1600 WebP variants (fewer when the original is smaller). */
export const imageSrc = (img: ProjectImage, width = 960) => `${img.base}-${img.widths.includes(width) ? width : img.widths[img.widths.length - 1]}.webp`;
export const imageSrcSet = (img: ProjectImage) => img.widths.map((w) => `${img.base}-${w}.webp ${w}w`).join(", ");

export const PROJECTS: Project[] = [
  {
    "slug": "valia",
    "name": "Valia",
    "brand": null,
    "status": "Now selling",
    "statusNote": "New launch — Emaar is registering interest",
    "construction": null,
    "isNewLaunch": true,
    "district": null,
    "unitTypes": [
      "1, 2, 3 and 4-bedroom apartments"
    ],
    "bedrooms": "1–4",
    "propertyTypes": null,
    "startingPrice": "AED 1.96M",
    "startingPriceAed": 1960000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.96 Mn), checked 9 October 2026",
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "A high-rise of one- to four-bedroom apartments rising from a mixed-use podium, set directly across from Dubai Creek Harbour's retail and entertainment hub, with the canal and the upcoming Blue Line metro station on the other side. A dedicated amenities floor is built around swimming, play, fitness and gathering.",
    "highlights": [
      "One- to four-bedroom apartments on a mixed-use podium",
      "Opposite the district's retail and entertainment hub, by the canal",
      "Dedicated amenities floor with pools, padel court and yoga deck",
      "Emaar's new launch: register your interest for unit releases"
    ],
    "amenities": [
      "Yoga Deck",
      "BBQ Area",
      "Private Cabana",
      "Outdoor Fitness Area",
      "Padel Court",
      "Splash Pad",
      "Outdoor Play Zones",
      "Adult Swimming Pool",
      "Kids' Swimming Pool",
      "Communal Lawn"
    ],
    "nearby": [
      "Creek Marina",
      "Creek Beach",
      "The Viewing Point",
      "Harbour Promenade",
      "Central Park",
      "Dubai Square Mall",
      "Emaar Properties (Iconic) Metro Station",
      "Ras Al Khor Wildlife Sanctuary"
    ],
    "lat": 25.1942778,
    "lng": 55.352,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/VALIA_DUBAI_CREEK_HARBOUR_BROCHURE_d348255309_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/valia-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/valia-at-dubai-creek-harbour",
    "pixUrl": null,
    "images": [
      {
        "base": "/img/valia/1",
        "caption": "Valia — the tower at dusk with the Downtown skyline across the Creek, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valia/2",
        "caption": "Valia — amenity-deck pool with cabanas, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valia/3",
        "caption": "Valia — landscaped lawn for yoga and outdoor fitness, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valia/4",
        "caption": "Valia — podium gardens and children's play area, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valia/5",
        "caption": "Valia — living and dining room, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valia/6",
        "caption": "Valia — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valia/7",
        "caption": "Valia — bedroom with skyline views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/valia/og.jpg"
  },
  {
    "slug": "creek-haven",
    "name": "Creek Haven",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 18 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1, 2 and 3 Bedroom Apartment"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.86M",
    "startingPriceAed": 1860000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.86 Mn), checked 9 October 2026",
    "pricesFrom": "AED 2,722,888",
    "pricesFromAed": 2722888,
    "unitsListed": 18,
    "pricesFromNote": "Cheapest of the 18 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,192 – 1,871 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": {
      "text": "2030-03-31",
      "note": "'100% construction and handover' milestone on Emaar's booking page for unit DC Creek Haven A-P1-P101, checked 7 October 2026",
      "source": "https://www.emaar.com/en/properties/creek-haven-at-dubai-creek-harbour"
    },
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "During construction",
          "percent": 60
        },
        {
          "label": "On handover",
          "percent": 20
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 10,
          "date": "2026-10-07"
        },
        {
          "label": "2nd Installment",
          "percent": 10,
          "date": "2026-11-18"
        },
        {
          "label": "3rd Installment",
          "percent": 10,
          "date": "2027-04-18"
        },
        {
          "label": "4th Installment",
          "percent": 10,
          "date": "2027-08-18"
        },
        {
          "label": "5th Installment",
          "percent": 10,
          "date": "2027-12-18"
        },
        {
          "label": "6th Installment",
          "percent": 10,
          "date": "2028-04-18"
        },
        {
          "label": "60% Construction",
          "percent": 10,
          "date": "2028-07-20"
        },
        {
          "label": "80% Construction",
          "percent": 10,
          "date": "2029-01-02"
        },
        {
          "label": "100% Construction and Handover",
          "percent": 20,
          "date": "2030-03-31"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Creek Haven A-P1-P101, checked 7 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/creek-haven-at-dubai-creek-harbour"
    },
    "overview": "Two residential towers on the water with one-, two- and three-bedroom apartments. Homes look over the Creek, the parks and the skyline, in a walkable waterfront neighbourhood of promenades, landscaped gardens and retail streets.",
    "highlights": [
      "Two towers with Creek, park and skyline views",
      "Infinity pool, kids' pool and BBQ terraces",
      "Community park, sports park and promenade retail",
      "Schools planned within the neighbourhood"
    ],
    "amenities": [
      "Infinity Pool",
      "Kids Pool",
      "BBQ & Picnic Areas",
      "Gym & Outdoor Fitness",
      "Playground",
      "Community Park",
      "Sports Park",
      "Neighbourhood Plaza",
      "Schools",
      "Promenade retail"
    ],
    "nearby": null,
    "lat": 25.2038875,
    "lng": 55.3587656,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/428929_brochure_File_f91b9a4a8b_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/creek-haven-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-haven-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-haven",
    "images": [
      {
        "base": "/img/creek-haven/1",
        "caption": "Creek Haven — the two towers at dusk with the Downtown skyline, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-haven/2",
        "caption": "Creek Haven — balcony view over the Creek towards Downtown Dubai, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-haven/3",
        "caption": "Creek Haven — pool deck lounge at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-haven/4",
        "caption": "Creek Haven — kids' pool and splash pad, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-haven/5",
        "caption": "Creek Haven — living room with Creek views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-haven/6",
        "caption": "Creek Haven — bedroom opening onto a balcony, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-haven/7",
        "caption": "Creek Haven — residents' lobby lounge, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-haven/og.jpg"
  },
  {
    "slug": "creek-bay",
    "name": "Creek Bay",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 18 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1, 2 and 3 Bedroom Apartment"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.8M",
    "startingPriceAed": 1800000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.8 Mn), checked 9 October 2026",
    "pricesFrom": "AED 1,797,888",
    "pricesFromAed": 1797888,
    "unitsListed": 18,
    "pricesFromNote": "Cheapest of the 18 units Emaar listed on its website on 9 October 2026",
    "sizes": "737 – 2,164 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": {
      "text": "2030-04-30",
      "note": "'100% construction and handover' milestone on Emaar's booking page for unit DC Creek Bay B-1-108, checked 7 October 2026",
      "source": "https://www.emaar.com/en/properties/creek-bay-at-dubai-creek-harbour"
    },
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "During construction",
          "percent": 60
        },
        {
          "label": "On handover",
          "percent": 20
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 10,
          "date": "2026-10-07"
        },
        {
          "label": "2nd Installment",
          "percent": 10,
          "date": "2026-11-18"
        },
        {
          "label": "3rd Installment",
          "percent": 10,
          "date": "2027-03-18"
        },
        {
          "label": "4th Installment",
          "percent": 10,
          "date": "2027-07-18"
        },
        {
          "label": "5th Installment",
          "percent": 10,
          "date": "2027-11-18"
        },
        {
          "label": "6th Installment",
          "percent": 10,
          "date": "2028-03-18"
        },
        {
          "label": "60% Construction",
          "percent": 10,
          "date": "2028-08-14"
        },
        {
          "label": "80% Construction",
          "percent": 10,
          "date": "2029-01-29"
        },
        {
          "label": "100% Construction and Handover",
          "percent": 20,
          "date": "2030-04-30"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Creek Bay B-1-108, checked 7 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/creek-bay-at-dubai-creek-harbour"
    },
    "overview": "Waterfront apartments on a quiet bay of Dubai Creek, framed by sculpted gardens and the Downtown skyline across the water. Walkways lead along the water's edge and into the community's parks, with Ras Al Khor's wildlife in view.",
    "highlights": [
      "One- to three-bedroom apartments on the Creek",
      "Infinity pool, kids' pool and outdoor fitness",
      "Waterfront promenade for cycling and dining",
      "Sports park, playground and neighbourhood plaza"
    ],
    "amenities": [
      "Infinity Pool",
      "Kids Pool",
      "BBQ & Picnic Areas",
      "Gym & Outdoor Fitness",
      "Playground",
      "Community Park",
      "Sports Park",
      "Neighbourhood Plaza",
      "Schools",
      "Promenade retail"
    ],
    "nearby": null,
    "lat": 25.2038875,
    "lng": 55.3587656,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/428926_brochure_File_8ca3036a82_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/creek-bay-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-bay-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-bay",
    "images": [
      {
        "base": "/img/creek-bay/1",
        "caption": "Creek Bay — the waterfront terrace at dusk below the towers, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-bay/2",
        "caption": "Creek Bay — the towers above the marina at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-bay/3",
        "caption": "Creek Bay — infinity pool facing the Downtown skyline, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-bay/4",
        "caption": "Creek Bay — the palm-lined promenade, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-bay/5",
        "caption": "Creek Bay — living room with Creek views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-bay/6",
        "caption": "Creek Bay — bedroom overlooking the Creek, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-bay/7",
        "caption": "Creek Bay — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-bay/og.jpg"
  },
  {
    "slug": "lyvia-by-palace",
    "name": "Lyvia by Palace",
    "brand": "by Palace",
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 15 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Green Gate",
    "unitTypes": [
      "1, 2, 3 Bedroom Apartments",
      "3 Bedroom Townhouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.98M",
    "startingPriceAed": 1980000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.98 Mn), checked 9 October 2026",
    "pricesFrom": "AED 2,684,888",
    "pricesFromAed": 2684888,
    "unitsListed": 15,
    "pricesFromNote": "Cheapest of the 15 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,144 – 1,917 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": {
      "text": "2029-07-31",
      "note": "'100% construction and handover' milestone on Emaar's booking page for unit DC Lyvia 1-104, checked 9 October 2026",
      "source": "https://www.emaar.com/en/properties/lyvia-by-palace-at-dubai-creek-harbour"
    },
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "During construction",
          "percent": 60
        },
        {
          "label": "On handover",
          "percent": 20
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 10.0,
          "date": "2026-10-09"
        },
        {
          "label": "2nd Installment",
          "percent": 10.0,
          "date": "2026-11-18"
        },
        {
          "label": "3rd Installment",
          "percent": 10.0,
          "date": "2027-03-18"
        },
        {
          "label": "4th Installment",
          "percent": 10.0,
          "date": "2027-07-18"
        },
        {
          "label": "5th Installment",
          "percent": 10.0,
          "date": "2027-11-18"
        },
        {
          "label": "6th Installment",
          "percent": 10.0,
          "date": "2028-03-18"
        },
        {
          "label": "7th Installment",
          "percent": 10.0,
          "date": "2028-07-18"
        },
        {
          "label": "9th Installment",
          "percent": 10.0,
          "date": "2028-11-18"
        },
        {
          "label": "100% Construction and Handover",
          "percent": 20.0,
          "date": "2029-07-31"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Lyvia 1-104, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/lyvia-by-palace-at-dubai-creek-harbour"
    },
    "overview": "A Palace-branded tower in the heart of Green Gate, with one- to three-bedroom apartments and three-bedroom townhouses oriented towards the greenery. Garden retreats, landscaped terraces, a padel court and an infinity pool deck.",
    "highlights": [
      "Palace-branded apartments and townhouses in Green Gate",
      "Infinity pool deck and kids' splash zone",
      "Padel court, yoga zone and outdoor fitness",
      "Common garden, BBQ and picnic areas"
    ],
    "amenities": [
      "Infinity Pool & Pool Deck",
      "Kids Pool & Splash Zone",
      "Common Garden",
      "BBQ & Picnic Areas",
      "Gym & Outdoor Fitness",
      "Multi-Purpose Room",
      "Yoga Zone",
      "Padel Court",
      "Landscaped Terraces",
      "Kids Play Areas"
    ],
    "nearby": null,
    "lat": 25.2049375,
    "lng": 55.3592344,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/lyvia-by-palace-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/lyvia-by-palace-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-lyvia-by-palace",
    "images": [
      {
        "base": "/img/lyvia-by-palace/1",
        "caption": "Lyvia by Palace — the tower rising over Green Gate, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lyvia-by-palace/2",
        "caption": "Lyvia by Palace — the residents' pool, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lyvia-by-palace/3",
        "caption": "Lyvia by Palace — kids' splash pool, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lyvia-by-palace/4",
        "caption": "Lyvia by Palace — the palm-lined street at the podium, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lyvia-by-palace/5",
        "caption": "Lyvia by Palace — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lyvia-by-palace/6",
        "caption": "Lyvia by Palace — living room with parkland views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lyvia-by-palace/7",
        "caption": "Lyvia by Palace — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/lyvia-by-palace/og.jpg"
  },
  {
    "slug": "montiva-by-vida",
    "name": "Montiva by Vida",
    "brand": "by Vida",
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 9 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1 to 3-bedroom apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.91M",
    "startingPriceAed": 1910000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.91 Mn), checked 9 October 2026",
    "pricesFrom": "AED 1,916,888",
    "pricesFromAed": 1916888,
    "unitsListed": 9,
    "pricesFromNote": "Cheapest of the 9 units Emaar listed on its website on 9 October 2026",
    "sizes": "755 – 1,246 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": {
      "text": "2029-09-30",
      "note": "'100% construction and handover' milestone on Emaar's booking page for unit DC Montiva P1-P103, checked 9 October 2026",
      "source": "https://www.emaar.com/en/properties/montiva-by-vida-at-dubai-creek-harbour"
    },
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "During construction",
          "percent": 60
        },
        {
          "label": "On handover",
          "percent": 20
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 10.0,
          "date": "2026-10-09"
        },
        {
          "label": "2nd Installment",
          "percent": 10.0,
          "date": "2026-11-18"
        },
        {
          "label": "3rd Installment",
          "percent": 10.0,
          "date": "2027-03-18"
        },
        {
          "label": "4th Installment",
          "percent": 10.0,
          "date": "2027-07-18"
        },
        {
          "label": "5th Installment",
          "percent": 10.0,
          "date": "2027-11-18"
        },
        {
          "label": "6th Installment",
          "percent": 10.0,
          "date": "2028-03-18"
        },
        {
          "label": "8th Installment",
          "percent": 10.0,
          "date": "2028-07-18"
        },
        {
          "label": "9th Installment",
          "percent": 10.0,
          "date": "2028-11-18"
        },
        {
          "label": "100% Construction and Handover",
          "percent": 20.0,
          "date": "2029-09-30"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Montiva P1-P103, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/montiva-by-vida-at-dubai-creek-harbour"
    },
    "overview": "A Vida-branded tower woven into gardens and green space, with one- to three-bedroom apartments framed by park views and the golf course. An infinity pool, yoga terraces, a sports park and a running track for an outdoor rhythm of life.",
    "highlights": [
      "Vida-branded one- to three-bedroom apartments",
      "Park and golf course views",
      "Infinity pool, yoga terraces and running track",
      "Sport park, neighbourhood plaza and schools"
    ],
    "amenities": [
      "Community Park",
      "Sport Park",
      "Neighbourhood Plaza",
      "Schools",
      "Promenade Retail",
      "Multi-Sport Court",
      "Running Track",
      "Table Tennis & Badminton",
      "Lawn"
    ],
    "nearby": null,
    "lat": 25.2033875,
    "lng": 55.35998439999999,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/419522_brochure_File_1ed1216b0b_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/montiva-by-vida-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/montiva-by-vida-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-montiva-tower",
    "images": [
      {
        "base": "/img/montiva-by-vida/1",
        "caption": "Montiva by Vida — the tower at sunset, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/montiva-by-vida/2",
        "caption": "Montiva by Vida — balcony over the park with the Blue Line viaduct, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/montiva-by-vida/3",
        "caption": "Montiva by Vida — the community park beneath the towers, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/montiva-by-vida/4",
        "caption": "Montiva by Vida — children's playground, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/montiva-by-vida/5",
        "caption": "Montiva by Vida — living room with park views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/montiva-by-vida/6",
        "caption": "Montiva by Vida — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/montiva-by-vida/7",
        "caption": "Montiva by Vida — the lobby lounge, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/montiva-by-vida/og.jpg"
  },
  {
    "slug": "silva",
    "name": "Silva",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 10 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Green Gate",
    "unitTypes": [
      "1 to 3 Bed Apartments & 3 Bed Townhouse"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.79M",
    "startingPriceAed": 1790000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.79 Mn), checked 9 October 2026",
    "pricesFrom": "AED 1,790,888",
    "pricesFromAed": 1790888,
    "unitsListed": 10,
    "pricesFromNote": "Cheapest of the 10 units Emaar listed on its website on 9 October 2026",
    "sizes": "740 – 1,834 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "Apartments and three-bedroom townhouses adjoining Green Gate, with Creek and skyline views over green landscapes. Yoga hubs, running tracks and a multi-sports court sit alongside the infinity pool and community park.",
    "highlights": [
      "Apartments and three-bedroom townhouses",
      "Infinity pool, kids' pool and outdoor fitness",
      "Sports park, playground and running track",
      "Neighbourhood plaza, schools and promenade retail"
    ],
    "amenities": [
      "Infinity Pool",
      "Kids Pool",
      "BBQ & Picnic Areas",
      "Gym & Outdoor Fitness",
      "Playground",
      "Community Park",
      "Sports Park",
      "Neighbourhood Plaza",
      "Schools",
      "Promenade retail"
    ],
    "nearby": null,
    "lat": 25.2038875,
    "lng": 55.3587656,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/417987_brochure_File_2d3a287542_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/silva-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/silva-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-silva-tower",
    "images": [
      {
        "base": "/img/silva/1",
        "caption": "Silva — the tower at dusk, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/silva/2",
        "caption": "Silva — terrace at sunset over the park towards the Creek, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/silva/3",
        "caption": "Silva — the residents' pool, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/silva/4",
        "caption": "Silva — the community pavilion at dusk, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/silva/5",
        "caption": "Silva — the clubhouse and lawn, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/silva/6",
        "caption": "Silva — living room with park views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/silva/7",
        "caption": "Silva — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/silva/og.jpg"
  },
  {
    "slug": "altan",
    "name": "Altan",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 18 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Green Gate",
    "unitTypes": [
      "1 to 3-bedroom apartments",
      "3 bedroom townhouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.81M",
    "startingPriceAed": 1810000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.81 Mn AED), checked 9 October 2026",
    "pricesFrom": "AED 1,813,888",
    "pricesFromAed": 1813888,
    "unitsListed": 18,
    "pricesFromNote": "Cheapest of the 18 units Emaar listed on its website on 9 October 2026",
    "sizes": "757 – 4,080 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "A tower of one- to three-bedroom apartments and three-bedroom townhouses with Creek, city and golf course views, beside Green Gate Sports Park. Canal-side promenades, cycling paths and garden courtyards shape everyday life.",
    "highlights": [
      "Apartments and townhouses by Green Gate Sports Park",
      "Adult and kids' pools, landscaped podium deck",
      "Multi-sport court, running track and lawn",
      "Gymnasium, multipurpose hall and BBQ area"
    ],
    "amenities": [
      "Gymnasium",
      "Multipurpose Hall",
      "BBQ Area",
      "Adult and Kids Swimming Pools",
      "Outdoor Playground",
      "Landscape Podium Deck",
      "Multi-Sport Court",
      "Running Track",
      "Table Tennis & Badminton",
      "Lawn"
    ],
    "nearby": null,
    "lat": 25.205032,
    "lng": 55.355757,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/410790_brochure_File_095285ba79_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/altan-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/altan-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-altan",
    "images": [
      {
        "base": "/img/altan/1",
        "caption": "Altan — the tower at dusk beside Green Gate, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altan/2",
        "caption": "Altan — balcony view over the parkland and golf course, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altan/3",
        "caption": "Altan — the residents' pool, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altan/4",
        "caption": "Altan — shaded play deck on the podium, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altan/5",
        "caption": "Altan — the community lawn, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altan/6",
        "caption": "Altan — living room with skyline views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altan/7",
        "caption": "Altan — residents' lounge, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/altan/og.jpg"
  },
  {
    "slug": "albero",
    "name": "Albero",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 23 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1 to 3-bedroom apartments",
      "3 bedroom townhouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.81M",
    "startingPriceAed": 1810000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.81 Mn AED), checked 9 October 2026",
    "pricesFrom": "AED 1,813,888",
    "pricesFromAed": 1813888,
    "unitsListed": 23,
    "pricesFromNote": "Cheapest of the 23 units Emaar listed on its website on 9 October 2026",
    "sizes": "757 – 4,166 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": {
      "text": "2029-09-30",
      "note": "'100% construction and handover' milestone on Emaar's booking page for unit DC Albero P2-P204, checked 9 October 2026",
      "source": "https://www.emaar.com/en/properties/albero-at-dubai-creek-harbour"
    },
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "During construction",
          "percent": 60
        },
        {
          "label": "On handover",
          "percent": 20
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 10.0,
          "date": "2026-10-09"
        },
        {
          "label": "2nd Installment",
          "percent": 10.0,
          "date": "2026-11-18"
        },
        {
          "label": "3rd Installment",
          "percent": 10.0,
          "date": "2027-03-18"
        },
        {
          "label": "4th Installment",
          "percent": 10.0,
          "date": "2027-07-18"
        },
        {
          "label": "5th Installment",
          "percent": 10.0,
          "date": "2027-11-18"
        },
        {
          "label": "6th Installment",
          "percent": 10.0,
          "date": "2028-03-18"
        },
        {
          "label": "7th Installment",
          "percent": 10.0,
          "date": "2028-07-18"
        },
        {
          "label": "80% Construction",
          "percent": 10.0,
          "date": "2028-12-07"
        },
        {
          "label": "100% Construction and Handover",
          "percent": 20.0,
          "date": "2029-09-30"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Albero P2-P204, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/albero-at-dubai-creek-harbour"
    },
    "overview": "A tower of one- to three-bedroom apartments and three-bedroom townhouses with views over the Creek, the golf course and the city. Life centres on the waterfront, the parks and the retail promenade, with a sports park, running track and lawns.",
    "highlights": [
      "Apartments and townhouses with Creek and golf views",
      "Infinity pool and outdoor fitness",
      "Sport park, multi-sport court and running track",
      "Neighbourhood plaza, schools and promenade retail"
    ],
    "amenities": [
      "Community Park",
      "Sport Park",
      "Neighbourhood Plaza",
      "Schools",
      "Promenade Retail",
      "Multi-Sport Court",
      "Running Track",
      "Table Tennis & Badminton",
      "Lawn"
    ],
    "nearby": null,
    "lat": 25.204663,
    "lng": 55.357216,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/401668_brochure_File_18ca13ec56_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/albero-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/albero-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-albero-by-emaar",
    "images": [
      {
        "base": "/img/albero/1",
        "caption": "Albero — the tower at dusk beside Green Gate, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/albero/2",
        "caption": "Albero — the podium entrance and fountains in the evening, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/albero/3",
        "caption": "Albero — the residents' pool, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/albero/4",
        "caption": "Albero — shaded play deck on the podium, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/albero/5",
        "caption": "Albero — the community lawn, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/albero/6",
        "caption": "Albero — living room with skyline views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/albero/7",
        "caption": "Albero — bedroom overlooking the parkland, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/albero/og.jpg"
  },
  {
    "slug": "altus",
    "name": "Altus",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 4 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.6M",
    "startingPriceAed": 1600000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.6 Mn AED), checked 9 October 2026",
    "pricesFrom": "AED 2,739,888",
    "pricesFromAed": 2739888,
    "unitsListed": 4,
    "pricesFromNote": "Cheapest of the 4 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,144 – 1,927 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "Two towers in a district near Creek Beach, pairing waterfront views with city life. Emaar describes a four-minute walk to the metro; residents have a pool, kids' pool, indoor and outdoor gyms and a yoga area, with the promenade and sports courts close by.",
    "highlights": [
      "Two towers of one- to three-bedroom apartments",
      "Four-minute walk to the metro (Emaar)",
      "Pool, kids' pool, yoga area and gyms",
      "Near the RTA ferry terminal"
    ],
    "amenities": [
      "Kids Play Area",
      "Pool Area",
      "Indoor and Outdoor Gym",
      "Kids' Pool Area",
      "Multipurpose Room",
      "Yoga Area"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.207620527681463,
    "lng": 55.35323106854724,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/389204_brochure_File_45705e9c8e_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/altus-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/altus-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-altus",
    "images": [
      {
        "base": "/img/altus/1",
        "caption": "Altus — the two towers above the community lawn at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altus/2",
        "caption": "Altus — the pool and cabanas at dusk, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altus/3",
        "caption": "Altus — children's playground, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altus/4",
        "caption": "Altus — café terrace at the foot of the tower, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altus/5",
        "caption": "Altus — living room opening onto the balcony, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altus/6",
        "caption": "Altus — bedroom with Creek views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/altus/7",
        "caption": "Altus — the lawn beside the tower, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/altus/og.jpg"
  },
  {
    "slug": "address-residences-dubai-creek-harbour",
    "name": "Address Residences Dubai Creek Harbour",
    "brand": "Address-branded",
    "status": "Resale",
    "statusNote": "Under construction — sold out with Emaar; resale on request",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments",
      "3-Bedrooms Townhouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 2.0M",
    "startingPriceAed": 2000000,
    "startingPriceNote": "Emaar's advertised starting price for the project (2.0 Mn AED), checked 9 October 2026",
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Address-branded apartments and three-bedroom townhouses at the heart of Dubai Creek Harbour, with an urban beach and the central park as the backdrop. Landscaped podium decks, adult and children's pools and a grand lobby.",
    "highlights": [
      "Address-branded apartments and townhouses",
      "Urban beach and central park setting",
      "Adult and children's pools, BBQ area",
      "Resident lounge and grand lobby"
    ],
    "amenities": [
      "Urban beach",
      "State-of-the-art gymnasium",
      "Multi-purpose hall",
      "Adult & Children's swimming pools",
      "Outdoor children's play area",
      "BBQ Area",
      "Landscaped podium decks",
      "Resident lounge and grand lobby",
      "Dedicated parking spaces"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.20728936106789,
    "lng": 55.350119298154034,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/address-residences-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-address-residences-dubai-creek-harbour",
    "images": [
      {
        "base": "/img/address-residences-dubai-creek-harbour/1",
        "caption": "Address Residences — the towers above the fountain lake at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-residences-dubai-creek-harbour/2",
        "caption": "Address Residences — the fountain plaza on the waterfront, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-residences-dubai-creek-harbour/3",
        "caption": "Address Residences — the building facade along the promenade, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-residences-dubai-creek-harbour/4",
        "caption": "Address Residences — the urban beach lagoon beside the Creek, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-residences-dubai-creek-harbour/5",
        "caption": "Address Residences — play lawn at the foot of the tower, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-residences-dubai-creek-harbour/6",
        "caption": "Address Residences — living room opening onto a Creek-view balcony, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-residences-dubai-creek-harbour/7",
        "caption": "Address Residences — bedroom with water views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/address-residences-dubai-creek-harbour/og.jpg"
  },
  {
    "slug": "palace-residences-creek-blue",
    "name": "Palace Residences Creek Blue",
    "brand": "Palace-branded",
    "status": "Resale",
    "statusNote": "Under construction — sold out with Emaar; resale on request",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.87M",
    "startingPriceAed": 1870000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.87 Mn AED), checked 9 October 2026",
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Palace-branded apartments at the edge of Dubai Creek Harbour with views across the water to Creek Island. A scenic amenity platform with a glass pavilion gym, adult and kids' pools, water features and a games room.",
    "highlights": [
      "Palace-branded one- to three-bedroom apartments",
      "Views of Creek Island across the water",
      "Glass pavilion gym with pool views",
      "Adult and kids' pools, games room, BBQ areas"
    ],
    "amenities": [
      "Glass Pavilion Gym with Pool Views",
      "Surrounding Trees",
      "Changing Facilities",
      "Multipurpose Room",
      "Games Room",
      "Adult and Kids Pools",
      "Water Features",
      "BBQ Areas"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.209148822010974,
    "lng": 55.35141872883598,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/388449_brochure_File_06c2ee36fb_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/palace-residences-creek-blue",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-palace-residences-creek-blue",
    "images": [
      {
        "base": "/img/palace-residences-creek-blue/1",
        "caption": "Palace Residences Creek Blue — terrace over the Creek facing the Creek Island bridge, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-creek-blue/2",
        "caption": "Palace Residences Creek Blue — the beach pool beneath the tower, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-creek-blue/3",
        "caption": "Palace Residences Creek Blue — the pool at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-creek-blue/4",
        "caption": "Palace Residences Creek Blue — the waterfront walkway, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-creek-blue/5",
        "caption": "Palace Residences Creek Blue — living room facing the bridge, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-creek-blue/6",
        "caption": "Palace Residences Creek Blue — bedroom with Creek views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-creek-blue/7",
        "caption": "Palace Residences Creek Blue — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/palace-residences-creek-blue/og.jpg"
  },
  {
    "slug": "arlo",
    "name": "ARLO",
    "brand": null,
    "status": "Resale",
    "statusNote": "Under construction — sold out with Emaar; resale on request",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments",
      "3-Bedroom Townhouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.7M",
    "startingPriceAed": 1700000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.7 MN AED), checked 9 October 2026",
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Apartments and three-bedroom townhouses in a district near Creek Beach, with views of Dubai Creek and the Creek Island bridge. Emaar describes a four-minute walk to the metro; the promenade, adventure playground, cycling track and sports courts are the neighbourhood.",
    "highlights": [
      "Apartments and three-bedroom townhouses",
      "Four-minute walk to the metro (Emaar)",
      "Pool, kids' pool, yoga area and gyms",
      "Near the RTA ferry terminal"
    ],
    "amenities": [
      "Kids Play Area",
      "Pool & Pool Area",
      "Indoor and Outdoor Gym",
      "Kids' Pool Area",
      "Multipurpose Room",
      "Yoga Area"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.20821576702089,
    "lng": 55.3567310730159,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/385314_brochure_File_7b6c971980_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/arlo-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-arlo",
    "images": [
      {
        "base": "/img/arlo/1",
        "caption": "ARLO — the towers beside the Creek and the Creek Island bridge, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/arlo/2",
        "caption": "ARLO — the waterfront at dusk with the bridge behind, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/arlo/3",
        "caption": "ARLO — the promenade at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/arlo/4",
        "caption": "ARLO — the pool deck, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/arlo/5",
        "caption": "ARLO — the plaza fountains under the bridge, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/arlo/6",
        "caption": "ARLO — living room with Creek views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/arlo/7",
        "caption": "ARLO — bedroom overlooking the water, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/arlo/og.jpg"
  },
  {
    "slug": "palace-residences-north",
    "name": "Palace Residences North",
    "brand": "Palace-branded",
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments",
      "3-Bedroom Waterfront Townhouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.23M",
    "startingPriceAed": 1230000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.23M AED), checked 9 October 2026",
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Branded waterfront apartments and townhouses on Creek Island, steps from the Palace hotel and its five-star amenities. Homes face the water with the Burj Khalifa skyline beyond; an infinity-edge pool and yoga room sit on the podium.",
    "highlights": [
      "Palace-branded apartments and waterfront townhouses",
      "Steps from the Palace hotel",
      "Infinity-edge pool and dedicated yoga room",
      "Kids' pool and play area"
    ],
    "amenities": [
      "Infinity-edge Pool",
      "Kids' Play Area & Pool",
      "State-of-the-art Gym",
      "Dedicated Yoga Room"
    ],
    "nearby": [
      "Downtown Dubai",
      "Dubai International Airport",
      "Dubai Marina",
      "Dubai Mall",
      "Dubai Opera"
    ],
    "lat": 25.1945448,
    "lng": 55.3641298,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/306262_brochure_File_0536c852cb_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/palace-residences-north",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-palace-residence-north",
    "images": [
      {
        "base": "/img/palace-residences-north/1",
        "caption": "Palace Residences North — the towers on the Creek Island waterfront, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-north/2",
        "caption": "Palace Residences North — the promenade along the Creek, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-north/3",
        "caption": "Palace Residences North — the waterfront at night, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-north/4",
        "caption": "Palace Residences North — balcony view over the Creek, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-north/5",
        "caption": "Palace Residences North — the residents' entrance at night, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-north/6",
        "caption": "Palace Residences North — living room with skyline views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences-north/7",
        "caption": "Palace Residences North — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/palace-residences-north/og.jpg"
  },
  {
    "slug": "the-grand",
    "name": "The Grand",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2 and 3-bedroom apartments",
      "4-bedroom penthouses",
      "Podium-level townhouses with private gardens"
    ],
    "bedrooms": "1–3 bedrooms, 4-bedroom penthouses",
    "propertyTypes": null,
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "A 62-storey tower near the heart of Creek Island, set by the marina and the waterfront promenade, launched by Emaar in March 2018. One- to three-bedroom apartments, four-bedroom penthouses and podium townhouses with private gardens, plus a residents' lounge on the rooftop.",
    "highlights": [
      "62-storey tower by Creek Marina (Emaar)",
      "Apartments, penthouses and podium townhouses",
      "Infinity pool, cabanas and tennis court",
      "Rooftop residents' lounge"
    ],
    "amenities": [
      "Infinity pool",
      "Cabanas",
      "Play areas",
      "Gymnasium",
      "Tennis court",
      "Multi-purpose sports lawn",
      "BBQ area",
      "Rooftop lounge"
    ],
    "nearby": null,
    "lat": null,
    "lng": null,
    "brochureUrl": null,
    "floorPlanUrl": null,
    "emaarUrl": "https://www.emaar.com/en/press-release-listing/emaar-launches-its-most-premium-ultra-luxe-residential-tower-in-dubai-creek-harbour-the-grand",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-the-grand",
    "images": [
      {
        "base": "/img/district/11",
        "caption": "Creek Island skyline with the planned Dubai Creek Tower — render (Emaar, 2018 launch release)",
        "w": 653,
        "h": 326,
        "widths": [
          480,
          960
        ]
      }
    ],
    "ogImage": "/img/district/og.jpg"
  },
  {
    "slug": "aeon",
    "name": "Aeon",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 1 unit",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.71M",
    "startingPriceAed": 1710000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.71MN AED), checked 9 October 2026",
    "pricesFrom": "AED 3,202,888",
    "pricesFromAed": 3202888,
    "unitsListed": 1,
    "pricesFromNote": "Cheapest of the 1 unit Emaar listed on its website on 9 October 2026",
    "sizes": "1,289 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "Twin towers beside the lagoon beach in Creek Beach, positioned next to the district's central plaza. Apartments look over the canal, the parks and the city, with a clubhouse, wellness hubs and lounges for residents.",
    "highlights": [
      "One- to three-bedroom apartments beside the lagoon",
      "Clubhouse, wellness hubs and game rooms",
      "Next to the central plaza and beach boulevard",
      "Metro and water-taxi links described by Emaar"
    ],
    "amenities": [
      "Park Views",
      "Beach Boulevard",
      "Canal Views",
      "Metro Connectivity",
      "Clubhouse",
      "Wellness Hubs",
      "Gymnasium",
      "Lounges & Game Rooms",
      "Parking Solutions"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.20638943321272,
    "lng": 55.35187182883515,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/378815_brochure_File_4f35d53ea5_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/aeon-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/aeon",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-aeon",
    "images": [
      {
        "base": "/img/aeon/1",
        "caption": "Aeon — the lagoon beach at Creek Beach with the bridge beyond, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/aeon/2",
        "caption": "Aeon — the towers beside the lagoon at dusk, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/aeon/3",
        "caption": "Aeon — the towers above the community lawn, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/aeon/4",
        "caption": "Aeon — the residents' entrance, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/aeon/5",
        "caption": "Aeon — the park and play areas beneath the towers, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/aeon/6",
        "caption": "Aeon — living room with lagoon views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/aeon/7",
        "caption": "Aeon — bedroom opening onto the balcony, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/aeon/og.jpg"
  },
  {
    "slug": "creek-edge",
    "name": "Creek Edge",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2 & 3 Bedroom Apartments"
    ],
    "bedrooms": "2–4",
    "propertyTypes": "Townhouses",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Two towers of 40 and 20 floors on the Creek Island waterfront promenade, joined by a landscaped amenities podium. Homes face the water and the Downtown skyline through floor-to-ceiling glass; Emaar lists it among the towers with direct views of the Ras Al Khor sanctuary.",
    "highlights": [
      "Towers of 40 and 20 floors on the promenade",
      "Infinity-edge pool, gym, zen and yoga areas",
      "Direct sanctuary and skyline views (Emaar)",
      "Steps from Creek Marina and Creek Island's park"
    ],
    "amenities": [
      "Zen & Yoga Areas",
      "Fully-equipped Gym",
      "Children's Play Areas",
      "Waterfront Promenade",
      "Yacht Club",
      "Creek Beach"
    ],
    "nearby": null,
    "lat": 25.209944,
    "lng": 55.3452554,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/1594_brochure_File_ca03e6da46_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-edge",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-edge",
    "images": [
      {
        "base": "/img/creek-edge/1",
        "caption": "Creek Edge — the tower and its podium homes at dusk, render (Emaar)",
        "w": 10000,
        "h": 7140,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-edge/2",
        "caption": "Creek Edge — balcony view over the Creek towards Downtown Dubai, render (Emaar)",
        "w": 10000,
        "h": 7137,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-edge/3",
        "caption": "Creek Edge — promenade and play area at the foot of the tower, render (Emaar)",
        "w": 10000,
        "h": 7129,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-edge/og.jpg"
  },
  {
    "slug": "surf",
    "name": "Surf",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1, 2 & 3 Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Apartments a few steps from Creek Beach and a lively waterfront plaza, next to a boutique Vida hotel. Homes have private balconies and floor-to-ceiling glass; the landscaped courtyard connects to the hotel's bars and restaurants.",
    "highlights": [
      "One- to three-bedroom apartments by Creek Beach",
      "Beside the Vida hotel and its restaurants",
      "Waterfront plaza with markets and events",
      "Pool, gym and outdoor dining areas"
    ],
    "amenities": [
      "A Shimmering Pool",
      "Fully-Equipped Gym",
      "Multi-Purpose Community Room",
      "Landscaping & Green Spaces",
      "Outdoor Barbecue & Dining Areas",
      "Waterfront Plaza",
      "Creek Beach"
    ],
    "nearby": null,
    "lat": 25.1945448,
    "lng": 55.36412979999999,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/1596_brochure_File_44129965e5_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/surf",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-surf-at-creek-beach",
    "images": [
      {
        "base": "/img/surf/1",
        "caption": "Surf — the towers and low-rise homes around the park, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/surf/2",
        "caption": "Surf — the park and fountains at dusk, render (Emaar)",
        "w": 8000,
        "h": 5930,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/surf/3",
        "caption": "Surf — the plaza fountains and cafés, render (Emaar)",
        "w": 6000,
        "h": 4494,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/surf/og.jpg"
  },
  {
    "slug": "creek-palace",
    "name": "Creek Palace",
    "brand": "Palace-branded",
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 1 unit",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "Apartments and Villas"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments & Villas",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": "AED 4,034,888",
    "pricesFromAed": 4034888,
    "unitsListed": 1,
    "pricesFromNote": "Cheapest of the 1 unit Emaar listed on its website on 9 October 2026",
    "sizes": "1,646 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "Branded canal-facing homes on Creek Promenade, next to Creek Island's Palace hotel and its five-star services. One- to three-bedroom apartments and three-bedroom canal-facing villas, a five-minute walk from Island Park.",
    "highlights": [
      "Palace-branded apartments and canal villas",
      "Adjacent to the Palace hotel's services",
      "Promenade retail and dining at the door",
      "Island Park a five-minute walk away (Emaar)"
    ],
    "amenities": [
      "Kids' Play Area & Pool",
      "Fully-equipped Gym",
      "Creek Marina",
      "Creek Beach",
      "Yacht Club"
    ],
    "nearby": null,
    "lat": 25.2030748,
    "lng": 55.3465631,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/1598_brochure_File_41ccdcb4d4_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/creek-palace-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-palace",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-palace",
    "images": [
      {
        "base": "/img/creek-palace/1",
        "caption": "Creek Palace — the tower on Creek Island beside the bridge, render (Emaar)",
        "w": 3375,
        "h": 1733,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-palace/2",
        "caption": "Creek Palace — infinity pool facing the skyline, render (Emaar)",
        "w": 2500,
        "h": 1365,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-palace/3",
        "caption": "Creek Palace — landscaped gardens on the podium, render (Emaar)",
        "w": 6000,
        "h": 3375,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-palace/4",
        "caption": "Creek Palace — balconies facing the Downtown skyline at dusk, render (Emaar)",
        "w": 8000,
        "h": 5656,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-palace/og.jpg"
  },
  {
    "slug": "dubai-creek-residences",
    "name": "Dubai Creek Residences",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 6 units",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2 & 3-bedroom Apartments and Penthouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments & Penthouses",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": "AED 2,689,888",
    "pricesFromAed": 2689888,
    "unitsListed": 6,
    "pricesFromNote": "Cheapest of the 6 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,168 – 2,154 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "On handover",
          "percent": 80
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 10.0,
          "date": "2026-10-09"
        },
        {
          "label": "2nd Installment",
          "percent": 10.0,
          "date": "2026-10-09"
        },
        {
          "label": "On Handover",
          "percent": 80.0,
          "date": "2026-11-07"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Dubai Creek Residences T2-31-3103, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/dubai-creek-residences"
    },
    "overview": "Apartments and penthouses at the edge of Creek Island with open views over Creek Marina, its yacht club and the skyline beyond. The Vida Creek Harbour hotel sits between the two clusters of towers, bringing resort-style services to residents.",
    "highlights": [
      "One- to three-bedroom apartments and penthouses",
      "Front-row views of Creek Marina and the yacht club",
      "Vida Creek Harbour hotel between the towers",
      "Infinity pool, gym and daycare centre"
    ],
    "amenities": [
      "Fully-equipped Gym",
      "Infinity Swimming Pool",
      "Central Park",
      "Daycare Centre",
      "Creek Island"
    ],
    "nearby": null,
    "lat": 25.20565,
    "lng": 55.34370199999999,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-residences-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/dubai-creek-residences",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-dubai-creek-residences",
    "images": [
      {
        "base": "/img/dubai-creek-residences/1",
        "caption": "Dubai Creek Residences — the towers on the Creek Island waterfront, render (Emaar)",
        "w": 2250,
        "h": 1156,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/dubai-creek-residences/2",
        "caption": "Dubai Creek Residences — the towers above Creek Marina at night, photo (Emaar)",
        "w": 1200,
        "h": 900,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/dubai-creek-residences/3",
        "caption": "Dubai Creek Residences — the marina promenade at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/dubai-creek-residences/og.jpg"
  },
  {
    "slug": "creek-rise",
    "name": "Creek Rise",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2 & 3-bedroom apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Two high-rise towers overlooking Creek Island's parkland in a family-oriented neighbourhood. One- to three-bedroom apartments from 72 to 152 square metres (Emaar), with private temperature-controlled pools, gyms and children's areas on the podium.",
    "highlights": [
      "Twin towers facing Creek Island's park",
      "Apartments of 72–152 sq m (Emaar)",
      "Private pools, gym and children's areas",
      "Creek Marina, yacht club and retail nearby"
    ],
    "amenities": [
      "Creek Marina",
      "Yacht club",
      "Private pools",
      "Gym & children's area",
      "Retail, café & restaurants"
    ],
    "nearby": null,
    "lat": 25.2092062,
    "lng": 55.3442247,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-rise",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-rise",
    "images": [
      {
        "base": "/img/creek-rise/1",
        "caption": "Creek Rise — the twin towers at dusk, render (Emaar)",
        "w": 2000,
        "h": 1027,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-rise/2",
        "caption": "Creek Rise — living room with Creek views, render (Emaar)",
        "w": 1620,
        "h": 1000,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-rise/og.jpg"
  },
  {
    "slug": "creek-horizon",
    "name": "Creek Horizon",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2 & 3-bedroom apartments & penthouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments & Penthouses",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Two towers beside Creek Island's central park, placed above the marina so that Burj Khalifa and Downtown sit on the horizon. Apartments and penthouses with large windows and balconies, and an observation deck for residents.",
    "highlights": [
      "Apartments and penthouses by the central park",
      "Observation deck over Dubai Creek",
      "Outdoor pool set in landscaped grounds",
      "Lounge, multi-function room and restaurants"
    ],
    "amenities": [
      "Kids' Play Area",
      "Multi-functional Room",
      "Lounge",
      "Restaurants",
      "Swimming Pool"
    ],
    "nearby": null,
    "lat": 25.2069094,
    "lng": 55.3448234,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-horizon",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-horizon",
    "images": [
      {
        "base": "/img/creek-horizon/1",
        "caption": "Creek Horizon — the twin towers with the Downtown skyline behind, render (Emaar)",
        "w": 2200,
        "h": 1130,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-horizon/2",
        "caption": "Creek Horizon — the towers at sunset over Dubai Creek, render (Emaar)",
        "w": 1200,
        "h": 682,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-horizon/3",
        "caption": "Creek Horizon — terrace lounge at sunset, render (Emaar)",
        "w": 2200,
        "h": 1130,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-horizon/4",
        "caption": "Creek Horizon — living room with floor-to-ceiling Creek views, render (Emaar)",
        "w": 2200,
        "h": 1131,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-horizon/og.jpg"
  },
  {
    "slug": "vida-residences-creek-beach",
    "name": "Vida Residences Creek Beach",
    "brand": "Vida-branded",
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1, 2 & 3-bedroom apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "A 33-storey branded tower on the beach, next to the Vida hotel, with one- to three-bedroom apartments and à la carte hotel services for residents. Creek Beach and Creek Marina are steps away.",
    "highlights": [
      "33-storey Vida-branded tower on Creek Beach",
      "Hotel services available to residents",
      "Pool, gym, spa and barbecue courtyard",
      "Beach and marina dining within walking distance"
    ],
    "amenities": [
      "Pool",
      "Well-equipped gym",
      "Barbecue area",
      "Spa",
      "Waterfront dining"
    ],
    "nearby": null,
    "lat": 25.2046528,
    "lng": 55.349773,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/109246_brochure_File_1b62e4ecfd_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/vida-residences-creek-beach",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-vida-residences-creek-beach",
    "images": [
      {
        "base": "/img/vida-residences-creek-beach/1",
        "caption": "Vida Residences Creek Beach — the Vida tower from Creek Beach, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/vida-residences-creek-beach/2",
        "caption": "Vida Residences Creek Beach — the beach and lagoon below the residences, render (Emaar)",
        "w": 2000,
        "h": 1027,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/vida-residences-creek-beach/3",
        "caption": "Vida Residences Creek Beach — living room, render (Emaar)",
        "w": 1200,
        "h": 670,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/vida-residences-creek-beach/og.jpg"
  },
  {
    "slug": "the-cove",
    "name": "The Cove",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 1 unit",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1,2 & 3- Bedroom Apartments",
      "3 Bedroom Townhouses",
      "3 & 4-Bedroom Duplexes & Penthouses"
    ],
    "bedrooms": "1–4",
    "propertyTypes": null,
    "startingPrice": "AED 1.32M",
    "startingPriceAed": 1320000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.32M AED), checked 9 October 2026",
    "pricesFrom": "AED 4,387,888",
    "pricesFromAed": 4387888,
    "unitsListed": 1,
    "pricesFromNote": "Cheapest of the 1 unit Emaar listed on its website on 9 October 2026",
    "sizes": "1,389 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "Low-rise waterfront buildings on Creek Island with apartments, townhouses, duplexes and penthouses, looking across the water to the wildlife sanctuary. Creek Marina, the yacht club and the promenade's restaurants are the neighbourhood.",
    "highlights": [
      "Apartments, townhouses, duplexes and penthouses",
      "Sunset and sanctuary views across the Creek",
      "Creek Marina yacht club and promenade dining",
      "Three hotels in the vicinity (Emaar)"
    ],
    "amenities": [
      "Family-friendly amenities for a balanced lifestyle",
      "Breathtaking Sunset Views",
      "Creek Marina Yacht Club",
      "Licensed Bars & Restaurants",
      "Dining at The Creek Promenade",
      "Views of Wildlife Sanctuary",
      "3 Hotels in the Vicinity"
    ],
    "nearby": [
      "Burj Khalifa",
      "Dubai Mall",
      "Downtown Dubai",
      "Dubai International Airport",
      "Dubai Opera"
    ],
    "lat": 25.201785421163653,
    "lng": 55.34276418650795,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/274689_brochure_File_9f711c9a5a_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/the-cove-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/the-cove",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-the-cove",
    "images": [
      {
        "base": "/img/the-cove/1",
        "caption": "The Cove — the buildings on the lagoon at Creek Beach, aerial render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/the-cove/2",
        "caption": "The Cove — the homes along the water, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/the-cove/3",
        "caption": "The Cove — the lagoon with boats passing, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/the-cove/4",
        "caption": "The Cove — terrace over the lagoon, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/the-cove/5",
        "caption": "The Cove — living room with water views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/the-cove/6",
        "caption": "The Cove — bedroom overlooking the lagoon, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/the-cove/7",
        "caption": "The Cove — kitchen and dining area, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/the-cove/og.jpg"
  },
  {
    "slug": "harbour-views",
    "name": "Harbour Views",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2- & 3-bedroom apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "The tallest twin towers on Creek Island, rising 51 floors above the Creek with more than 750 glass-fronted apartments (Emaar). Homes face Creek Marina and the Downtown skyline on one side and the parkland on the other.",
    "highlights": [
      "51-floor twin towers, 750+ apartments (Emaar)",
      "Marina, skyline and park views",
      "Pools, gym and a light-filled lobby",
      "Vida hotel, shops and restaurants next door"
    ],
    "amenities": [
      "Gym",
      "Swimming pools",
      "Central Park",
      "Near Vida Hotel",
      "Near shops & restaurants"
    ],
    "nearby": null,
    "lat": 25.201404,
    "lng": 55.34223699999999,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/harbour-views",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-harbour-views",
    "images": [
      {
        "base": "/img/harbour-views/1",
        "caption": "Harbour Views — the twin towers over the Creek with the Downtown skyline, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/harbour-views/2",
        "caption": "Harbour Views — the waterfront promenade, photo (Emaar)",
        "w": 1200,
        "h": 670,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/harbour-views/og.jpg"
  },
  {
    "slug": "creek-gate",
    "name": "Creek Gate",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 3 units",
    "construction": "completed",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1, 2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": "AED 4,414,888",
    "pricesFromAed": 4414888,
    "unitsListed": 3,
    "pricesFromNote": "Cheapest of the 3 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,490 – 1,497 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "On handover",
          "percent": 80
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 20.0,
          "date": "2026-10-09"
        },
        {
          "label": "On Handover",
          "percent": 80.0,
          "date": "2026-11-18"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Creek Gate T1-1-101, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/creek-gate"
    },
    "overview": "High-rise one- to three-bedroom apartments at a waterfront hotspot, with balconies that look over Dubai Creek Harbour and the park. Interiors use wood, polished tile and light finishes.",
    "highlights": [
      "One- to three-bedroom apartments",
      "Balcony views over the Creek and park",
      "Swimming pool and gym",
      "Restaurants and cafés nearby"
    ],
    "amenities": [
      "Swimming Pool",
      "Gym",
      "Nearby Restaurants & Cafes"
    ],
    "nearby": null,
    "lat": 25.207701,
    "lng": 55.3472454,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/creek-gate-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-gate",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-gate",
    "images": [
      {
        "base": "/img/creek-gate/1",
        "caption": "Creek Gate — balcony over the Creek with the Downtown skyline, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-gate/2",
        "caption": "Creek Gate — living and dining room with Creek views, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-gate/og.jpg"
  },
  {
    "slug": "harbour-gate",
    "name": "Harbour Gate",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 7 units",
    "construction": "completed",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "1, 2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": "AED 3,360,888",
    "pricesFromAed": 3360888,
    "unitsListed": 7,
    "pricesFromNote": "Cheapest of the 7 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,152 – 1,640 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "Two stepped towers with one- to three-bedroom apartments looking over the parkland and the waters of Dubai Creek. Spacious living and dining rooms in a neutral palette, with gyms, pools and children's play areas on site.",
    "highlights": [
      "Two stepped towers over the park",
      "One- to three-bedroom apartments",
      "Temperature-controlled pool and gyms",
      "Children's play areas"
    ],
    "amenities": [
      "Swimming Pool",
      "Gym",
      "Nearby Restaurants & Cafes"
    ],
    "nearby": null,
    "lat": 25.2076944,
    "lng": 55.34726200000001,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/harbour-gate-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/harbour-gate",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-harbour-gate",
    "images": [
      {
        "base": "/img/harbour-gate/1",
        "caption": "Harbour Gate — the towers beyond the park and pool, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/harbour-gate/og.jpg"
  },
  {
    "slug": "creekside-18",
    "name": "Creekside 18",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 1 unit",
    "construction": "completed",
    "isNewLaunch": false,
    "district": null,
    "unitTypes": [
      "2, 3 & 4-Bedroom Apartments"
    ],
    "bedrooms": "2–4",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": "AED 4,022,888",
    "pricesFromAed": 4022888,
    "unitsListed": 1,
    "pricesFromNote": "Cheapest of the 1 unit Emaar listed on its website on 9 October 2026",
    "sizes": "1,600 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "On handover",
          "percent": 80
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 20.0,
          "date": "2026-10-09"
        },
        {
          "label": "On Handover",
          "percent": 80.0,
          "date": "2026-11-18"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Creekside 18 P2-P202, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/creekside-18"
    },
    "overview": "Twin towers in a palm-lined waterfront setting with two-, three- and four-bedroom apartments. Floor-to-ceiling windows and wide balconies face Dubai Creek Tower and Downtown; the podium carries green walkways and temperature-controlled pools.",
    "highlights": [
      "Two- to four-bedroom apartments",
      "Views of Dubai Creek Tower and Downtown",
      "Temperature-controlled pools and gym",
      "Retail centre and supermarket nearby"
    ],
    "amenities": [
      "Temperature-controlled swimming pools",
      "Start-of-the-art gym",
      "Near retail centre & supermarket"
    ],
    "nearby": null,
    "lat": 25.1945448,
    "lng": 55.3641298,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/creekside-18-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creekside-18",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creekside-18",
    "images": [
      {
        "base": "/img/creekside-18/1",
        "caption": "Creekside 18 — the two towers at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creekside-18/2",
        "caption": "Creekside 18 — aerial view over Creek Island and the marina, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creekside-18/3",
        "caption": "Creekside 18 — bedroom with a balcony over the Creek, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creekside-18/og.jpg"
  },
  {
    "slug": "grove",
    "name": "Grove",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Five buildings around an inner plaza in the heart of Creek Beach, a few steps from the 700-metre beach. Contemporary apartments with a minimal aesthetic, a community pool and an expansive outdoor play area.",
    "highlights": [
      "Five buildings around an inner plaza",
      "Steps from the 700 m beach (Emaar)",
      "Community pool, kids' pool and gym",
      "Multi-purpose community room"
    ],
    "amenities": [
      "Community Pool & Kids Pool",
      "Fully-Equipped Gym",
      "Expansive Outdoor Play Area",
      "Multi-Purpose Community Room",
      "Inner Plaza"
    ],
    "nearby": null,
    "lat": 25.1945448,
    "lng": 55.3641298,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/167402_brochure_File_359ca8b7f9_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/grove",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-grove-at-creek-beach",
    "images": [
      {
        "base": "/img/grove/1",
        "caption": "Grove — the low-rise homes on the water at Creek Beach, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/grove/2",
        "caption": "Grove — balcony view over the lagoon and beach, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/grove/3",
        "caption": "Grove — the beachfront promenade, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/grove/og.jpg"
  },
  {
    "slug": "rosewater",
    "name": "Rosewater",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [],
    "bedrooms": "3–4",
    "propertyTypes": "Villas",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Three buildings rising around an inner plaza on the lagoon at Creek Beach, with apartments of one to four bedrooms. Floor-to-ceiling windows and balconies bring in the light and the resort feel of the beach.",
    "highlights": [
      "Three buildings on the Creek Beach lagoon",
      "Apartments of one to four bedrooms",
      "Community pool, gym and barbecue areas",
      "Town centre and shopping nearby"
    ],
    "amenities": [
      "Community Pool & Kids Pool",
      "Fully Equipped Gym",
      "Barbecue Facilities",
      "Outdoor Play Area",
      "Nearby Shopping",
      "Town Centre",
      "Multi-Purpose Room"
    ],
    "nearby": null,
    "lat": 25.2044323,
    "lng": 55.3142386,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/167418_brochure_File_2f81644226_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/rosewater",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-rosewater-at-creek-beach",
    "images": [
      {
        "base": "/img/rosewater/1",
        "caption": "Rosewater — the homes along the lagoon at Creek Beach, aerial render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/rosewater/2",
        "caption": "Rosewater — bedroom overlooking the lagoon, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/rosewater/3",
        "caption": "Rosewater — kitchen and dining area, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/rosewater/og.jpg"
  },
  {
    "slug": "lotus",
    "name": "Lotus",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Four apartment buildings around a lively inner plaza in the heart of Creek Beach, minutes from the beach itself. A family-friendly cluster with its own pools, gym and outdoor play area.",
    "highlights": [
      "Four buildings around a central plaza",
      "Minutes from Creek Beach",
      "Community pool, kids' pool and gym",
      "Barbecue facilities and outdoor play area"
    ],
    "amenities": [
      "Community Pool & Kids Pool",
      "Fully Equipped Gym",
      "Barbecue Facilities",
      "Outdoor Play Area",
      "Nearby Shopping",
      "Town Centre",
      "Multi-Purpose Room"
    ],
    "nearby": null,
    "lat": 25.1945448,
    "lng": 55.3641298,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/lotus",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-lotus-at-creek-beach",
    "images": [
      {
        "base": "/img/lotus/1",
        "caption": "Lotus — the low-rise buildings around the pool plaza at Creek Beach, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lotus/2",
        "caption": "Lotus — living room opening onto the balcony, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/lotus/3",
        "caption": "Lotus — kitchen and dining area, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/lotus/og.jpg"
  },
  {
    "slug": "creek-crescent",
    "name": "Creek Crescent",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "A 22-storey tower on a four-storey amenities podium at the northern gateway to Creek Island, reached by the panoramic bridge over the canal. Townhouses line the promenade below; Emaar lists it among its recently delivered projects.",
    "highlights": [
      "22-storey tower with a 4-storey amenities podium",
      "Gateway to Creek Island by the canal bridge",
      "Townhouses along the promenade",
      "Pools, gym, BBQ pits, licensed bars and restaurants"
    ],
    "amenities": [
      "Swimming pools",
      "Gym facility",
      "Outdoor children play area",
      "BBQ pits",
      "Licensed bars and restaurants",
      "Close to Creek Island's waterfront promenade"
    ],
    "nearby": null,
    "lat": 25.21018035474534,
    "lng": 55.34673745767196,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-crescent",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-crescent",
    "images": [
      {
        "base": "/img/creek-crescent/1",
        "caption": "Creek Crescent — the towers beside the canal and Creek Island bridge, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-crescent/2",
        "caption": "Creek Crescent — the waterfront promenade below the towers, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-crescent/3",
        "caption": "Creek Crescent — living room with Creek views, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-crescent/4",
        "caption": "Creek Crescent — bedroom overlooking the water, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-crescent/og.jpg"
  },
  {
    "slug": "orchid",
    "name": "Orchid",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Apartments in a family-focused cluster footsteps from Creek Beach, with shopping, dining and leisure on the doorstep. A community pool, gym, barbecue facilities and an outdoor play area serve the residents.",
    "highlights": [
      "Apartments footsteps from Creek Beach",
      "Community pool and kids' pool",
      "Fully equipped gym and multi-purpose room",
      "Town centre and family amenities nearby"
    ],
    "amenities": [
      "Outdoor Play Area",
      "Barbecue Facilities",
      "Fully Equipped Gym",
      "Multi-Purpose Room",
      "Town Centre",
      "Community Pool & Kids' Pool"
    ],
    "nearby": null,
    "lat": 25.1945448,
    "lng": 55.3641298,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/orchid",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-orchid-at-creek-beach",
    "images": [
      {
        "base": "/img/orchid/1",
        "caption": "Orchid — the low-rise buildings around the plaza at Creek Beach, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/orchid/2",
        "caption": "Orchid — the plaza fountains and cafés, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/orchid/3",
        "caption": "Orchid — kitchen and dining area, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/orchid/og.jpg"
  },
  {
    "slug": "cedar",
    "name": "Cedar",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 8 units",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.29M",
    "startingPriceAed": 1290000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.29M AED), checked 9 October 2026",
    "pricesFrom": "AED 3,784,888",
    "pricesFromAed": 3784888,
    "unitsListed": 8,
    "pricesFromNote": "Cheapest of the 8 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,476 – 1,691 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "Three buildings rising around a central plaza in Creek Beach, with one- to three-bedroom apartments that each have a balcony or terrace. A large family pool, kids' splash pad, co-working space and direct access to the new park.",
    "highlights": [
      "Three buildings around a central plaza",
      "Large family pool, kids' pool and splash pad",
      "Direct access to the park",
      "Communal co-working space"
    ],
    "amenities": [
      "Close proximity to Vida Creek Harbour and Address Grand",
      "Direct access to the new park",
      "Large family pool and pool deck",
      "Kids' pool and splash pad",
      "Kids' play area",
      "Toddlers-only play area",
      "Outdoor landscaped seating area",
      "Gym",
      "Communal co-working space"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.20385288020851,
    "lng": 55.350723,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/321449_brochure_File_e3cd2fdfcb_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/cedar-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/cedar",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-cedar-at-creek-beach",
    "images": [
      {
        "base": "/img/cedar/1",
        "caption": "Cedar — the lagoon beach at Creek Beach, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/cedar/2",
        "caption": "Cedar — Creek Beach's low-rise homes along the water, aerial render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/cedar/3",
        "caption": "Cedar — the building facade and gardens, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/cedar/4",
        "caption": "Cedar — the neighbourhood street with fountains and cafés, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/cedar/5",
        "caption": "Cedar — living and dining room, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/cedar/6",
        "caption": "Cedar — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/cedar/7",
        "caption": "Cedar — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/cedar/og.jpg"
  },
  {
    "slug": "savanna",
    "name": "Savanna",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 1 unit",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.30M",
    "startingPriceAed": 1300000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.30M AED), checked 9 October 2026",
    "pricesFrom": "AED 4,375,888",
    "pricesFromAed": 4375888,
    "unitsListed": 1,
    "pricesFromNote": "Cheapest of the 1 unit Emaar listed on its website on 9 October 2026",
    "sizes": "1,701 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "One- to three-bedroom apartments beside a park in Creek Beach, with two town squares, a community pool and a co-working space. Creek Beach's 700 metres of sand and the infinity pool are minutes away (Emaar).",
    "highlights": [
      "Apartments beside the park in Creek Beach",
      "Community pool, kids' pool and gym",
      "Two town squares and retail nearby",
      "Co-working space"
    ],
    "amenities": [
      "Community Pool & Kids Pool",
      "Barbecue Facilities",
      "Fully Equipped Gym",
      "Expansive Outdoor Play Area",
      "Multi-Purpose Community Room",
      "Retail At Nearby",
      "Town Centre",
      "Co-Working Space"
    ],
    "nearby": [
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.20479012314967,
    "lng": 55.350819813492045,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/316109_brochure_File_9597cba292_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/savanna",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-savanna-at-creek-beach",
    "images": [
      {
        "base": "/img/savanna/1",
        "caption": "Savanna — the park lawn at Creek Beach, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/savanna/2",
        "caption": "Savanna — Creek Beach's low-rise homes along the water, aerial render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/savanna/3",
        "caption": "Savanna — the building facade and gardens, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/savanna/4",
        "caption": "Savanna — children's playground, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/savanna/5",
        "caption": "Savanna — living and dining room, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/savanna/6",
        "caption": "Savanna — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/savanna/7",
        "caption": "Savanna — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/savanna/og.jpg"
  },
  {
    "slug": "creek-waters",
    "name": "Creek Waters",
    "brand": null,
    "status": "Resale",
    "statusNote": "Under construction — sold out with Emaar; resale on request",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1,2, 3 & 4-Bedroom Apartments",
      "3-Bedroom Townhouses",
      "5-Bedroom Duplex Penthouse"
    ],
    "bedrooms": "1–5",
    "propertyTypes": null,
    "startingPrice": "AED 1.6M",
    "startingPriceAed": 1600000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.6M AED), checked 9 October 2026",
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "A high-rise on Creek Island with apartments of one to four bedrooms, three-bedroom townhouses and a five-bedroom duplex penthouse, designed around the water views of Dubai Creek. A landscaped amenities podium with an infinity pool and viewing decks.",
    "highlights": [
      "Apartments, townhouses and a duplex penthouse",
      "Infinity pool, sun deck and viewing decks",
      "Gym with pool views, kids' pool and BBQ area",
      "Creek Beach, Marina and Central Park nearby (Emaar)"
    ],
    "amenities": [
      "Infinity Pool & Sun Deck",
      "Kids' Pool & Play Area",
      "Viewing Decks",
      "Fully Equipped Gym with Pool Views",
      "BBQ Area"
    ],
    "nearby": [
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.208947494790866,
    "lng": 55.347763125359144,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/337968_brochure_File_b408b379b6_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-waters",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-waters",
    "images": [
      {
        "base": "/img/creek-waters/1",
        "caption": "Creek Waters — the towers at dusk with Creek Island bridge, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters/2",
        "caption": "Creek Waters — the waterfront podium at night, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters/3",
        "caption": "Creek Waters — rooftop terrace and plunge pool over the Creek, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters/4",
        "caption": "Creek Waters — balcony at dusk over Creek Island, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters/5",
        "caption": "Creek Waters — podium retail and cafés, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters/6",
        "caption": "Creek Waters — living room with skyline views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters/7",
        "caption": "Creek Waters — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-waters/og.jpg"
  },
  {
    "slug": "creek-waters-2",
    "name": "Creek Waters 2",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 1 unit",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1,2, 3 & 4-Bedroom Apartments",
      "3-Bedroom Townhouses",
      "5-Bedroom Duplex Penthouses"
    ],
    "bedrooms": "1–5",
    "propertyTypes": null,
    "startingPrice": "AED 1.7M",
    "startingPriceAed": 1700000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.7M AED), checked 9 October 2026",
    "pricesFrom": "AED 3,126,888",
    "pricesFromAed": 3126888,
    "unitsListed": 1,
    "pricesFromNote": "Cheapest of the 1 unit Emaar listed on its website on 9 October 2026",
    "sizes": "1,272 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": null,
    "overview": "The second Creek Waters tower on Creek Island, with one- to four-bedroom apartments, three-bedroom townhouses and five-bedroom duplex penthouses. Water views of Dubai Creek and a private landscaped podium of pools and decks.",
    "highlights": [
      "Apartments, townhouses and duplex penthouses",
      "Infinity pool, sun deck and viewing decks",
      "Gym with pool views, kids' pool and BBQ area",
      "Creek Beach, Marina and Central Park nearby (Emaar)"
    ],
    "amenities": [
      "Infinity Pool & Sun Deck",
      "Kids' Pool & Play Area",
      "Viewing Decks",
      "Fully Equipped Gym with Pool Views",
      "BBQ Area"
    ],
    "nearby": [
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.208718514356327,
    "lng": 55.34767608122684,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/355879_brochure_File_dcfeb6d834_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/creek-waters-2-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/creek-waters-2",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-waters-2",
    "images": [
      {
        "base": "/img/creek-waters-2/1",
        "caption": "Creek Waters 2 — the twin towers beside the Creek Island bridge, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters-2/2",
        "caption": "Creek Waters 2 — rooftop terrace and plunge pool over the Creek, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters-2/3",
        "caption": "Creek Waters 2 — the lagoon beach at Creek Island, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters-2/4",
        "caption": "Creek Waters 2 — podium retail and cafés, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters-2/5",
        "caption": "Creek Waters 2 — balcony at night facing Downtown Dubai, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters-2/6",
        "caption": "Creek Waters 2 — living room with skyline views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/creek-waters-2/7",
        "caption": "Creek Waters 2 — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/creek-waters-2/og.jpg"
  },
  {
    "slug": "valo",
    "name": "Valo",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Off-plan — Emaar lists 2 units",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments",
      "3-Bedroom Townhouses"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.79M",
    "startingPriceAed": 1790000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.79 MN), checked 9 October 2026",
    "pricesFrom": "AED 1,885,888",
    "pricesFromAed": 1885888,
    "unitsListed": 2,
    "pricesFromNote": "Cheapest of the 2 units Emaar listed on its website on 9 October 2026",
    "sizes": "752 – 1,810 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": {
      "text": "2028-01-31",
      "note": "'100% construction and handover' milestone on Emaar's booking page for unit DC Valo 3-304, checked 9 October 2026",
      "source": "https://www.emaar.com/en/properties/valo-at-dubai-creek-harbour"
    },
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "During construction",
          "percent": 60
        },
        {
          "label": "On handover",
          "percent": 20
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 10.0,
          "date": "2026-10-09"
        },
        {
          "label": "2nd Installment",
          "percent": 10.0,
          "date": "2026-11-18"
        },
        {
          "label": "3rd Installment",
          "percent": 10.0,
          "date": "2027-02-18"
        },
        {
          "label": "4th Installment",
          "percent": 10.0,
          "date": "2027-05-18"
        },
        {
          "label": "5th Installment",
          "percent": 20.0,
          "date": "2027-08-18"
        },
        {
          "label": "6th Installment",
          "percent": 20.0,
          "date": "2027-11-18"
        },
        {
          "label": "100% Construction and Handover",
          "percent": 20.0,
          "date": "2028-01-31"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Valo 3-304, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/valo-at-dubai-creek-harbour"
    },
    "overview": "A tower beside the main plaza in the Creek Beach district, with one- to three-bedroom apartments and three-bedroom townhouses. Built for an active life: the waterfront promenade, cycling track, skate park and sports courts are close, and the amenities podium carries the pools and gyms.",
    "highlights": [
      "Apartments and townhouses by the main plaza",
      "6,000 sq m amenities podium (Emaar)",
      "Indoor and outdoor gyms, yoga area, kids' pools",
      "Near the RTA ferry terminal and planned metro station"
    ],
    "amenities": [
      "Flexible Lawn and Kids Play Area",
      "Pool Area",
      "Indoor and Outdoor Gym",
      "Kids' Pool Area",
      "Kids' Play Area",
      "Multipurpose Room",
      "BBQ + Picnic Area",
      "Yoga Area",
      "Common Garden"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.20815752449222,
    "lng": 55.352265115340586,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/383250_brochure_File_74bf62e8b9_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/valo-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/valo-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-valo",
    "images": [
      {
        "base": "/img/valo/1",
        "caption": "Valo — the residents' entrance at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valo/2",
        "caption": "Valo — the tower above the neighbourhood plaza, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valo/3",
        "caption": "Valo — the sports park and lawns beside the tower, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valo/4",
        "caption": "Valo — garden pergola in the community park, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valo/5",
        "caption": "Valo — living room with park views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valo/6",
        "caption": "Valo — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/valo/7",
        "caption": "Valo — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/valo/og.jpg"
  },
  {
    "slug": "mangrove",
    "name": "Mangrove",
    "brand": null,
    "status": "Now selling",
    "statusNote": "Ready to move in — Emaar lists 4 units",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.48M",
    "startingPriceAed": 1480000,
    "startingPriceNote": "Emaar's advertised starting price for the project (1.48 MN AED), checked 9 October 2026",
    "pricesFrom": "AED 4,109,888",
    "pricesFromAed": 4109888,
    "unitsListed": 4,
    "pricesFromNote": "Cheapest of the 4 units Emaar listed on its website on 9 October 2026",
    "sizes": "1,613 – 1,701 sq ft",
    "sizesNote": "Sizes of the units Emaar listed on 9 October 2026",
    "handover": null,
    "paymentPlan": {
      "steps": [
        {
          "label": "On booking",
          "percent": 20
        },
        {
          "label": "On handover",
          "percent": 80
        }
      ],
      "schedule": [
        {
          "label": "1st Installment",
          "percent": 20.0,
          "date": "2026-10-09"
        },
        {
          "label": "On Handover",
          "percent": 80.0,
          "date": "2026-11-18"
        }
      ],
      "note": "Emaar's booking page schedule for unit DC Mangrove Building 1-2-201, checked 9 October 2026. Other units can differ; confirm today's terms.",
      "source": "https://www.emaar.com/en/properties/mangrove-at-dubai-creek-harbour"
    },
    "overview": "Low-rise one- to three-bedroom apartments beside a park in Creek Beach, with views over the Creek. Two town squares, a community pool, outdoor play areas and a co-working space make it a family neighbourhood close to the beach.",
    "highlights": [
      "Apartments beside the park with Creek views",
      "Community pool and kids' pool",
      "Two town squares and retail nearby",
      "Co-working space"
    ],
    "amenities": [
      "Community Pool & Kids Pool",
      "Barbecue Facilities",
      "Expansive Outdoor play Area",
      "Retail At Nearby",
      "Co-working Space"
    ],
    "nearby": [
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.20331716597765,
    "lng": 55.352113055824276,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/383970_brochure_File_42b682232e_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/mangrove-at-dubai-creek-harbour-floor-plans.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/mangrove-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-creek-beach-mangrove-at-creek-beach",
    "images": [
      {
        "base": "/img/mangrove/1",
        "caption": "Mangrove — the neighbourhood plaza and palm-lined street, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/mangrove/2",
        "caption": "Mangrove — low-rise homes along the waterfront promenade, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/mangrove/3",
        "caption": "Mangrove — residents' pool under a shade canopy, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/mangrove/4",
        "caption": "Mangrove — community lawn and park, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/mangrove/5",
        "caption": "Mangrove — living room with garden views, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/mangrove/6",
        "caption": "Mangrove — residents' lobby, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/mangrove/7",
        "caption": "Mangrove — bedroom, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/mangrove/og.jpg"
  },
  {
    "slug": "17-icon-bay",
    "name": "17 Icon Bay",
    "brand": null,
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "A tower anchored to Creek Island's parkland, flanked by the island's circular boulevard, with views of Dubai Creek Tower and the Ras Al Khor sanctuary. One- to three-bedroom apartments in neutral tones, minutes from Creek Marina.",
    "highlights": [
      "One- to three-bedroom apartments on Island Park",
      "Views of Dubai Creek Tower and the sanctuary",
      "Infinity pool and landscaped leisure deck",
      "Fitness centre and children's play area"
    ],
    "amenities": [
      "Anchored at the base of Island Park",
      "Fitness centre",
      "Children's play area",
      "Landscaped leisure deck"
    ],
    "nearby": null,
    "lat": 25.20398059999999,
    "lng": 55.3457334,
    "brochureUrl": null,
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/17-icon-bay",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-17-icon-bay",
    "images": [
      {
        "base": "/img/17-icon-bay/1",
        "caption": "17 Icon Bay — balcony view over Dubai Creek towards Downtown, render (Emaar)",
        "w": 10000,
        "h": 7137,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/17-icon-bay/2",
        "caption": "17 Icon Bay — living and dining room with Creek views, render (Emaar)",
        "w": 7000,
        "h": 3941,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/17-icon-bay/og.jpg"
  },
  {
    "slug": "address-harbour-point",
    "name": "Address Harbour Point",
    "brand": "Address-branded",
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [
      "1, 2 & 3-bedroom Waterfront Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": "Apartments",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Twin towers at the tip of Creek Island with serviced one- to three-bedroom apartments run by Address Hotels + Resorts, facing Burj Khalifa across the water. The Address hotel in the building brings dining and a health club to residents.",
    "highlights": [
      "Serviced apartments by Address Hotels + Resorts",
      "Twin towers at the tip of Creek Island",
      "Hotel restaurants, lobby and health club",
      "Temperature-controlled pool with Downtown views"
    ],
    "amenities": [
      "Food & Beverage Outlets",
      "Hotel Lobby",
      "Health Club",
      "Swimming Pool"
    ],
    "nearby": null,
    "lat": 25.20814,
    "lng": 55.3428997,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/2430_brochure_File_ec6df2a2a4_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/address-harbour-point",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-address-harbour-point",
    "images": [
      {
        "base": "/img/address-harbour-point/1",
        "caption": "Address Harbour Point — the twin towers at the tip of Creek Island, aerial render (Emaar)",
        "w": 2000,
        "h": 1504,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-harbour-point/2",
        "caption": "Address Harbour Point — Creek Marina below the towers, aerial render (Emaar)",
        "w": 2500,
        "h": 1407,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/address-harbour-point/3",
        "caption": "Address Harbour Point — bedroom with a view of the Downtown skyline, render (Emaar)",
        "w": 9933,
        "h": 7016,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/address-harbour-point/og.jpg"
  },
  {
    "slug": "palace-residences",
    "name": "Palace Residences",
    "brand": "Palace-branded",
    "status": "Ready",
    "statusNote": "Completed — Emaar lists no units; resale and rentals on request",
    "construction": "completed",
    "isNewLaunch": false,
    "district": "Creek Island",
    "unitTypes": [],
    "bedrooms": "3–5",
    "propertyTypes": "Villas",
    "startingPrice": null,
    "startingPriceAed": null,
    "startingPriceNote": null,
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "A 46-storey tower on the south-eastern promenade of Creek Island beside the Palace hotel, with on-demand five-star hotel services, concierge and valet. Creek Marina and Creek Beach are steps away.",
    "highlights": [
      "46-storey tower beside the Palace hotel",
      "On-demand hotel service, concierge and valet",
      "Infinity-edge pool, spa and gym",
      "Signature bar and grill, all-day dining"
    ],
    "amenities": [
      "On Demand 5-Star Hotel Service",
      "Valet Parking",
      "24/7 Concierge Service",
      "Infinity Edge Swimming Pool",
      "Signature Bar and Grill",
      "All-Day Dining",
      "Gym",
      "Spa",
      "Meeting Room"
    ],
    "nearby": null,
    "lat": 25.1958535,
    "lng": 55.3496384,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/167427_brochure_File_fd6de6b75c_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/palace-residences",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-palace-residences",
    "images": [
      {
        "base": "/img/palace-residences/1",
        "caption": "Palace Residences — the tower on the Creek Island waterfront, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/palace-residences/2",
        "caption": "Palace Residences — the pool facing the Creek and skyline, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/palace-residences/og.jpg"
  },
  {
    "slug": "oria",
    "name": "Oria",
    "brand": null,
    "status": "Resale",
    "statusNote": "Under construction — sold out with Emaar; resale on request",
    "construction": "under_construction",
    "isNewLaunch": false,
    "district": "Creek Beach",
    "unitTypes": [
      "1,2 & 3-Bedroom Apartments"
    ],
    "bedrooms": "1–3",
    "propertyTypes": null,
    "startingPrice": "AED 1.7M",
    "startingPriceAed": 1700000,
    "startingPriceNote": "Emaar's advertised starting price for the project (AED 1.7 Mn), checked 9 October 2026",
    "pricesFrom": null,
    "pricesFromAed": null,
    "unitsListed": null,
    "pricesFromNote": null,
    "sizes": null,
    "sizesNote": null,
    "handover": null,
    "paymentPlan": null,
    "overview": "Two towers above a community lawn in the Creek Beach district, built for an active, outdoor way of life: the waterfront promenade, an adventure playground, a cycling track, skate park and sports courts are all close by. The amenities podium carries the pools, gyms and gardens.",
    "highlights": [
      "One- to three-bedroom apartments in Creek Beach",
      "6,000 sq m amenities podium (Emaar)",
      "Indoor and outdoor gyms, yoga area, kids' pools",
      "Near the RTA ferry terminal and the planned metro station"
    ],
    "amenities": [
      "Flexible Lawn and Kids Play Area",
      "Pool Area",
      "Indoor and Outdoor Gym",
      "Kids' Pool Area",
      "Kids' Play Area",
      "Multipurpose Room",
      "BBQ + Picnic Area",
      "Yoga Area",
      "Common Garden"
    ],
    "nearby": [
      "The Viewing Point",
      "Creek Beach",
      "Creek Marina",
      "Harbour Promenade",
      "Central Park"
    ],
    "lat": 25.206355968917432,
    "lng": 55.35251706698244,
    "brochureUrl": "https://www.emaar.com/cms-media/uploads/380449_brochure_File_864967dac2_prod.pdf",
    "floorPlanUrl": "https://www.emaar.com/cms-media/uploads/dubai-creek-harbour-floor-plan.pdf",
    "emaarUrl": "https://www.emaar.com/en/properties/oria-at-dubai-creek-harbour",
    "pixUrl": "https://www.propertyindex.ae/dubai/dubai-creek-harbour-the-lagoons-oria",
    "images": [
      {
        "base": "/img/oria/1",
        "caption": "Oria — the two towers above the community lawn, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/oria/2",
        "caption": "Oria — courtyard fountain at dusk, render (Emaar)",
        "w": 1620,
        "h": 832,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/oria/3",
        "caption": "Oria — shaded playground beside the towers, render (Emaar)",
        "w": 1200,
        "h": 655,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/oria/4",
        "caption": "Oria — residents' entrance in the evening, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/oria/5",
        "caption": "Oria — living room opening onto the balcony, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/oria/6",
        "caption": "Oria — bedroom with a view of the neighbouring towers, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      },
      {
        "base": "/img/oria/7",
        "caption": "Oria — dining room, render (Emaar)",
        "w": 1024,
        "h": 768,
        "widths": [
          480,
          960,
          1600
        ]
      }
    ],
    "ogImage": "/img/oria/og.jpg"
  }
];

export const DISTRICT = {
  "intro": "Dubai Creek Harbour is Emaar's waterfront district on Dubai Creek, facing the Ras Al Khor Wildlife Sanctuary, between Downtown Dubai and Dubai International Airport. It is built around three neighbourhoods: Creek Island, Creek Beach and Green Gate.",
  "stats": [
    {
      "value": "7.4 million sq m",
      "label": "Residential space",
      "source": "https://www.emaar.com/en/blog/invest-in-dubai-creek-harbour-for-global-investors"
    },
    {
      "value": "500,000 sq m",
      "label": "Parks and open spaces",
      "source": "https://www.emaar.com/en/blog/invest-in-dubai-creek-harbour-for-global-investors"
    },
    {
      "value": "711,399 sq m",
      "label": "Serviced apartments",
      "source": "https://www.emaar.com/en/blog/invest-in-dubai-creek-harbour-for-global-investors"
    }
  ],
  "statsNote": "Figures published by Emaar.",
  "driveTimes": [
    {
      "place": "Ras Al Khor Wildlife Sanctuary",
      "minutes": 5
    },
    {
      "place": "Dubai International Airport (DXB)",
      "minutes": 10
    },
    {
      "place": "Downtown Dubai and Burj Khalifa",
      "minutes": 15
    },
    {
      "place": "Dubai Marina",
      "minutes": 25
    },
    {
      "place": "Al Maktoum International Airport",
      "minutes": 40
    }
  ],
  "driveTimesNote": "Drive times as published by Emaar.",
  "driveTimesSource": "https://www.emaar.com/en/blog/invest-in-dubai-creek-harbour-for-global-investors",
  "places": [
    {
      "title": "Creek Beach",
      "body": "Dubai's first urban beach: 700 metres of white sand with an infinity pool and sunset views across the water (Emaar).",
      "image": "creek-beach"
    },
    {
      "title": "The Viewing Point",
      "body": "A 70-metre cantilever over Dubai Creek, looking across the sanctuary towards the Downtown skyline (Emaar).",
      "image": "viewing-point"
    },
    {
      "title": "Creek Marina and the Harbour Promenade",
      "body": "A yacht club, promenade dining and boat trips on the water; an RTA ferry terminal serves the district.",
      "image": "creek-marina"
    },
    {
      "title": "Central Park and Creek Play",
      "body": "A park the size of six football fields with a promenade, amphitheatre, skate park and dog park, and a 350-metre playscape with seven activity nodes (Emaar).",
      "image": "central-park"
    },
    {
      "title": "Ras Al Khor Wildlife Sanctuary",
      "body": "A Ramsar-listed wetland across the water, home to more than 20,000 water birds and 201 species, flamingos among them (Emaar).",
      "image": "sanctuary"
    },
    {
      "title": "Emaar Properties metro station",
      "body": "A Dubai Metro Blue Line station, 74 metres tall and designed by SOM, is being built inside the district for 2029, linking to the Red and Green lines (Emaar).",
      "image": "metro"
    }
  ],
  "placesSource": [
    "https://www.emaar.com/en/blog/dubai-creek-harbour-guide",
    "https://www.emaar.com/en/blog/invest-in-dubai-creek-harbour-for-global-investors",
    "https://www.emaar.com/en/blog/dubai-creek-harbour-living-and-the-mesmerising-beauty-of-ras-al-khor-sanctuary",
    "https://www.emaar.com/en/blog/why-dubai-creek-harbour-is-one-of-dubai-best-waterfront-destinations",
    "https://www.emaar.com/en/blog/dubai-metro-blue-line-emaar-to-name-worlds-tallest-station"
  ],
  "everyday": "Schools, a Mediclinic hospital, four hotels (Vida Creek Beach, Vida Creek Harbour, Address Creek Harbour and Palace Dubai Creek Harbour), promenade restaurants and a planned Dubai Square retail district — all named by Emaar for the district.",
  "neighbourhoods": [
    {
      "name": "Creek Island",
      "body": "The original island quarter: Creek Marina, Island Park, the Palace, Vida and Address hotels, and most of the completed towers."
    },
    {
      "name": "Creek Beach",
      "body": "The low-rise beach quarter along the canal, with the lagoon beach, the plaza and the newer towers such as Oria, Valo, Aeon and Altus."
    },
    {
      "name": "Green Gate",
      "body": "The newest quarter beside Green Gate Sports Park and the golf course views, where Lyvia, Altan and Silva are rising."
    }
  ],
  "images": {
    "hero": {
      "base": "/img/district/1",
      "caption": "Creek Marina and the Creek Island towers with the Downtown skyline — render (Emaar)",
      "w": 2000,
      "h": 1027,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "creek-beach": {
      "base": "/img/district/2",
      "caption": "Creek Beach lagoon from the air — render (Emaar)",
      "w": 1920,
      "h": 1080,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "viewing-point": {
      "base": "/img/district/3",
      "caption": "The Viewing Point at sunset — photo (Emaar)",
      "w": 1920,
      "h": 1080,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "creek-marina": {
      "base": "/img/district/4",
      "caption": "Creek Marina — photo (Emaar)",
      "w": 1920,
      "h": 1080,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "sanctuary": {
      "base": "/img/district/5",
      "caption": "Balcony view over the Ras Al Khor mangroves and the Creek — render (Emaar)",
      "w": 1600,
      "h": 821,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "metro": {
      "base": "/img/district/6",
      "caption": "Emaar Properties metro station on the Blue Line — render (Emaar)",
      "w": 1920,
      "h": 1080,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "creek-island": {
      "base": "/img/district/7",
      "caption": "Creek Island at night — aerial render (Emaar)",
      "w": 1440,
      "h": 959,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "creek-beach-aerial": {
      "base": "/img/district/8",
      "caption": "Creek Beach and the marina from the air — render (Emaar)",
      "w": 1600,
      "h": 821,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "green-gate": {
      "base": "/img/district/9",
      "caption": "Lyvia by Palace rising over Green Gate — render (Emaar)",
      "w": 1620,
      "h": 832,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "map": {
      "base": "/img/district/10",
      "caption": "Dubai Creek Harbour on Emaar's location map — Emaar",
      "w": 1456,
      "h": 914,
      "widths": [
        480,
        960,
        1600
      ]
    },
    "the-grand": {
      "base": "/img/district/11",
      "caption": "Creek Island skyline with the planned Dubai Creek Tower — render (Emaar, 2018 launch release)",
      "w": 653,
      "h": 326,
      "widths": [
        480,
        960
      ]
    }
  }
};

/** District image by key; undefined when the key is unknown. */
export const districtImage = (key: string): ProjectImage | undefined => (DISTRICT.images as Record<string, ProjectImage>)[key];

export const GUIDE = {
  "checked": "Checked against Emaar's published terms on 9 October 2026",
  "newFromEmaar": [
    {
      "step": "Reserve a unit",
      "body": "You reserve a specific unit with a booking fee, online or at the sales centre. Emaar then issues the reservation form and payment plan for signature and a property specialist confirms the unit within one working day. You need your passport, nationality and country of residence."
    },
    {
      "step": "Pay the down payment",
      "body": "At Emaar launches bought through the Emaar Preferred Access Programme, Emaar's published terms ask for at least 20% of the price at the time of purchase, and do not allow a transfer until at least 50% has been paid. Outside the programme, your sale agreement sets the terms.",
      "source": "https://www.emaar.com/en/faq"
    },
    {
      "step": "Sign the sale agreement",
      "body": "Emaar says it typically issues the Sales and Purchase Agreement 21–40 days after a launch purchase, once the down payment, DLD registration charge and Oqood fee have cleared. It is in English, names the Emaar subsidiary selling the project, gives an estimated completion date and sets the instalment terms. Decide the names on the contract first: adding or removing one later counts as a transfer.",
      "source": "https://www.emaar.com/en/faq"
    },
    {
      "step": "Register with the Dubai Land Department",
      "body": "Your purchase is pre-registered in DLD's interim register (Oqood). Emaar's FAQ puts the DLD registration fee at 4% of the contract value, paid to the Land Department; Emaar says pre-registration is required by law and is a condition of taking possession.",
      "source": "https://www.emaar.com/en/faq"
    },
    {
      "step": "Pay instalments into escrow",
      "body": "Every instalment goes by cheque or bank transfer into the project's escrow account, in AED — never cash and never to a personal account. Emaar's finance team confirms the escrow details for each project.",
      "source": "https://www.emaar.com/cms-media/uploads/Finance_Fact_Sheet_a645471c4c_prod.pdf"
    },
    {
      "step": "Home orientation and handover",
      "body": "Before keys, Emaar walks you through the home once and logs any snags for the contractor; cosmetic marks must be raised at that visit. For handover you bring the certificate of completion of payment, the land-registration application, your DEWA deposit receipt and your passport. Emaar's defect-liability period for the unit is one year.",
      "source": "https://www.emaar.com/cms-media/uploads/handover_factsheet_latest_08_10_2020_13abb40c87_prod.pdf"
    },
    {
      "step": "Title deed",
      "body": "After full payment you apply for land registration through Emaar (admin fee AED 525 including VAT, about 30 days) and DLD emails an electronic title deed. Buyers on a post-handover payment plan receive the deed once the plan is paid.",
      "source": "https://www.emaar.com/cms-media/uploads/land_registration_002_72aa09c478_prod.pdf"
    }
  ],
  "resale": [
    {
      "step": "Agree the price",
      "body": "On a sold-out tower you buy from an existing owner. For an off-plan resale you normally reimburse what the seller has paid, agree any premium, and take over the remaining instalments."
    },
    {
      "step": "Emaar's no-objection certificate",
      "body": "Transfers need Emaar's NOC: AED 5,000 plus 5% VAT for a primary (off-plan) transfer, AED 500 plus VAT after handover, valid for 15 days. All dues must be clear and both parties attend.",
      "source": "https://www.emaar.com/cms-media/uploads/Property_Transfer_61fae63e4a_prod.pdf"
    },
    {
      "step": "Transfer at the Land Department",
      "body": "The transfer completes at DLD, which charges its registration fee again on the new sale. A mortgaged unit needs the bank's clearance letter first.",
      "source": "https://www.emaar.com/en/faq"
    }
  ],
  "overseas": [
    "You can buy with just a passport; you do not need to live in the UAE.",
    "Sign remotely or through a power of attorney notarised at the UAE embassy and attested by the UAE Ministry of Foreign Affairs.",
    "Instalments go by international transfer into the project escrow account, in AED, converted at your own bank.",
    "Emaar does not issue visit visas for handover; a representative can attend the home orientation and handover for you.",
    "Post-handover instalments need UAE cheques or a property manager."
  ],
  "overseasSource": [
    "https://www.emaar.com/en/blog/guide-to-dubai-property-investment-for-first-time-international-investors",
    "https://www.emaar.com/cms-media/uploads/handover_factsheet_latest_08_10_2020_13abb40c87_prod.pdf",
    "https://www.emaar.com/cms-media/uploads/Finance_Fact_Sheet_a645471c4c_prod.pdf",
    "https://www.emaar.com/en/faq"
  ]
};

export const COSTS = {
  "title": "What you pay on top of the price",
  "note": "Emaar's published figures as of 9 October 2026. Confirm the current amounts with us before you commit.",
  "items": [
    {
      "label": "DLD registration fee",
      "value": "4% of the contract value",
      "detail": "Paid to the Dubai Land Department; Emaar collects it at purchase.",
      "source": "https://www.emaar.com/en/faq"
    },
    {
      "label": "Mortgage registration (if financed)",
      "value": "0.25% of the loan + AED 10",
      "detail": "Dubai Land Department fee. Emaar charges a further AED 5,000 to register the mortgage.",
      "source": "https://www.emaar.com/en/faq"
    },
    {
      "label": "Emaar transfer NOC (resale)",
      "value": "AED 5,000 + VAT off-plan · AED 500 + VAT after handover",
      "detail": "Valid 15 days.",
      "source": "https://www.emaar.com/cms-media/uploads/Property_Transfer_61fae63e4a_prod.pdf"
    },
    {
      "label": "Title deed application",
      "value": "AED 525 incl. VAT",
      "detail": "Emaar's administration fee; DLD's own issuance fee applies on top.",
      "source": "https://www.emaar.com/cms-media/uploads/land_registration_002_72aa09c478_prod.pdf"
    },
    {
      "label": "DEWA security deposit",
      "value": "AED 2,000 for an apartment",
      "detail": "Plus connection charges, before handover. DEWA may change it.",
      "source": "https://www.emaar.com/cms-media/uploads/EMAAR_DEWA_FACTSHEET_22_April_1dc6e8e928_prod.pdf"
    },
    {
      "label": "Service charges",
      "value": "Set yearly per building",
      "detail": "Approved by RERA through DLD's Mollak system and published on DLD's Service Charge Index. Ask us for the approved rate of the exact tower; the first year is paid before handover.",
      "source": "https://www.emaar.com/cms-media/uploads/Finance_Fact_Sheet_a645471c4c_prod.pdf"
    }
  ],
  "vat": "Emaar's administration and booking fees include 5% VAT. The purchase price of a new home bought from the developer is zero-rated for VAT."
};

export const FAQ = [
  {
    "q": "Is this Emaar's website?",
    "a": "No. DXB Creek Harbour is an independent property showcase run by a Dubai broker. The projects are developed by Emaar Properties; we help buyers compare them, find available units and buy. This site is not owned, operated or endorsed by Emaar."
  },
  {
    "q": "Are the prices current?",
    "a": "Every price is Emaar's own published figure, checked on 9 October 2026: the advertised starting price for the project and, where Emaar lists units, the cheapest unit on its site that day. Prices and availability change often — message us on WhatsApp for today's price list."
  },
  {
    "q": "What do 'Now selling', 'Ready' and 'Resale' mean here?",
    "a": "'Now selling' means Emaar listed units for sale on its website when we checked. 'Ready' means the Dubai Land Department records the building as completed and Emaar lists no units, so you buy from an owner. 'Resale' means the tower is still under construction and sold out with Emaar, so you take over an owner's contract and payment plan."
  },
  {
    "q": "Can foreigners buy in Dubai Creek Harbour?",
    "a": "Yes. Emaar states that all properties in Dubai Creek Harbour are freehold, with full ownership rights for UAE nationals and foreign investors, and that non-residents can buy with a valid passport. Foreign freehold ownership in Dubai is allowed in areas designated under Law No. 7 of 2006.",
    "source": "https://www.emaar.com/en/property-for-sale/dubai-creek-harbour"
  },
  {
    "q": "Does buying here get me a residence visa?",
    "a": "Property worth at least AED 2 million, in your name, can qualify you for a long-term UAE Golden Residence; DLD runs the Dubai application, and a mortgaged property can qualify with a bank letter stating what you have paid. Owners of any Dubai property can also apply through DLD's Taskeen service for a renewable two-year residence visa (a jointly owned share must be at least AED 400,000). Emaar does not sponsor visas itself. Rules change — we check the current requirements with you.",
    "source": "https://www.emaar.com/en/blog/dubai-investor-visa-guide-requirements-eligibility-and-benefits-2026"
  },
  {
    "q": "Can I buy with a mortgage?",
    "a": "On a completed unit, yes — UAE banks lend to residents and non-residents, within the Central Bank's loan-to-value caps. Off-plan is mostly a cash-flow purchase: the Central Bank caps a mortgage on a unit under construction at 50% of its value, and Emaar says some projects come with bank pre-approval for up to 50%, renewable yearly until handover. Emaar registers the mortgage for AED 5,000 and DLD charges 0.25% of the loan plus AED 10.",
    "source": "https://www.emaar.com/en/faq"
  },
  {
    "q": "How is my money protected on an off-plan purchase?",
    "a": "Dubai's escrow law requires every instalment to be paid into a project-specific escrow account controlled by an escrow agent, and the sale must be recorded in DLD's interim register (Oqood). Ask us for the project's escrow account details and cross-check them with Emaar before you transfer."
  },
  {
    "q": "What are the service charges?",
    "a": "Service charges are an annual cost per unit, set each year from a budget that RERA approves through DLD's Mollak system; the approved rate for any building is public on DLD's Service Charge Index. We quote the approved rate for the exact tower — never an estimate."
  },
  {
    "q": "Can I rent it out?",
    "a": "Yes. Emaar says you are free to lease the home once it is handed over. Long-term lets are registered with Ejari; short-term holiday letting needs a permit from Dubai's Department of Economy and Tourism.",
    "source": "https://www.emaar.com/en/faq"
  },
  {
    "q": "Can I sell before handover?",
    "a": "Yes, with Emaar's no-objection certificate (AED 5,000 plus VAT, valid 15 days), once you have paid the minimum share set in your sale agreement and all dues are clear. The new buyer's contract is issued at Emaar's original price and any premium is settled between you; the transfer completes at DLD.",
    "source": "https://www.emaar.com/cms-media/uploads/Property_Transfer_61fae63e4a_prod.pdf"
  },
  {
    "q": "How do I get a brochure or floor plans?",
    "a": "Where Emaar publishes a brochure or floor plans, the links are on the project page. For anything else, tap WhatsApp and we'll send it over."
  }
];
