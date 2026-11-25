import type { Movie } from "@/types/cinema";

export const movies: Movie[] = [
  {
    id: "quiet-beyond",
    title: "The Quiet Beyond",
    genre: "Mystery / Adventure",
    releaseYear: 2026,
    runtime: "1h 58m",
    synopsis:
      "At the edge of a world falling silent, a cartographer follows a light that appears on no map. Some journeys begin where the known world ends.",
    poster: "/images/quiet-beyond.webp",
    backdrop: "/images/quiet-beyond.webp",
    accentColor: "#F1AE64",
    featured: true,
    format: "Film",
    availability: "Original editorial collection · Playback unavailable",
  },
  {
    id: "last-train",
    title: "The Last Train North",
    genre: "Adventure / Drama",
    releaseYear: 2025,
    runtime: "1h 46m",
    synopsis:
      "A conductor makes one final journey through the mountains, carrying a letter that could bring two strangers home.",
    poster: "/images/last-train.webp",
    backdrop: "/images/last-train.webp",
    accentColor: "#7FC9C2",
    featured: true,
    format: "Film",
    availability: "Original editorial collection · Playback unavailable",
  },
  {
    id: "velvet-hours",
    title: "Velvet Hours",
    genre: "Thriller / Drama",
    releaseYear: 2025,
    runtime: "6 episodes",
    synopsis:
      "One rain-soaked city. Six letters never delivered. A night-shift translator discovers that every stranger has a story worth finding.",
    poster: "/images/velvet-hours.webp",
    backdrop: "/images/velvet-hours.webp",
    accentColor: "#d18b93",
    featured: true,
    format: "Series",
    availability: "Original editorial collection · Playback unavailable",
  },
  {
    id: "tides",
    title: "Where the Tides Go",
    genre: "Drama / Discovery",
    releaseYear: 2024,
    runtime: "1h 42m",
    synopsis:
      "An oceanographer returns to the island she left behind and discovers a family history written in the changing tides.",
    poster: "/images/tides.webp",
    backdrop: "/images/tides.webp",
    accentColor: "#7FC9C2",
    featured: false,
    format: "Film",
    availability: "Original editorial collection · Playback unavailable",
  },
  {
    id: "afterlight",
    title: "Afterlight",
    genre: "Drama / Adventure",
    releaseYear: 2023,
    runtime: "1h 51m",
    synopsis:
      "A photographer follows the last light across a desert, piecing together the life of the mother she barely knew.",
    poster: "/images/afterlight.webp",
    backdrop: "/images/afterlight.webp",
    accentColor: "#e59469",
    featured: false,
    format: "Film",
    availability: "Original editorial collection · Playback unavailable",
  },
];

export const faqs = [
  {
    question: "What is Flurzi Cinema?",
    answer:
      "Flurzi Cinema brings movie and television discovery together. Explore the collection, read title details and check availability in your account.",
  },
  {
    question: "How do memberships work?",
    answer:
      "Membership pricing and plan availability will be shown before purchase. Payments are currently unavailable.",
  },
  {
    question: "Can I watch on different devices?",
    answer:
      "Flexible viewing across devices is part of the product direction. Supported devices, simultaneous streams and offline viewing will be confirmed before launch. You can explore this website on desktop, tablet and mobile.",
  },
  {
    question: "Can I watch with friends?",
    answer:
      "Cinema Rooms offers a private space for a shared movie night. Open Cinema Rooms in your account to check availability. Every viewer needs their own playback access.",
  },
  {
    question: "How will content availability work?",
    answer:
      "Playback depends on licensing and regional availability. Original editorial artwork and title listings do not grant streaming access.",
  },
  {
    question: "How will subscriptions be managed?",
    answer:
      "Account and subscription management are planned for a later phase. Billing, cancellation, refunds and subscription policies will be defined before memberships are offered.",
  },
];
