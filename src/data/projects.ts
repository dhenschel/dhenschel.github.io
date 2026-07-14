export interface Project {
  slug: string;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  url?: string;
  image?: string;
  year: string;
  status: string;
  accent: string;
  accentRgb: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: "clipcollection",
    index: "01",
    title: "ClipCollection",
    subtitle: "Deine Clips. Eine Sammlung.",
    category: "Video Gallery",
    description:
      "Eine zentrale Galerie für kuratierte Video-Clips mit Kategorien, Filtern und direktem Zugriff auf die Sammlung.",
    url: "https://clipcollection.de/",
    image: "/projects/clipcollection.png",
    year: "2026",
    status: "ONLINE",
    accent: "#f2f4f7",
    accentRgb: "242 244 247",
    tags: ["Gallery", "Video", "Web App"],
  },
  {
    slug: "cozysite",
    index: "02",
    title: "CozySite",
    subtitle: "Ein Playground für kleine Ideen.",
    category: "Interactive Playground",
    description:
      "Ein verspieltes Web-Experiment mit konfigurierbarem Entenregen, überraschenden Events und viel Raum für neue Ideen.",
    url: "https://www.cozysite.de/",
    image: "/projects/cozysite.png",
    year: "2026",
    status: "ONLINE",
    accent: "#bae9ff",
    accentRgb: "186 233 255",
    tags: ["Creative Code", "Interaction", "Playground"],
  },
  {
    slug: "lava-restaurant",
    index: "03",
    title: "Restaurant Lava",
    subtitle: "Digitale Heimat für ein Restaurant.",
    category: "Business Website",
    description:
      "Eine kompakte Restaurant-Website mit Speisekarte, Öffnungszeiten, Standort und direkter Kontaktmöglichkeit.",
    url: "https://lava-restaurant.com/",
    image: "/projects/lava-restaurant.png",
    year: "2025–2026",
    status: "ONLINE",
    accent: "#d19a55",
    accentRgb: "209 154 85",
    tags: ["Restaurant", "Content", "Responsive"],
  },
];
