# dhenschel.de

Persönliches Softwareentwickler-Portfolio für
[www.dhenschel.de](https://www.dhenschel.de), statisch gehostet über GitHub
Pages.

**Aktuelle Vorschau:** [dhenschel.github.io](https://dhenschel.github.io/)

Die visuelle Leitidee ist eine persönliche **Website Console**: Projekte werden
wie Kanäle in einem mehrzeiligen Konsolen-Home-Menü präsentiert, erhalten ein
eigenes Cover und lassen sich direkt aus der Galerie starten.

## Projektstatus

**Phase 4 – persönliches Konsolen-Home-Menü**

Die Website ist als statisches Astro-Projekt umgesetzt. ClipCollection,
CozySite, Restaurant Lava und BootBucht24 sind mit eigenen Covers und direkten
Links eingebunden. Das aufgeräumte, Nintendo-inspirierte Systemmenü besitzt ein
responsives 4×3-Kanalraster, feste Leisten, einen hellen und einen tiefblauen
dunklen Modus sowie einen auffälligen Profil-Start mit animiertem Mauszeiger und
optionalen UI-Klängen. Beim Öffnen wächst die gewählte Website-Kachel bis auf
Bildschirmgröße und blendet anschließend zur Zielseite über. Das Portrait wird
zentral über ein austauschbares Bild-Asset gepflegt.

## Dokumentation

- [Produkt- und Designplan](docs/PLAN.md)
- [Technische Architektur](docs/ARCHITECTURE.md)
- [Inhalte, die für die Umsetzung benötigt werden](docs/CONTENT.md)
- [GitHub-Pages- und Domain-Setup](docs/DEPLOYMENT.md)
- [Designreferenzen und Erkenntnisse](docs/REFERENCES.md)

## Stack

- Astro mit TypeScript für eine statische, schnelle Website
- CSS Custom Properties und komponentennahes CSS für ein eigenes Designsystem
- ein strukturierter TypeScript-Datensatz für Projekte und spätere Titel
- kleine JavaScript-Inseln für Uhrzeit, Theme, Startup-, Kontakt- und
  Startanimation
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
Actions. Das Repository ist
[dhenschel/dhenschel.github.io](https://github.com/dhenschel/dhenschel.github.io).
Die kanonische Produktionsadresse wird nach der noch ausstehenden
DNS-Umstellung `https://www.dhenschel.de`.

## Lizenz

Noch keine Open-Source-Lizenz festgelegt. Inhalte, Texte, Bilder und Branding
sind nicht automatisch zur Weiterverwendung freigegeben.
