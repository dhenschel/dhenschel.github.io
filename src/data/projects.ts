export interface Project {
  slug: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  role: string;
  stack: string[];
  status: string;
  mark: string;
  tone: "mint" | "coral" | "violet" | "amber";
  href?: string;
  placeholder?: boolean;
}

export const projects: Project[] = [
  {
    slug: "dhenschel-de",
    index: "01",
    eyebrow: "Portfolio / 2026",
    title: "dhenschel.de",
    description:
      "Ein schneller, barrierebewusster Portfolio-Hub, der Projekte wie eine kuratierte Spielebibliothek inszeniert.",
    role: "Konzept · Design · Entwicklung",
    stack: ["Astro", "TypeScript", "GitHub Pages"],
    status: "IN BUILD",
    mark: "DH",
    tone: "mint",
    href: "/projekte/dhenschel-de/",
  },
  {
    slug: "web-products",
    index: "02",
    eyebrow: "Collection / Web",
    title: "Web Products",
    description:
      "Hier landen produktorientierte Websites und Anwendungen mit klarer UX und sauberer technischer Basis.",
    role: "Reservierter Projekt-Slot",
    stack: ["Frontend", "UX", "Performance"],
    status: "SLOT READY",
    mark: "WP",
    tone: "coral",
    placeholder: true,
  },
  {
    slug: "tools-systems",
    index: "03",
    eyebrow: "Collection / Systems",
    title: "Tools & Systems",
    description:
      "Ein Platz für Werkzeuge, APIs und technische Systeme, die Abläufe einfacher oder zuverlässiger machen.",
    role: "Reservierter Projekt-Slot",
    stack: ["APIs", "Automation", "Architecture"],
    status: "SLOT READY",
    mark: "TS",
    tone: "violet",
    placeholder: true,
  },
  {
    slug: "experiments",
    index: "04",
    eyebrow: "Collection / Lab",
    title: "Experiments",
    description:
      "Kleine Prototypen und technische Versuche bekommen hier Raum für Ideen außerhalb des Hauptpfads.",
    role: "Reservierter Projekt-Slot",
    stack: ["Creative Code", "Prototypes", "Learning"],
    status: "LAB OPEN",
    mark: "EX",
    tone: "amber",
    placeholder: true,
  },
];
