export interface Project {
  slug: string;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  url?: string;
  image?: string;
  previewVideo?: string;
  view?: "about";
  year: string;
  status: string;
  accent: string;
  accentRgb: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: "about-me",
    index: "01",
    title: "About Me",
    subtitle: "Persönlicher Profilkanal.",
    category: "System Channel",
    description: "Persönliche Informationen über D. Henschel.",
    view: "about",
    year: "2026",
    status: "SYSTEM",
    accent: "#2488ff",
    accentRgb: "36 136 255",
    tags: ["Profil", "Portfolio"],
  },
  {
    slug: "github",
    index: "02",
    title: "GitHub",
    subtitle: "Code, Projekte und Experimente.",
    category: "Developer Profile",
    description:
      "Das GitHub-Profil von dhenschel mit öffentlichen Repositories, Projekten und aktuellen Entwicklungsarbeiten.",
    url: "https://github.com/dhenschel",
    image: "/projects/github.svg",
    year: "2026",
    status: "ONLINE",
    accent: "#181717",
    accentRgb: "24 23 23",
    tags: ["GitHub", "Code", "Open Source"],
  },
  {
    slug: "clipcollection",
    index: "03",
    title: "ClipCollection",
    subtitle: "Deine Clips. Eine Sammlung.",
    category: "Video Gallery",
    description:
      "Eine zentrale Galerie für kuratierte Video-Clips mit Kategorien, Filtern und direktem Zugriff auf die Sammlung.",
    url: "https://clipcollection.de/",
    image: "/projects/clipcollection.jpg",
    year: "2026",
    status: "ONLINE",
    accent: "#f2f4f7",
    accentRgb: "242 244 247",
    tags: ["Gallery", "Video", "Web App"],
  },
  {
    slug: "cozysite",
    index: "04",
    title: "CozySite",
    subtitle: "Ein Playground für kleine Ideen.",
    category: "Interactive Playground",
    description:
      "Ein verspieltes Web-Experiment mit konfigurierbarem Entenregen, überraschenden Events und viel Raum für neue Ideen.",
    url: "https://www.cozysite.de/",
    image: "/projects/cozysite.jpg",
    year: "2026",
    status: "ONLINE",
    accent: "#bae9ff",
    accentRgb: "186 233 255",
    tags: ["Creative Code", "Interaction", "Playground"],
  },
  {
    slug: "lava-restaurant",
    index: "05",
    title: "Restaurant Lava",
    subtitle: "Digitale Heimat für ein Restaurant.",
    category: "Business Website",
    description:
      "Eine kompakte Restaurant-Website mit Speisekarte, Öffnungszeiten, Standort und direkter Kontaktmöglichkeit.",
    url: "https://lava-restaurant.com/",
    image: "/projects/lava-restaurant.jpg",
    previewVideo: "/projects/previews/lava-restaurant.mp4",
    year: "2025–2026",
    status: "ONLINE",
    accent: "#d19a55",
    accentRgb: "209 154 85",
    tags: ["Restaurant", "Content", "Responsive"],
  },
  {
    slug: "bootbucht24",
    index: "06",
    title: "BootBucht24",
    subtitle: "Gebrauchte Boote. Verdächtig günstig.",
    category: "Satirical Marketplace",
    description:
      "Ein humorvoller Fake-Marktplatz für gebrauchte Boote mit Suche, Filtern und Angeboten, die Besucher unerwartet auf Kurs bringen.",
    url: "https://dhenschel.github.io/BootBucht24/",
    image: "/projects/bootbucht24.jpg",
    year: "2026",
    status: "ONLINE",
    accent: "#116466",
    accentRgb: "17 100 102",
    tags: ["Satire", "Marketplace", "Vanilla JS"],
  },
];
