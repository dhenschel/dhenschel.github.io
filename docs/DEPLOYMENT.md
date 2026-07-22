# GitHub Pages und Custom Domain

Zieladresse und kanonische Domain: `dhenschel.de`

Aktive GitHub-Pages-Vorschau: `https://dhenschel.github.io/`

Repository: `dhenschel/dhenschel.github.io`

## Voraussetzungen

- [x] GitHub-Benutzername und Ziel-Repository sind festgelegt;
- [x] das öffentliche Repository ist Pages-fähig;
- [x] der Produktions-Build läuft lokal und in CI erfolgreich;
- [x] GitHub Actions ist als Pages-Quelle aktiviert;
- [ ] die Domain ist im GitHub-Konto verifiziert;
- [ ] Zugriff auf die DNS-Verwaltung bei STRATO ist hergestellt.

## Vorgesehener Veröffentlichungsweg

Da Astro einen Build-Schritt benötigt, wird GitHub Pages in den
Repository-Einstellungen auf **GitHub Actions** als Quelle gestellt. Der
Workflow baut die Website und veröffentlicht ausschließlich das statische
`dist`-Verzeichnis.

## Domain-Reihenfolge

1. Domain im GitHub-Konto verifizieren, um eine Übernahme durch Dritte zu
   verhindern.
2. In `Settings → Pages` des Repositorys `dhenschel.de` als Custom Domain
   eintragen.
3. Für die Apex-Domain `dhenschel.de` die von GitHub dokumentierten `A`-Records
   setzen.
4. `www` bei STRATO als `CNAME` direkt auf `dhenschel.github.io` zeigen lassen,
   damit GitHub die Subdomain auf die kanonische Apex-Domain weiterleiten kann.
5. Nach erfolgreicher DNS-Prüfung **Enforce HTTPS** aktivieren.
6. Beide Varianten, HTTPS, Canonical URL und Weiterleitungen testen.

GitHub dokumentiert derzeit folgende IPv4-Adressen für die Apex-Domain:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Diese Werte werden unmittelbar vor der DNS-Änderung erneut mit der offiziellen
Dokumentation abgeglichen. Es wird kein Wildcard-DNS-Eintrag wie
`*.dhenschel.de` angelegt.

Optional können zusätzlich die von GitHub dokumentierten IPv6-Adressen gesetzt
werden:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

## Verifizierter DNS-Ist-Stand

Geprüft am 13. Juli 2026:

| Record           | Aktueller Wert | Zielwert                        |
| ---------------- | -------------- | ------------------------------- |
| `dhenschel.de A` | `217.160.0.59` | vier GitHub-Pages-IPv4-Adressen |
| `www CNAME`      | `dhenschel.de` | `dhenschel.github.io`           |
| Nameserver       | `*.rzone.de`   | unverändert, STRATO             |

Der aktuelle `A`-Record muss bei der Umstellung entfernt beziehungsweise durch
die vier GitHub-Records ersetzt werden. Nach der DNS-Propagation wird die Custom
Domain im Repository gesetzt und anschließend **Enforce HTTPS** aktiviert.

## Noch offen

- Domain-Verifizierung im GitHub-Konto und zugehöriger TXT-Record;
- DNS-Änderung in der STRATO-Verwaltung;
- erneute DNS-Prüfung und Aktivierung der Custom Domain;
- HTTPS-Zertifikatsausstellung durch GitHub abwarten und HTTPS erzwingen.

`dhenschel.de` ist als kanonische Darstellung festgelegt und in GitHub Pages als
Custom Domain hinterlegt. Die `www`-Variante darf nur als Weiterleitung auf die
Apex-Domain dienen. Solange beim HTTPS-Aufruf der `www`-Variante kein gültiges
Zertifikat ausgeliefert wird, wird sie weder als Canonical noch in Sitemap oder
strukturierten Daten verwendet.

## Offizielle Dokumentation

- [Publishing Source konfigurieren](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Custom Domain verwalten](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Custom Workflows mit GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
