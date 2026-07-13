# Produkt- und Designplan

Stand: 13. Juli 2026

## 1. Vision

`dhenschel.de` soll nicht wie ein austauschbares Lebenslauf-Template wirken,
sondern bereits beim ersten Besuch zeigen, dass hier Softwareentwicklung und
gestalterischer Anspruch zusammenkommen.

Die Kernidee ist ein **Developer Console Hub**: Eine ruhige, hochwertige
Oberfläche übernimmt vertraute Muster einer Spielebibliothek – Cover, Auswahl,
Status, Achievements und Detailansicht – ohne den Inhalt hinter einem Spiel oder
einer langen Introanimation zu verstecken.

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

## 4. Visuelle Richtung: „Signal Deck“

### Charakter

- dunkel, präzise und technisch, aber nicht wie ein generisches Hacker-Terminal;
- große, redaktionelle Typografie trifft auf kleine Systemlabels;
- eine helle Akzentfarbe markiert Auswahl und Fokus;
- Projektbilder tragen Farbe und Individualität in den ansonsten ruhigen Hub;
- subtile Rasterlinien, Statuspunkte und Indexnummern erzeugen Systemcharakter.

### Vorläufige Farbwelt

| Rolle          | Arbeitswert | Zweck                  |
| -------------- | ----------- | ---------------------- |
| Hintergrund    | `#0B0D10`   | fast schwarzes Graphit |
| Oberfläche     | `#141820`   | Panels und Karten      |
| Primärtext     | `#F1F0EA`   | warmes Off-White       |
| Sekundärtext   | `#9AA3AE`   | Metadaten              |
| Primärakzent   | `#65F6D2`   | Fokus, Status, Links   |
| Sekundärakzent | `#FF7A59`   | wichtige Highlights    |

Die finalen Werte werden erst im visuellen Prototyp nach Kontrastprüfung
festgelegt.

### Typografie

- Display/UI: eine charaktervolle Grotesk-Schrift mit kompakter Laufweite;
- Systemlabels/Code: eine gut lesbare Monospace-Schrift;
- Schriften werden möglichst selbst gehostet und sparsam geschnitten;
- Text bleibt in normaler Groß-/Kleinschreibung, Systemlabels dürfen versal sein.

Mögliche Ausgangspunkte sind Space Grotesk und JetBrains Mono. Vor der Nutzung
werden Lizenz, Dateigröße und Lesbarkeit geprüft.

### Bewegung

- kurze Auswahlbewegung beim Wechsel eines Projekts;
- sanfte Tiefenstaffelung zwischen aktivem und inaktivem Cover;
- keine unüberspringbare Bootsequenz;
- keine automatisch abgespielten Sounds;
- `prefers-reduced-motion` schaltet Übergänge auf sofortige Zustandswechsel um.

## 5. Informationsarchitektur

### Startseite

1. **Header:** Wortmarke `DH`, Navigation, Sprachoption, Verfügbarkeitsstatus.
2. **Hero / System ready:** Name, Rolle, kurze Positionierung, primärer CTA
   „Projekte ansehen“, sekundärer CTA „Kontakt“.
3. **Project Hub:** drei bis sechs kuratierte Projekte als auswählbare Bibliothek.
4. **Project Inspector:** Rolle, Problem, Ergebnis, Stack und direkte Links des
   ausgewählten Projekts.
5. **Player Profile:** kurze Biografie, Arbeitsweise und relevante Erfahrung.
6. **Capabilities / Loadout:** wenige, gruppierte Kompetenzen mit Kontext.
7. **Contact / Start co-op:** E-Mail, GitHub, LinkedIn und klarer Abschluss.
8. **Footer:** Impressum, Datenschutz, Copyright, Build-Information.

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

- Projektwechsel über Klick, Pfeiltasten oder `A`/`D`;
- `Enter` öffnet die ausgewählte Case Study;
- alle Steuerungen besitzen sichtbare Beschriftungen und Fokuszustände;
- ein Fortschrittsindex wie `02 / 05` zeigt die Position;
- eine normale Linkliste bleibt semantisch im Dokument vorhanden.

### Touch und Mobile

- keine erzwungene horizontale Steuerung;
- Projekte erscheinen als gut lesbarer vertikaler Kartenstapel;
- Swipen ist optional, niemals die einzige Bedienmöglichkeit;
- Metadaten stehen direkt an der jeweiligen Karte.

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
- drei bis sechs Projekte im Console Hub;
- mindestens eine vollständige Case Study;
- Über-mich- und Kontaktbereich;
- Impressum und Datenschutz;
- GitHub-Pages-Deployment und Custom Domain;
- grundlegende SEO-, Performance- und Accessibility-Prüfung.

### Später möglich

- englische Vollversion;
- Projektfilter und vollständiges Archiv;
- dezente Soundkulisse nach aktivem Opt-in;
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
