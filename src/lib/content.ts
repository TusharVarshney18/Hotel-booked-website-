import { unsplash } from "@/lib/images";

export const experiences = [
  {
    slug: "after-hours",
    title: "After hours",
    kicker: "Access",
    description:
      "Museums, palaces and ateliers once the public has gone. A curator, a key, and an hour that cannot be bought at the door.",
    image: unsplash("photo-1551882547-ff40c63fe5fa"),
  },
  {
    slug: "table",
    title: "A table, somewhere",
    kicker: "Dining",
    description:
      "Chefs who cook for a house, not a room. Sandbanks, courtyards, cellars and cliffs — dinner as a private act.",
    image: unsplash("photo-1414235077428-338989a2e8c0"),
  },
  {
    slug: "water",
    title: "On the water",
    kicker: "Voyage",
    description:
      "Launches, dhonis, gozzi and yachts. Arrival by keel is still the most civilised way to appear.",
    image: unsplash("photo-1439066615861-d1af74d74000"),
  },
  {
    slug: "ritual",
    title: "The ritual",
    kicker: "Spa",
    description:
      "Hammams, hinoki, Ayurveda and jungle pavilions. Treatments written for the house, not a menu.",
    image: unsplash("photo-1540555700478-4be289fbecef"),
  },
];

export const testimonials = [
  {
    quote:
      "They did not give us a welcome drink. They gave us the feeling that the house had been waiting, which is rarer.",
    name: "Ananya Rao",
    detail: "Jal Mahal · twelve nights",
  },
  {
    quote:
      "I have a great many hotels. I have one residence I return to. Aurelia understands the difference.",
    name: "Henri Morel",
    detail: "Hôtel Aurelia · member since 2019",
  },
  {
    quote:
      "The bill was considerable. The silence was worth more. I cannot remember the last time I was so thoroughly left alone, and so thoroughly looked after.",
    name: "Priya & Kabir Malhotra",
    detail: "Aurelia Atoll · honeymoon",
  },
];

export const pillars = [
  {
    number: "01",
    title: "Houses, not hotels",
    body: "Each residence is privately held. We do not franchise, dilute, or add a wing because the season was good.",
  },
  {
    number: "02",
    title: "Names, not numbers",
    body: "Staff are briefed on how you take your tea, not on a points balance. There is no category of guest we prefer.",
  },
  {
    number: "03",
    title: "The unadvertised hour",
    body: "What we arrange is often not on a page: a closed museum, a still lagoon, a table that does not exist.",
  },
];

export const circleTiers = [
  {
    name: "Guest",
    price: "By invitation of a stay",
    perks: [
      "Preferred dates across the collection",
      "Direct line to house concierge",
      "Late departure when the room allows",
    ],
  },
  {
    name: "Circle",
    price: "₹4,50,000 / year",
    perks: [
      "Guaranteed suite on 14 days' notice",
      "Airport rituals in every city we keep",
      "One complimentary extra each stay",
      "Private sale of unlisted houses",
    ],
  },
  {
    name: "Residence",
    price: "₹18,00,000 / year",
    perks: [
      "A hold on your preferred suite",
      "Member events in Paris, Udaipur, Kyoto",
      "Family bookings at Circle tariff",
      "A dedicated Aurelia secretary",
    ],
  },
];
