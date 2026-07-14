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
  placeholder?: boolean;
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
  {
    slug: "next-project",
    index: "04",
    title: "Nächster Kanal",
    subtitle: "Dieser Slot wartet auf die nächste Idee.",
    category: "Coming Soon",
    description:
      "Die Bibliothek ist bewusst erweiterbar. Neue Websites erscheinen später wie neue Spiele direkt in diesem Menü.",
    year: "SOON",
    status: "EMPTY SLOT",
    accent: "#d7c7ff",
    accentRgb: "215 199 255",
    tags: ["New Project", "In Progress"],
    placeholder: true,
  },
  {
    slug: "free-channel-05",
    index: "05",
    title: "Freier Kanal",
    subtitle: "Platz für eine weitere Website.",
    category: "Coming Soon",
    description: "Ein freier Platz im Home-Menü für ein kommendes Projekt.",
    year: "SOON",
    status: "EMPTY SLOT",
    accent: "#f7b8d4",
    accentRgb: "247 184 212",
    tags: ["New Project"],
    placeholder: true,
  },
  {
    slug: "free-channel-06",
    index: "06",
    title: "Freier Kanal",
    subtitle: "Platz für eine weitere Website.",
    category: "Coming Soon",
    description: "Ein freier Platz im Home-Menü für ein kommendes Projekt.",
    year: "SOON",
    status: "EMPTY SLOT",
    accent: "#b8c8ff",
    accentRgb: "184 200 255",
    tags: ["New Project"],
    placeholder: true,
  },
];
