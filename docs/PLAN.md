# Produkt- und Designplan

Stand: 14. Juli 2026

## 1. Vision

`dhenschel.de` soll nicht wie ein austauschbares Lebenslauf-Template wirken,
sondern bereits beim ersten Besuch zeigen, dass hier Softwareentwicklung und
gestalterischer Anspruch zusammenkommen.

Die Kernidee ist eine **persönliche Website Console**: Die Startseite verhält
sich wie der Spielehub einer Wii oder PlayStation. Websites erscheinen als
auswählbare Titel mit Cover, Status, eigener Farbe und Detailansicht. Ein
Spielerprofil verbindet die Projekte sichtbar mit D. Henschel.

**Positionierung in einem Satz:**

> D. Henschel entwickelt durchdachte digitale Produkte und macht die zugrunde
> liegenden technischen Entscheidungen nachvollziehbar.

Dieser Satz ist ein Arbeitsentwurf und wird später mit der tatsächlichen Rolle
und Spezialisierung geschärft.

## 2. Zielgruppen und wichtigste Aufgaben

### Primäre Zielgruppen

1. Recruiter und Hiring Manager, die in weniger als einer Minute Profil,
   Schwerpunkte und beste Projekte verstehen möchten.
2. Technische Gesprächspartner, die Architektur, Codequalität und den eigenen
   Anteil an einem Projekt beurteilen wollen.
3. Potenzielle Auftraggeber oder Kollaborationspartner, die Stil, Verlässlichkeit
   und Kontaktmöglichkeit suchen.

### Wichtigste Nutzeraufgaben

- sofort erkennen, wer D. Henschel ist und welche Software er entwickelt;
- die besten Projekte schnell überblicken;
- Live-Website, Repository und Case Study eines Projekts öffnen;
- Technologien und konkrete Beiträge einordnen;
- Kontakt aufnehmen oder GitHub/LinkedIn besuchen.

## 3. Designprinzipien

1. **Work first:** Projekte stehen noch vor einer langen Biografie.
2. **Playful, not cryptic:** Die Konsolenmetapher verbessert die Orientierung;
   sie darf keine Navigation verstecken.
3. **Ein starker Moment:** Ein prägnanter Hub ist wirksamer als Animationen in
   jedem Abschnitt.
4. **Beleg statt Behauptung:** Projektergebnisse, Entscheidungen und eigener
   Anteil sind wichtiger als lange Skill-Listen.
5. **Progressive Enhancement:** Ohne JavaScript bleibt die komplette Website
   lesbar und navigierbar.
6. **Geschwindigkeit ist Design:** Animationen, Bilder und Schriften erhalten
   feste Budgets.
7. **Eigenständige Gestaltung:** Referenzen liefern Prinzipien, keine zu
   kopierende Vorlage.

## 4. Visuelle Richtung: „Personal Home Console“

### Charakter

- freundlich, ruhig und unmittelbar als Spielebibliothek erkennbar;
- abgerundete, gut lesbare Systemtypografie statt Hacker- oder Terminalästhetik;
- kräftiges Blau markiert Auswahl, Fokus und primäre Aktionen;
- echte Screenshots dienen als Kanal-Covers und erhalten nur dezente Overlays;
- ein heller Modus erinnert an Nintendo-Menüs, der dunkle Modus nutzt tiefes Blau;
- großzügige Abstände, wenige Labels und klare Icons halten das Menü aufgeräumt.

### Vorläufige Farbwelt

| Rolle              | Arbeitswert | Zweck                  |
| ------------------ | ----------- | ---------------------- |
| Hintergrund hell   | `#EDF4FF`   | luftige Konsolenfläche |
| Oberfläche hell    | `#FFFFFF`   | Leisten und Dialoge    |
| Hintergrund dunkel | `#06152F`   | tiefes Konsolenblau    |
| Oberfläche dunkel  | `#0B2147`   | Leisten und Karten     |
| Primärtext hell    | `#172133`   | klare Beschriftung     |
| Primärtext dunkel  | `#F5F9FF`   | hoher Kontrast         |
| Primärakzent       | `#278CF3`   | Fokus, Status, Links   |

Die finalen Werte werden erst im visuellen Prototyp nach Kontrastprüfung
festgelegt.

### Typografie

- UI und Beschriftung: eine weiche, vertraute Sans-Serif mit Nintendo-artiger
  Freundlichkeit;
- keine Monospace- oder Code-Typografie im Hauptmenü;
- der aktuelle System-Font-Stack vermeidet zusätzliche Downloads;
- Text bleibt in normaler Groß-/Kleinschreibung und wird nicht technisch codiert.

### Bewegung

- die ausgewählte Kachel wächst nur leicht und ihr Cover bewegt sich dezent;
- beim Start wächst die Kachel bis auf Bildschirmgröße, verliert Farbe und blendet
  über Schwarz zur Zielseite;
- eine auffällige, überspringbare Profilsequenz lässt einen Mauszeiger zum Profil
  fahren und es anklicken;
- UI-Klänge starten erst nach dem bewussten Klick auf „Menü starten“;
- `prefers-reduced-motion` schaltet Übergänge auf sofortige Zustandswechsel um.

## 5. Informationsarchitektur

### Startseite

1. **Startup:** kurzer, überspringbarer Profil-Login als eigenständiger Moment.
2. **Systemleiste:** feststehendes Home-Menü mit Spielerbild, GitHub, Uhrzeit und Status.
3. **Channel-Galerie:** 4×3-Raster aus echten Website-Covers und freien Kanälen.
4. **Freie Kanäle:** sichtbare Plätze für kommende Websites.
5. **System-Dock:** Kontakt, rechtliche Links, Bedienhinweis und Theme-Wechsel.
6. **Kontakt:** modaler Dialog; Versand wird nach Hinterlegung einer öffentlichen
   Adresse oder eines datenschutzgerechten Formular-Endpunkts aktiviert.

### Projektseiten

Jedes wichtige Projekt erhält eine eigene, teilbare URL mit:

- aussagekräftigem Titelbild und einem Satz zum Nutzen;
- Kontext, Problem und Ziel;
- eigenem Verantwortungsbereich;
- technischen und gestalterischen Entscheidungen;
- Screenshots oder kurzen Videos mit Beschriftungen;
- Ergebnis und, falls vorhanden, messbaren Kennzahlen;
- Reflexion: Was würde heute anders gelöst?;
- Links zur Live-Seite und zum Code, sofern öffentlich.

### Rechtliche Seiten

- `/impressum/`
- `/datenschutz/`

Die endgültigen Rechtstexte werden nicht automatisch generiert, sondern anhand
der tatsächlichen Betreiber-, Hosting-, Analyse- und Kontaktkonfiguration
erstellt beziehungsweise rechtlich geprüft.

## 6. Hub-Interaktion

### Desktop

- zwölf Plätze sind gleichzeitig in einem 4×3-Channel-Raster sichtbar;
- ein Klick auf ein belegtes Cover startet die Vollbild-Überblendung und danach
  die Website direkt;
- die feste Systemleiste bleibt beim Scrollen am oberen Bildschirmrand;
- freie Plätze zeigen, wie das Home-Menü um weitere Websites wächst;
- alle Links besitzen sichtbare Fokuszustände und semantische Beschriftungen.

### Touch und Mobile

- die Galerie wird zweispaltig und behält den Home-Menü-Charakter;
- Projekte bleiben direkt sichtbar und benötigen kein horizontales Wischen;
- die Systemleiste reduziert sich auf Profil, GitHub, Uhrzeit und Online-Status;
- die Kacheln bleiben auch auf schmalen Displays direkt startbar.

### Barrierearme Variante

- korrekte Überschriftenstruktur und Landmarken;
- keine bedeutungstragende Information nur über Farbe;
- ausreichend große Ziele und gut sichtbarer Tastaturfokus;
- Alternativtexte und beschriftete Medien;
- Skip-Link und direkte Links zu allen Projekten;
- vollständige Funktion bei 200 % Zoom und ohne Animation.

## 7. Inhaltsmodell für Projekte

Jedes Projekt wird später als strukturierter Inhalt gepflegt:

```yaml
title: Projektname
slug: projektname
summary: Ein Satz über Problem und Ergebnis
year: 2026
status: live
featured: true
role:
  - Konzeption
  - Full-Stack-Entwicklung
stack:
  - Astro
  - TypeScript
links:
  live: https://example.com
  repository: https://github.com/example/project
cover: ./cover.webp
accent: "#65F6D2"
```

Aus diesem Datensatz entstehen Hub-Karte, Projektarchiv und Case-Study-Kopf. So
muss ein neues Projekt nicht an mehreren Stellen manuell eingetragen werden.

## 8. Qualitätsziele

- Lighthouse-Ziele für Performance, Accessibility, Best Practices und SEO:
  jeweils mindestens 95 auf repräsentativen Seiten;
- LCP unter 2,5 Sekunden und CLS unter 0,1 bei typischen mobilen Bedingungen;
- anfängliches JavaScript-Budget der Startseite unter 200 KB komprimiert;
- keine Third-Party-Skripte im MVP;
- WCAG 2.2 AA als Zielstandard;
- Social Preview, Favicon, Sitemap, `robots.txt`, Canonical URL und strukturierte
  Person-/WebSite-Daten;
- saubere 404-Seite im gleichen Designsystem.

## 9. Sprachstrategie

Das MVP startet auf Deutsch. Inhalte und Komponenten werden so strukturiert,
dass anschließend eine englische Variante unter `/en/` ergänzt werden kann.
Automatische Weiterleitungen anhand der Browsersprache werden vermieden; die
Sprachauswahl bleibt eine bewusste, stabile Nutzerentscheidung.

## 10. Abgrenzung des MVP

### Enthalten

- responsive Startseite;
- drei Projekte und insgesamt zwölf vorbereitete Plätze im Console Hub;
- mindestens eine vollständige Case Study;
- Über-mich- und Kontaktbereich;
- Impressum und Datenschutz;
- GitHub-Pages-Deployment und Custom Domain;
- grundlegende SEO-, Performance- und Accessibility-Prüfung.

### Später möglich

- englische Vollversion;
- Projektfilter und vollständiges Archiv;
- eine weitergehende Soundkulisse nach aktivem Opt-in;
- eine echte Besucheranzeige über einen datenschutzgerechten externen Zähler;
- Gamepad-Unterstützung;
- WebGL- oder Canvas-Details;
- Blog/Devlog und RSS;
- datensparsame Analytics nach bewusster Entscheidung.

## 11. Erfolgskriterien

Die erste Version ist erfolgreich, wenn eine neue Person nach kurzem Besuch
folgende Fragen beantworten kann:

1. Welche Art Software entwickelt D. Henschel?
2. Welche zwei oder drei Projekte sind besonders relevant?
3. Was war jeweils der konkrete eigene Beitrag?
4. Wie kann man Kontakt aufnehmen?

Der Hub soll im Gedächtnis bleiben, aber diese vier Antworten nie behindern.
