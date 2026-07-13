# GitHub Pages und Custom Domain

Zieladresse: `www.dhenschel.de`

## Voraussetzungen

- GitHub-Benutzername und Ziel-Repository sind festgelegt;
- das Repository ist für den verwendeten GitHub-Tarif Pages-fähig;
- die Domain ist im GitHub-Konto verifiziert;
- Zugriff auf die DNS-Verwaltung des Domain-Anbieters ist vorhanden;
- der Produktions-Build läuft lokal und in CI erfolgreich.

## Vorgesehener Veröffentlichungsweg

Da Astro einen Build-Schritt benötigt, wird GitHub Pages in den
Repository-Einstellungen auf **GitHub Actions** als Quelle gestellt. Der
Workflow baut die Website und veröffentlicht ausschließlich das statische
`dist`-Verzeichnis.

## Domain-Reihenfolge

1. Domain im GitHub-Konto verifizieren, um eine Übernahme durch Dritte zu
   verhindern.
2. In `Settings → Pages` des Repositorys `www.dhenschel.de` als Custom Domain
   eintragen.
3. Beim DNS-Anbieter `www` als `CNAME` direkt auf
   `<github-benutzername>.github.io` zeigen lassen.
4. Für die Apex-Domain `dhenschel.de` die von GitHub dokumentierten `A`-Records
   setzen, damit GitHub zwischen Apex und `www` weiterleiten kann.
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

## Noch offen

- GitHub-Benutzername;
- Name und Sichtbarkeit des Remote-Repositorys;
- Domain-Anbieter und dessen konkrete DNS-Oberfläche;
- Entscheidung, ob `www.dhenschel.de` oder `dhenschel.de` die kanonische
  Darstellung sein soll. Vorgeschlagen ist `www.dhenschel.de`, passend zur
  angegebenen Zieladresse.

## Offizielle Dokumentation

- [Publishing Source konfigurieren](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Custom Domain verwalten](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Custom Workflows mit GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
