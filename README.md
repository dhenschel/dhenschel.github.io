# dhenschel.de

Geplantes persönliches Softwareentwickler-Portfolio für
[www.dhenschel.de](https://www.dhenschel.de), statisch gehostet über GitHub
Pages.

Die visuelle Leitidee ist ein hochwertiger **Developer Console Hub**: Projekte
werden wie Titel in einer modernen Spielebibliothek präsentiert, bleiben aber
als klassische Portfolio-Inhalte klar, schnell und barrierearm erreichbar.

## Projektstatus

**Phase 1 – funktionsfähiger visueller Prototyp**

Die Website ist als statisches Astro-Projekt umgesetzt. Der Console Hub, eine
erste Case Study, responsive Layouts, reduzierte Bewegung, SEO-Grundlagen und
das GitHub-Pages-Deployment sind vorhanden. Die vorbereiteten Projekt-Slots
werden als Nächstes mit echten Inhalten belegt.

## Dokumentation

- [Produkt- und Designplan](docs/PLAN.md)
- [Technische Architektur](docs/ARCHITECTURE.md)
- [Inhalte, die für die Umsetzung benötigt werden](docs/CONTENT.md)
- [GitHub-Pages- und Domain-Setup](docs/DEPLOYMENT.md)
- [Designreferenzen und Erkenntnisse](docs/REFERENCES.md)

## Stack

- Astro mit TypeScript für eine statische, schnelle Website
- CSS Custom Properties und komponentennahes CSS für ein eigenes Designsystem
- Astro Content Collections für Projekte und spätere Case Studies
- kleine JavaScript-Inseln nur für Hub-Navigation, Filter und Animationen
- GitHub Actions für Prüfung, Build und Deployment nach GitHub Pages

Der Stack ist bewusst statisch und wartungsarm. Die Konsolenwirkung entsteht
über Layout, Typografie, CSS-Grafik und gezielte 2D-Interaktion – ohne schweres
3D-Framework oder Drittanbieter-Skripte.

## Lokale Entwicklung

Voraussetzung: Node.js 24 und npm.

```bash
npm install
npm run dev
```

Weitere Befehle:

```bash
npm run check        # Astro- und TypeScript-Prüfung
npm run format:check # Formatprüfung
npm run build        # Produktions-Build nach dist/
npm run preview      # lokalen Produktions-Build ansehen
```

Ein Push auf `main` baut und veröffentlicht die Website automatisch über GitHub
Actions. Die kanonische Produktionsadresse ist `https://www.dhenschel.de`.

## Lizenz

Noch keine Open-Source-Lizenz festgelegt. Inhalte, Texte, Bilder und Branding
sind nicht automatisch zur Weiterverwendung freigegeben.
