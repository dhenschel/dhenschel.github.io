export const supportedLanguages = ["de", "en", "fr", "es"] as const;

export type Language = (typeof supportedLanguages)[number];
export type TranslationParams = Record<string, string | number>;

const de: Record<string, string> = {
  "page.home.title": "D. Henschel — Website-Menü",
  "page.home.description":
    "Das persönliche Website-Menü von D. Henschel mit Projekten und kommenden Ideen.",
  "page.imprint.title": "Impressum — D. Henschel",
  "page.privacy.title": "Datenschutz — D. Henschel",
  "page.notFound.title": "404 — Signal verloren",
  "page.case.title": "dhenschel.de — Case Study",
  "page.case.description":
    "Konzept und technische Entscheidungen hinter dem Portfolio-Hub von D. Henschel.",
  "common.skipContent": "Zum Inhalt springen",
  "common.online": "Online",
  "common.legal": "Rechtliches",
  "common.imprint": "Impressum",
  "common.privacy": "Datenschutz",
  "common.contact": "Kontakt",
  "common.home": "Startseite",
  "language.label": "Sprache auswählen",
  "language.current": "Aktuelle Sprache: {{language}}",
  "startup.skip": "Überspringen",
  "startup.selectProfile": "Profil auswählen",
  "startup.profileSelection": "Profilauswahl",
  "startup.previous": "Vorheriges Profil auswählen",
  "startup.next": "Nächstes Profil auswählen",
  "startup.previousNamed": "Vorheriges Profil auswählen: {{name}}",
  "startup.nextNamed": "Nächstes Profil auswählen: {{name}}",
  "startup.guestOne": "Gast 01",
  "startup.guestTwo": "Gast 02",
  "startup.unavailable": "Noch nicht eingerichtet",
  "startup.mainProfile": "Hauptprofil",
  "startup.profileFallback": "Profil",
  "startup.profileGroup": "{{name}}: {{status}}",
  "startup.start": "Menü starten",
  "startup.startWith": "Menü mit {{name}} starten",
  "startup.notReady": "Dieses Profil ist noch nicht eingerichtet",
  "startup.welcome": "Willkommen zurück",
  "startup.monkeyAlt": "Schwarz-weißes Affenportrait für Gastprofil 01",
  "startup.duckAlt": "Illustrierte Ente für Gastprofil 02",
  "header.backGallery": "Zur Website-Galerie zurückkehren",
  "header.backGalleryShort": "Zurück zur Galerie",
  "header.openProfile": "Profilmenü von dhenschel öffnen",
  "header.openMusic": "Music Channel öffnen",
  "header.openMusicTrack": "Music Channel öffnen. Aktuell: {{title}}",
  "header.openMusicTrackTitle": "Music Channel öffnen – {{title}}",
  "gallery.title": "Meine Websites",
  "gallery.page": "Menüseite 1 von 1",
  "gallery.channels": "Website-Kanäle",
  "gallery.open": "{{title}} öffnen",
  "gallery.preview": "Vorschau von {{title}}",
  "gallery.empty": "Freier Kanal {{index}}",
  "gallery.about": "About Me",
  "about.channel": "Profilkanal",
  "about.title": "About Me",
  "about.information": "Persönliche Informationen",
  "launch.fact": "Völlig unnütze Info",
  "launch.tip.01": "Pixel werden alphabetisch sortiert.",
  "launch.tip.02": "Das Internet wird kurz entknotet.",
  "launch.tip.03": "Der Ladebalken lädt gerade auch sich selbst.",
  "launch.tip.04": "Mindestens ein div wird fachgerecht vorgewärmt.",
  "launch.tip.05": "Kaffee wird auf Betriebstemperatur gebracht.",
  "launch.tip.06": "Die Website sucht noch ihren linken Socken.",
  "launch.tip.07": "Der Server fragt kurz seine Mutter.",
  "launch.tip.08": "Unsichtbare Kabel werden fachgerecht entwirrt.",
  "launch.tip.09": "Der Fortschrittsbalken übt schon mal das Ankommen.",
  "launch.tip.10": "Alle Nullen und Einsen werden vorsichtshalber nachgezählt.",
  "launch.tip.11": "Ein besonders wichtiges Pixel verspätet sich.",
  "launch.tip.12": "Die Cloud wird kurz aufgeschüttelt.",
  "launch.tip.13": "Browserkrümel werden unter den Teppich gekehrt.",
  "launch.tip.14": "Das WLAN holt noch einmal tief Luft.",
  "launch.tip.15": "Die Website zieht sich schnell etwas Hübsches an.",
  "launch.tip.16": "Der Cache sucht gerade seine Lesebrille.",
  "launch.tip.17": "CSS wird gewissenhaft nach Farben sortiert.",
  "launch.tip.18": "JavaScript verhandelt noch mit der Realität.",
  "launch.tip.19": "Der Ladehamster wechselt gerade das Laufrad.",
  "launch.tip.20": "404-Fehler werden vorsorglich versteckt.",
  "launch.tip.21": "Die Bits laufen sich schon einmal warm.",
  "launch.tip.22": "Ein Button wird noch frisch poliert.",
  "launch.tip.23": "Die Daten nehmen heute die landschaftlich schöne Route.",
  "launch.tip.24": "Der Server nickt bedeutungsvoll.",
  "launch.tip.25": "Das Internet macht kurz ein bisschen Platz.",
  "launch.tip.26": "Der letzte Bug wird sorgfältig als Feature umetikettiert.",
  "music.channel": "Music Channel",
  "music.library": "Sound-Bibliothek",
  "music.choose": "Hintergrundmusik auswählen",
  "music.previous": "Vorherige Musik-Disc",
  "music.next": "Nächste Musik-Disc",
  "music.selectTrack": "{{title}} auswählen und anhören",
  "music.position": "Disc {{current}} von {{total}}",
  "music.current": "Aktuelle Hintergrundmusik",
  "music.listen": "Anhören",
  "music.playing": "Läuft gerade",
  "music.selected": "Ausgewählt",
  "music.selectedBackground": "Als Hintergrundmusik ausgewählt",
  "music.playHint": "Zum Anhören Enter oder Leertaste drücken",
  "music.playHintGamepad": "Zum Anhören A drücken",
  "music.listenTrack": "{{title}} anhören",
  "music.playingTrack": "{{title}} läuft gerade",
  "music.dayDefault": "Als Tag-Standard",
  "music.nightDefault": "Als Nacht-Standard",
  "music.track.home.label": "Tag-System",
  "music.track.home.description":
    "Leichte Akkordimpulse, freundliche Bass-Bloops und kleine digitale Antworten.",
  "music.track.night.label": "Nacht-System",
  "music.track.night.description":
    "Gedämpfte Keys, ein ruhiger tiefer Puls und zurückhaltende Motive für den Dark Mode.",
  "music.track.orbit.label": "Früher 02",
  "music.track.orbit.description":
    "Der frühere, schwebende Ansatz mit langen Flächen und ruhigen Melodiebögen.",
  "music.track.signal.label": "Früher 01",
  "music.track.signal.description":
    "Die ursprüngliche prozedurale Klangwelt mit langsam wandernden Einzeltönen.",
  "controls.openContact": "Kontaktformular öffnen",
  "controls.soundOn": "Sound an",
  "controls.soundOff": "Sound aus",
  "controls.enableSound": "Sound einschalten",
  "controls.disableSound": "Sound ausschalten",
  "controls.changeTheme": "Farbschema wechseln",
  "controls.lightMode": "Light Mode",
  "controls.darkMode": "Dark Mode",
  "controls.enterFullscreen": "Vollbildmodus starten",
  "controls.exitFullscreen": "Vollbildmodus beenden",
  "contact.eyebrow": "Nachricht",
  "contact.title": "Kontakt aufnehmen",
  "contact.close": "Kontaktformular schließen",
  "contact.name": "Dein Name",
  "contact.email": "Deine E-Mail",
  "contact.message": "Nachricht",
  "contact.info":
    "Beim Absenden öffnet sich dein E-Mail-Programm mit der vorbereiteten Nachricht.",
  "contact.prepare": "Nachricht vorbereiten",
  "contact.noRecipient": "Noch keine öffentliche Empfängeradresse hinterlegt.",
  "contact.subject": "Portfolio-Anfrage von {{name}}",
  "contact.replyTo": "Antwort an: {{email}}",
  "site.navigation": "Hauptnavigation",
  "site.projects": "Projekte",
  "site.profile": "Profil",
  "site.contact": "Kontakt",
  "site.profileAlt": "Profilbild von D. Henschel",
  "site.footerText":
    "Entworfen und entwickelt mit Astro. Keine Cookies, kein Tracking.",
  "site.toTop": "Nach oben ↑",
  "legal.placeholderTitle": "Vor dem offiziellen Launch zu vervollständigen",
  "legal.imprint.placeholder":
    "Die erforderlichen Betreiber- und Kontaktangaben liegen noch nicht vor. Diese Seite ist deshalb ein gekennzeichneter Platzhalter und wird nicht indexiert.",
  "legal.imprint.note":
    "Bitte die Angaben aus docs/CONTENT.md bereitstellen. Der endgültige Inhalt sollte passend zur tatsächlichen Nutzung der Website rechtlich geprüft werden.",
  "legal.privacy.placeholder":
    "Die Website setzt derzeit selbst keine Cookies, kein Analytics und keine extern geladenen Schriften ein. Die vollständigen Hinweise müssen noch auf Hosting, Betreiberangaben und die finale Drittanbieterkonfiguration abgestimmt werden.",
  "legal.privacy.note":
    "Dieser technische Hinweis ersetzt keine individuell passende Datenschutzerklärung. Die Seite ist bis zur Fertigstellung von der Indexierung ausgeschlossen.",
  "legal.backHome": "← Zur Startseite",
  "notFound.heading": "Signal verloren.",
  "notFound.text": "Diese Route gehört nicht zur aktuellen Mission.",
  "notFound.back": "Zurück zum Hub →",
  "case.back": "← Zurück zur Library",
  "case.headline": "Ein Portfolio, das sich wie ein Produkt anfühlt.",
  "case.lede":
    "dhenschel.de verbindet die schnelle Orientierung eines klassischen Entwickler-Portfolios mit der Auswahl- und Statuslogik eines modernen Console Hubs.",
  "case.year": "Jahr",
  "case.role": "Rolle",
  "case.roleValue": "Konzept · Design · Entwicklung",
  "case.stack": "Stack",
  "case.status": "Status",
  "case.statusValue": "In Entwicklung",
  "case.visualAria": "Abstrakte Darstellung des Portfolio-Hubs",
  "case.products": "DIGITALE PRODUKTE",
  "case.challenge.title": "Eigenständig wirken, ohne Orientierung zu opfern.",
  "case.challenge.text":
    "Viele Entwickler-Portfolios sind entweder sehr funktional und austauschbar oder visuell eindrucksvoll, aber schwer zu bedienen. Das Ziel ist eine dritte Option: ein wiedererkennbares Interface, das die Projekte trotzdem in wenigen Sekunden verständlich macht.",
  "case.approach.title": "Die Spielebibliothek als Navigationsmodell.",
  "case.approach.text":
    "Projektcover, aktiver Status, Index und Inspector bilden gemeinsam den Console Hub. Die Metapher bleibt bewusst leicht: Jeder Titel ist ein normaler Link, alle Informationen sind semantisches HTML und auf Mobilgeräten wird daraus ein übersichtlicher Kartenstapel.",
  "case.point.keyboard": "Tastatursteuerung zusätzlich zur direkten Auswahl",
  "case.point.noJs": "Vollständiger Inhalt auch ohne Client-JavaScript",
  "case.point.motion": "Reduzierte Bewegung über Systemeinstellung",
  "case.system.title": "Statischer Kern, Interaktion nur dort, wo sie trägt.",
  "case.system.text":
    "Astro erzeugt alle Seiten als statisches HTML. Projektinhalte werden strukturiert gepflegt und später automatisch für Hub, Archiv und Case Studies wiederverwendet. JavaScript steuert nur die Auswahl im Hub und kleine Interface-Details.",
  "case.metric.tracking": "Tracking-Skripte",
  "case.metric.static": "statisch deploybar",
  "case.metric.accessibility": "Accessibility-Ziel",
  "case.next.title": "Jetzt kommen die echten Projekte.",
  "case.next.text":
    "Die technische und visuelle Bühne steht. Als Nächstes ersetzen echte Projektinhalte die vorbereiteten Slots, ergänzt um Screenshots, Ergebnisse und konkrete technische Entscheidungen.",
  "case.library": "Library ansehen →",
};

const en: Record<string, string> = {
  ...de,
  "page.home.title": "D. Henschel — Website Menu",
  "page.home.description":
    "D. Henschel’s personal website menu featuring projects and upcoming ideas.",
  "page.imprint.title": "Legal Notice — D. Henschel",
  "page.privacy.title": "Privacy — D. Henschel",
  "page.notFound.title": "404 — Signal Lost",
  "page.case.description":
    "The concept and technical decisions behind D. Henschel’s portfolio hub.",
  "common.skipContent": "Skip to content",
  "common.online": "Online",
  "common.legal": "Legal",
  "common.imprint": "Legal Notice",
  "common.privacy": "Privacy",
  "common.contact": "Contact",
  "common.home": "Home",
  "language.label": "Select language",
  "language.current": "Current language: {{language}}",
  "startup.skip": "Skip",
  "startup.selectProfile": "Select profile",
  "startup.profileSelection": "Profile selection",
  "startup.previous": "Select previous profile",
  "startup.next": "Select next profile",
  "startup.previousNamed": "Select previous profile: {{name}}",
  "startup.nextNamed": "Select next profile: {{name}}",
  "startup.guestOne": "Guest 01",
  "startup.guestTwo": "Guest 02",
  "startup.unavailable": "Not set up yet",
  "startup.mainProfile": "Main profile",
  "startup.profileFallback": "Profile",
  "startup.profileGroup": "{{name}}: {{status}}",
  "startup.start": "Start menu",
  "startup.startWith": "Start menu with {{name}}",
  "startup.notReady": "This profile has not been set up yet",
  "startup.welcome": "Welcome back",
  "startup.monkeyAlt": "Black-and-white monkey portrait for guest profile 01",
  "startup.duckAlt": "Illustrated duck for guest profile 02",
  "header.backGallery": "Return to the website gallery",
  "header.backGalleryShort": "Back to gallery",
  "header.openProfile": "Open dhenschel’s profile menu",
  "header.openMusic": "Open Music Channel",
  "header.openMusicTrack": "Open Music Channel. Now playing: {{title}}",
  "header.openMusicTrackTitle": "Open Music Channel – {{title}}",
  "gallery.title": "My Websites",
  "gallery.page": "Menu page 1 of 1",
  "gallery.channels": "Website channels",
  "gallery.open": "Open {{title}}",
  "gallery.preview": "Preview of {{title}}",
  "gallery.empty": "Empty channel {{index}}",
  "gallery.about": "About Me",
  "about.channel": "Profile Channel",
  "about.title": "About Me",
  "about.information": "Personal information",
  "launch.fact": "Completely useless fact",
  "launch.tip.01": "Pixels are being sorted alphabetically.",
  "launch.tip.02": "The internet is being untangled for a moment.",
  "launch.tip.03": "The loading bar is currently loading itself.",
  "launch.tip.04": "At least one div is being professionally preheated.",
  "launch.tip.05": "Coffee is being brought up to operating temperature.",
  "launch.tip.06": "The website is still looking for its left sock.",
  "launch.tip.07": "The server is quickly asking its mother.",
  "launch.tip.08": "Invisible cables are being carefully untangled.",
  "launch.tip.09": "The progress bar is rehearsing its arrival.",
  "launch.tip.10": "All zeroes and ones are being counted again, just in case.",
  "launch.tip.11": "A particularly important pixel is running late.",
  "launch.tip.12": "The cloud is being given a quick shake.",
  "launch.tip.13": "Browser crumbs are being swept under the rug.",
  "launch.tip.14": "The Wi-Fi is taking one more deep breath.",
  "launch.tip.15": "The website is quickly putting on something nice.",
  "launch.tip.16": "The cache is looking for its reading glasses.",
  "launch.tip.17": "CSS is being carefully sorted by colour.",
  "launch.tip.18": "JavaScript is still negotiating with reality.",
  "launch.tip.19": "The loading hamster is changing its wheel.",
  "launch.tip.20": "404 errors are being hidden as a precaution.",
  "launch.tip.21": "The bits are warming up.",
  "launch.tip.22": "One button still needs a quick polish.",
  "launch.tip.23": "The data is taking the scenic route today.",
  "launch.tip.24": "The server nods meaningfully.",
  "launch.tip.25": "The internet is making a little room.",
  "launch.tip.26": "The final bug is being carefully relabelled as a feature.",
  "music.library": "Sound Library",
  "music.choose": "Select background music",
  "music.previous": "Previous music disc",
  "music.next": "Next music disc",
  "music.selectTrack": "Select and listen to {{title}}",
  "music.position": "Disc {{current}} of {{total}}",
  "music.current": "Current background music",
  "music.listen": "Listen",
  "music.playing": "Now playing",
  "music.selected": "Selected",
  "music.selectedBackground": "Selected as background music",
  "music.playHint": "Press Enter or Space to listen",
  "music.playHintGamepad": "Press A to listen",
  "music.listenTrack": "Listen to {{title}}",
  "music.playingTrack": "{{title}} is playing",
  "music.dayDefault": "Set as day default",
  "music.nightDefault": "Set as night default",
  "music.track.home.label": "Day System",
  "music.track.home.description":
    "Light chord pulses, friendly bass bloops and small digital replies.",
  "music.track.night.label": "Night System",
  "music.track.night.description":
    "Muted keys, a calm low pulse and restrained motifs for Dark Mode.",
  "music.track.orbit.label": "Legacy 02",
  "music.track.orbit.description":
    "The earlier floating approach with long pads and calm melodic arcs.",
  "music.track.signal.label": "Legacy 01",
  "music.track.signal.description":
    "The original procedural soundscape with slowly wandering single notes.",
  "controls.openContact": "Open contact form",
  "controls.soundOn": "Sound on",
  "controls.soundOff": "Sound off",
  "controls.enableSound": "Enable sound",
  "controls.disableSound": "Disable sound",
  "controls.changeTheme": "Change colour scheme",
  "controls.lightMode": "Light Mode",
  "controls.darkMode": "Dark Mode",
  "controls.enterFullscreen": "Enter fullscreen",
  "controls.exitFullscreen": "Exit fullscreen",
  "contact.eyebrow": "Message",
  "contact.title": "Get in touch",
  "contact.close": "Close contact form",
  "contact.name": "Your name",
  "contact.email": "Your email",
  "contact.message": "Message",
  "contact.info": "Submitting opens your email app with a prepared message.",
  "contact.prepare": "Prepare message",
  "contact.noRecipient": "No public recipient address has been added yet.",
  "contact.subject": "Portfolio enquiry from {{name}}",
  "contact.replyTo": "Reply to: {{email}}",
  "site.navigation": "Main navigation",
  "site.projects": "Projects",
  "site.profile": "Profile",
  "site.contact": "Contact",
  "site.profileAlt": "Profile picture of D. Henschel",
  "site.footerText": "Designed and built with Astro. No cookies, no tracking.",
  "site.toTop": "Back to top ↑",
  "legal.placeholderTitle": "To be completed before the official launch",
  "legal.imprint.placeholder":
    "The required operator and contact details are not yet available. This page is therefore a clearly marked placeholder and is not indexed.",
  "legal.imprint.note":
    "Please provide the details listed in docs/CONTENT.md. The final content should be legally reviewed for the website’s actual use.",
  "legal.privacy.placeholder":
    "The website currently sets no cookies, uses no analytics and loads no external fonts itself. The complete notice still needs to be aligned with hosting, operator details and the final third-party setup.",
  "legal.privacy.note":
    "This technical note is not a substitute for a tailored privacy policy. The page remains excluded from indexing until completion.",
  "legal.backHome": "← Back to home",
  "notFound.heading": "Signal lost.",
  "notFound.text": "This route is not part of the current mission.",
  "notFound.back": "Back to the hub →",
  "case.back": "← Back to the library",
  "case.headline": "A portfolio that feels like a product.",
  "case.lede":
    "dhenschel.de combines the quick orientation of a classic developer portfolio with the selection and status logic of a modern console hub.",
  "case.year": "Year",
  "case.role": "Role",
  "case.roleValue": "Concept · Design · Development",
  "case.stack": "Stack",
  "case.status": "Status",
  "case.statusValue": "In development",
  "case.visualAria": "Abstract representation of the portfolio hub",
  "case.products": "DIGITAL PRODUCTS",
  "case.challenge.title": "Stand out without sacrificing orientation.",
  "case.challenge.text":
    "Many developer portfolios are either functional and interchangeable or visually impressive but difficult to use. The goal is a third option: a recognisable interface that still makes every project understandable within seconds.",
  "case.approach.title": "The game library as a navigation model.",
  "case.approach.text":
    "Project covers, active status, index and inspector form the console hub together. The metaphor remains deliberately light: every title is a normal link, all information is semantic HTML, and on mobile it becomes a clear stack of cards.",
  "case.point.keyboard": "Keyboard controls in addition to direct selection",
  "case.point.noJs": "Complete content even without client-side JavaScript",
  "case.point.motion": "Reduced motion through the system setting",
  "case.system.title": "A static core, interaction only where it matters.",
  "case.system.text":
    "Astro generates every page as static HTML. Project content is maintained in a structured format and can later be reused automatically for the hub, archive and case studies. JavaScript only controls hub selection and small interface details.",
  "case.metric.tracking": "Tracking scripts",
  "case.metric.static": "statically deployable",
  "case.metric.accessibility": "Accessibility target",
  "case.next.title": "Now for the real projects.",
  "case.next.text":
    "The technical and visual stage is ready. Next, real project content will replace the prepared slots, supported by screenshots, results and concrete technical decisions.",
  "case.library": "View library →",
};

const fr: Record<string, string> = {
  ...en,
  "page.home.title": "D. Henschel — Menu des sites",
  "page.home.description":
    "Le menu personnel de D. Henschel avec ses projets et ses prochaines idées.",
  "page.imprint.title": "Mentions légales — D. Henschel",
  "page.privacy.title": "Confidentialité — D. Henschel",
  "page.notFound.title": "404 — Signal perdu",
  "common.skipContent": "Aller au contenu",
  "common.legal": "Informations légales",
  "common.imprint": "Mentions légales",
  "common.privacy": "Confidentialité",
  "common.contact": "Contact",
  "language.label": "Choisir la langue",
  "language.current": "Langue actuelle : {{language}}",
  "startup.skip": "Passer",
  "startup.selectProfile": "Choisir un profil",
  "startup.profileSelection": "Sélection du profil",
  "startup.previous": "Choisir le profil précédent",
  "startup.next": "Choisir le profil suivant",
  "startup.previousNamed": "Choisir le profil précédent : {{name}}",
  "startup.nextNamed": "Choisir le profil suivant : {{name}}",
  "startup.guestOne": "Invité 01",
  "startup.guestTwo": "Invité 02",
  "startup.unavailable": "Pas encore configuré",
  "startup.mainProfile": "Profil principal",
  "startup.profileFallback": "Profil",
  "startup.start": "Démarrer le menu",
  "startup.startWith": "Démarrer le menu avec {{name}}",
  "startup.notReady": "Ce profil n’est pas encore configuré",
  "startup.welcome": "Bon retour",
  "header.backGallery": "Revenir à la galerie des sites",
  "header.backGalleryShort": "Retour à la galerie",
  "header.openProfile": "Ouvrir le menu du profil dhenschel",
  "header.openMusic": "Ouvrir Music Channel",
  "header.openMusicTrack": "Ouvrir Music Channel. En cours : {{title}}",
  "header.openMusicTrackTitle": "Ouvrir Music Channel – {{title}}",
  "gallery.title": "Mes sites",
  "gallery.page": "Page de menu 1 sur 1",
  "gallery.channels": "Canaux des sites",
  "gallery.open": "Ouvrir {{title}}",
  "gallery.preview": "Aperçu de {{title}}",
  "gallery.empty": "Canal libre {{index}}",
  "gallery.about": "À propos",
  "about.channel": "Canal du profil",
  "about.title": "À propos",
  "about.information": "Informations personnelles",
  "launch.fact": "Information totalement inutile",
  "launch.tip.01": "Les pixels sont classés par ordre alphabétique.",
  "launch.tip.02": "Internet est brièvement démêlé.",
  "launch.tip.03": "La barre de chargement se charge elle-même.",
  "launch.tip.04": "Au moins une div est préchauffée dans les règles.",
  "launch.tip.05": "Le café atteint sa température de fonctionnement.",
  "launch.tip.06": "Le site cherche encore sa chaussette gauche.",
  "launch.tip.07": "Le serveur demande rapidement à sa mère.",
  "launch.tip.08": "Les câbles invisibles sont soigneusement démêlés.",
  "launch.tip.09": "La barre de progression répète son arrivée.",
  "launch.tip.10": "Les zéros et les uns sont recomptés par précaution.",
  "launch.tip.11": "Un pixel particulièrement important est en retard.",
  "launch.tip.12": "Le cloud est secoué un petit coup.",
  "launch.tip.13": "Les miettes du navigateur passent sous le tapis.",
  "launch.tip.14": "Le Wi-Fi reprend une grande inspiration.",
  "launch.tip.15": "Le site enfile rapidement quelque chose d’élégant.",
  "launch.tip.16": "Le cache cherche ses lunettes de lecture.",
  "launch.tip.17": "Le CSS est soigneusement trié par couleur.",
  "launch.tip.18": "JavaScript négocie encore avec la réalité.",
  "launch.tip.19": "Le hamster de chargement change de roue.",
  "launch.tip.20": "Les erreurs 404 sont cachées par précaution.",
  "launch.tip.21": "Les bits s’échauffent.",
  "launch.tip.22": "Un bouton reçoit encore un dernier polissage.",
  "launch.tip.23": "Les données prennent aujourd’hui la route panoramique.",
  "launch.tip.24": "Le serveur acquiesce d’un air entendu.",
  "launch.tip.25": "Internet fait un peu de place.",
  "launch.tip.26": "Le dernier bug devient soigneusement une fonctionnalité.",
  "music.library": "Bibliothèque sonore",
  "music.choose": "Choisir la musique de fond",
  "music.previous": "Disque musical précédent",
  "music.next": "Disque musical suivant",
  "music.selectTrack": "Choisir et écouter {{title}}",
  "music.position": "Disque {{current}} sur {{total}}",
  "music.current": "Musique de fond actuelle",
  "music.listen": "Écouter",
  "music.playing": "Lecture en cours",
  "music.selected": "Sélectionné",
  "music.selectedBackground": "Sélectionné comme musique de fond",
  "music.playHint": "Appuyez sur Entrée ou Espace pour écouter",
  "music.playHintGamepad": "Appuyez sur A pour écouter",
  "music.listenTrack": "Écouter {{title}}",
  "music.playingTrack": "{{title}} est en cours de lecture",
  "music.dayDefault": "Définir pour le jour",
  "music.nightDefault": "Définir pour la nuit",
  "music.track.home.label": "Système jour",
  "music.track.home.description":
    "Des accords légers, des basses amicales et de petites réponses numériques.",
  "music.track.night.label": "Système nuit",
  "music.track.night.description":
    "Des touches feutrées, une pulsation grave calme et des motifs discrets pour le mode sombre.",
  "music.track.orbit.label": "Archive 02",
  "music.track.orbit.description":
    "L’ancienne approche aérienne avec de longues nappes et des courbes mélodiques calmes.",
  "music.track.signal.label": "Archive 01",
  "music.track.signal.description":
    "L’univers sonore procédural d’origine avec des notes isolées qui se déplacent lentement.",
  "controls.openContact": "Ouvrir le formulaire de contact",
  "controls.soundOn": "Son activé",
  "controls.soundOff": "Son coupé",
  "controls.enableSound": "Activer le son",
  "controls.disableSound": "Couper le son",
  "controls.changeTheme": "Changer le thème",
  "controls.lightMode": "Mode clair",
  "controls.darkMode": "Mode sombre",
  "controls.enterFullscreen": "Passer en plein écran",
  "controls.exitFullscreen": "Quitter le plein écran",
  "contact.eyebrow": "Message",
  "contact.title": "Prendre contact",
  "contact.close": "Fermer le formulaire de contact",
  "contact.name": "Votre nom",
  "contact.email": "Votre e-mail",
  "contact.message": "Message",
  "contact.info":
    "L’envoi ouvre votre application e-mail avec un message préparé.",
  "contact.prepare": "Préparer le message",
  "contact.noRecipient": "Aucune adresse publique n’est encore enregistrée.",
  "contact.subject": "Demande de portfolio de {{name}}",
  "contact.replyTo": "Répondre à : {{email}}",
  "site.navigation": "Navigation principale",
  "site.projects": "Projets",
  "site.profile": "Profil",
  "site.contact": "Contact",
  "site.profileAlt": "Photo de profil de D. Henschel",
  "site.footerText":
    "Conçu et développé avec Astro. Aucun cookie, aucun suivi.",
  "site.toTop": "Haut de page ↑",
  "legal.placeholderTitle": "À compléter avant le lancement officiel",
  "legal.imprint.placeholder":
    "Les informations requises sur l’exploitant et le contact ne sont pas encore disponibles. Cette page est donc un espace réservé clairement indiqué et n’est pas indexée.",
  "legal.imprint.note":
    "Veuillez fournir les informations de docs/CONTENT.md. Le contenu final devra faire l’objet d’une vérification juridique adaptée à l’usage réel du site.",
  "legal.privacy.placeholder":
    "Le site ne dépose actuellement aucun cookie, n’utilise aucun outil d’analyse et ne charge aucune police externe. Les informations complètes doivent encore être adaptées à l’hébergement, à l’exploitant et aux services tiers définitifs.",
  "legal.privacy.note":
    "Cette note technique ne remplace pas une politique de confidentialité adaptée. La page reste exclue de l’indexation jusqu’à sa finalisation.",
  "legal.backHome": "← Retour à l’accueil",
  "notFound.heading": "Signal perdu.",
  "notFound.text": "Cette route ne fait pas partie de la mission actuelle.",
  "notFound.back": "Retour au hub →",
  "case.back": "← Retour à la bibliothèque",
  "case.headline": "Un portfolio qui ressemble à un véritable produit.",
  "case.lede":
    "dhenschel.de associe l’orientation rapide d’un portfolio de développeur classique à la logique de sélection et d’état d’un hub de console moderne.",
  "case.year": "Année",
  "case.role": "Rôle",
  "case.roleValue": "Concept · Design · Développement",
  "case.stack": "Technologies",
  "case.status": "Statut",
  "case.statusValue": "En développement",
  "case.visualAria": "Représentation abstraite du hub de portfolio",
  "case.products": "PRODUITS NUMÉRIQUES",
  "case.challenge.title": "Être unique sans sacrifier l’orientation.",
  "case.challenge.text":
    "De nombreux portfolios de développeurs sont soit fonctionnels et interchangeables, soit impressionnants mais difficiles à utiliser. L’objectif est une troisième voie : une interface reconnaissable qui rend les projets compréhensibles en quelques secondes.",
  "case.approach.title": "La bibliothèque de jeux comme modèle de navigation.",
  "case.approach.text":
    "Les couvertures, l’état actif, l’index et l’inspecteur composent ensemble le hub. La métaphore reste légère : chaque titre est un lien normal, toutes les informations sont en HTML sémantique et l’ensemble devient une pile de cartes claire sur mobile.",
  "case.point.keyboard":
    "Navigation au clavier en plus de la sélection directe",
  "case.point.noJs": "Contenu complet même sans JavaScript côté client",
  "case.point.motion": "Animations réduites via le réglage du système",
  "case.system.title": "Un cœur statique, de l’interaction là où elle compte.",
  "case.system.text":
    "Astro génère toutes les pages en HTML statique. Les contenus sont structurés puis réutilisables automatiquement pour le hub, les archives et les études de cas. JavaScript ne gère que la sélection et quelques détails d’interface.",
  "case.metric.tracking": "Scripts de suivi",
  "case.metric.static": "déploiement statique",
  "case.metric.accessibility": "Objectif d’accessibilité",
  "case.next.title": "Place maintenant aux vrais projets.",
  "case.next.text":
    "La scène technique et visuelle est prête. Les vrais contenus remplaceront ensuite les emplacements préparés, avec des captures, des résultats et des décisions techniques concrètes.",
  "case.library": "Voir la bibliothèque →",
};

const es: Record<string, string> = {
  ...en,
  "page.home.title": "D. Henschel — Menú de sitios",
  "page.home.description":
    "El menú personal de D. Henschel con sus proyectos y próximas ideas.",
  "page.imprint.title": "Aviso legal — D. Henschel",
  "page.privacy.title": "Privacidad — D. Henschel",
  "page.notFound.title": "404 — Señal perdida",
  "common.skipContent": "Ir al contenido",
  "common.legal": "Información legal",
  "common.imprint": "Aviso legal",
  "common.privacy": "Privacidad",
  "common.contact": "Contacto",
  "language.label": "Seleccionar idioma",
  "language.current": "Idioma actual: {{language}}",
  "startup.skip": "Omitir",
  "startup.selectProfile": "Seleccionar perfil",
  "startup.profileSelection": "Selección de perfil",
  "startup.previous": "Seleccionar el perfil anterior",
  "startup.next": "Seleccionar el perfil siguiente",
  "startup.previousNamed": "Seleccionar el perfil anterior: {{name}}",
  "startup.nextNamed": "Seleccionar el perfil siguiente: {{name}}",
  "startup.guestOne": "Invitado 01",
  "startup.guestTwo": "Invitado 02",
  "startup.unavailable": "Aún no configurado",
  "startup.mainProfile": "Perfil principal",
  "startup.profileFallback": "Perfil",
  "startup.start": "Iniciar menú",
  "startup.startWith": "Iniciar menú con {{name}}",
  "startup.notReady": "Este perfil aún no está configurado",
  "startup.welcome": "Bienvenido de nuevo",
  "header.backGallery": "Volver a la galería de sitios",
  "header.backGalleryShort": "Volver a la galería",
  "header.openProfile": "Abrir el menú de perfil de dhenschel",
  "header.openMusic": "Abrir Music Channel",
  "header.openMusicTrack": "Abrir Music Channel. Reproduciendo: {{title}}",
  "header.openMusicTrackTitle": "Abrir Music Channel – {{title}}",
  "gallery.title": "Mis sitios web",
  "gallery.page": "Página de menú 1 de 1",
  "gallery.channels": "Canales de sitios web",
  "gallery.open": "Abrir {{title}}",
  "gallery.preview": "Vista previa de {{title}}",
  "gallery.empty": "Canal libre {{index}}",
  "gallery.about": "Sobre mí",
  "about.channel": "Canal de perfil",
  "about.title": "Sobre mí",
  "about.information": "Información personal",
  "launch.fact": "Dato completamente inútil",
  "launch.tip.01": "Los píxeles se están ordenando alfabéticamente.",
  "launch.tip.02": "Internet se está desenredando un momento.",
  "launch.tip.03": "La barra de carga se está cargando a sí misma.",
  "launch.tip.04": "Al menos un div se está precalentando correctamente.",
  "launch.tip.05": "El café está alcanzando su temperatura de funcionamiento.",
  "launch.tip.06": "El sitio todavía busca su calcetín izquierdo.",
  "launch.tip.07": "El servidor está preguntando un momento a su madre.",
  "launch.tip.08": "Los cables invisibles se están desenredando con cuidado.",
  "launch.tip.09": "La barra de progreso está ensayando su llegada.",
  "launch.tip.10": "Los ceros y unos se cuentan otra vez por si acaso.",
  "launch.tip.11": "Un píxel especialmente importante llega tarde.",
  "launch.tip.12": "La nube está recibiendo una rápida sacudida.",
  "launch.tip.13": "Las migas del navegador se esconden bajo la alfombra.",
  "launch.tip.14": "El Wi-Fi respira hondo una vez más.",
  "launch.tip.15": "El sitio se está poniendo algo bonito.",
  "launch.tip.16": "La caché está buscando sus gafas de lectura.",
  "launch.tip.17": "El CSS se ordena cuidadosamente por colores.",
  "launch.tip.18": "JavaScript sigue negociando con la realidad.",
  "launch.tip.19": "El hámster de carga está cambiando de rueda.",
  "launch.tip.20": "Los errores 404 se ocultan por precaución.",
  "launch.tip.21": "Los bits están calentando.",
  "launch.tip.22": "Todavía falta pulir un botón.",
  "launch.tip.23": "Los datos toman hoy la ruta panorámica.",
  "launch.tip.24": "El servidor asiente con significado.",
  "launch.tip.25": "Internet está haciendo un poco de espacio.",
  "launch.tip.26": "El último bug se está etiquetando como función.",
  "music.library": "Biblioteca de sonido",
  "music.choose": "Seleccionar música de fondo",
  "music.previous": "Disco de música anterior",
  "music.next": "Disco de música siguiente",
  "music.selectTrack": "Seleccionar y escuchar {{title}}",
  "music.position": "Disco {{current}} de {{total}}",
  "music.current": "Música de fondo actual",
  "music.listen": "Escuchar",
  "music.playing": "Reproduciendo",
  "music.selected": "Seleccionado",
  "music.selectedBackground": "Seleccionado como música de fondo",
  "music.playHint": "Pulsa Intro o Espacio para escuchar",
  "music.playHintGamepad": "Pulsa A para escuchar",
  "music.listenTrack": "Escuchar {{title}}",
  "music.playingTrack": "{{title}} se está reproduciendo",
  "music.dayDefault": "Usar de día",
  "music.nightDefault": "Usar de noche",
  "music.track.home.label": "Sistema diurno",
  "music.track.home.description":
    "Impulsos de acordes ligeros, bajos simpáticos y pequeñas respuestas digitales.",
  "music.track.night.label": "Sistema nocturno",
  "music.track.night.description":
    "Teclas suaves, un pulso grave tranquilo y motivos discretos para el modo oscuro.",
  "music.track.orbit.label": "Archivo 02",
  "music.track.orbit.description":
    "El enfoque flotante anterior con capas largas y arcos melódicos tranquilos.",
  "music.track.signal.label": "Archivo 01",
  "music.track.signal.description":
    "El paisaje sonoro procedural original con notas individuales que se mueven lentamente.",
  "controls.openContact": "Abrir formulario de contacto",
  "controls.soundOn": "Sonido activado",
  "controls.soundOff": "Sonido desactivado",
  "controls.enableSound": "Activar sonido",
  "controls.disableSound": "Desactivar sonido",
  "controls.changeTheme": "Cambiar tema",
  "controls.lightMode": "Modo claro",
  "controls.darkMode": "Modo oscuro",
  "controls.enterFullscreen": "Activar pantalla completa",
  "controls.exitFullscreen": "Salir de pantalla completa",
  "contact.eyebrow": "Mensaje",
  "contact.title": "Contactar",
  "contact.close": "Cerrar formulario de contacto",
  "contact.name": "Tu nombre",
  "contact.email": "Tu correo electrónico",
  "contact.message": "Mensaje",
  "contact.info":
    "Al enviar se abrirá tu aplicación de correo con un mensaje preparado.",
  "contact.prepare": "Preparar mensaje",
  "contact.noRecipient": "Aún no hay una dirección pública configurada.",
  "contact.subject": "Consulta sobre el portfolio de {{name}}",
  "contact.replyTo": "Responder a: {{email}}",
  "site.navigation": "Navegación principal",
  "site.projects": "Proyectos",
  "site.profile": "Perfil",
  "site.contact": "Contacto",
  "site.profileAlt": "Foto de perfil de D. Henschel",
  "site.footerText":
    "Diseñado y desarrollado con Astro. Sin cookies ni seguimiento.",
  "site.toTop": "Volver arriba ↑",
  "legal.placeholderTitle": "Debe completarse antes del lanzamiento oficial",
  "legal.imprint.placeholder":
    "Aún no están disponibles los datos necesarios del operador y de contacto. Esta página es por tanto un marcador claramente indicado y no se indexa.",
  "legal.imprint.note":
    "Proporciona los datos indicados en docs/CONTENT.md. El contenido final deberá revisarse legalmente de acuerdo con el uso real del sitio.",
  "legal.privacy.placeholder":
    "Actualmente el sitio no establece cookies, no utiliza analítica ni carga fuentes externas. El aviso completo todavía debe adaptarse al alojamiento, al operador y a la configuración final de terceros.",
  "legal.privacy.note":
    "Esta nota técnica no sustituye una política de privacidad adaptada. La página seguirá excluida de la indexación hasta que esté completa.",
  "legal.backHome": "← Volver al inicio",
  "notFound.heading": "Señal perdida.",
  "notFound.text": "Esta ruta no forma parte de la misión actual.",
  "notFound.back": "Volver al hub →",
  "case.back": "← Volver a la biblioteca",
  "case.headline": "Un portfolio que se siente como un producto.",
  "case.lede":
    "dhenschel.de combina la orientación rápida de un portfolio clásico de desarrollador con la lógica de selección y estado de un hub de consola moderno.",
  "case.year": "Año",
  "case.role": "Rol",
  "case.roleValue": "Concepto · Diseño · Desarrollo",
  "case.stack": "Tecnologías",
  "case.status": "Estado",
  "case.statusValue": "En desarrollo",
  "case.visualAria": "Representación abstracta del hub del portfolio",
  "case.products": "PRODUCTOS DIGITALES",
  "case.challenge.title": "Ser único sin sacrificar la orientación.",
  "case.challenge.text":
    "Muchos portfolios de desarrolladores son funcionales e intercambiables o visualmente impactantes pero difíciles de usar. El objetivo es una tercera opción: una interfaz reconocible que permita entender los proyectos en pocos segundos.",
  "case.approach.title": "La biblioteca de juegos como modelo de navegación.",
  "case.approach.text":
    "Las portadas, el estado activo, el índice y el inspector forman juntos el hub. La metáfora se mantiene ligera: cada título es un enlace normal, toda la información es HTML semántico y en móviles se convierte en una pila clara de tarjetas.",
  "case.point.keyboard": "Control por teclado además de la selección directa",
  "case.point.noJs": "Contenido completo incluso sin JavaScript del cliente",
  "case.point.motion": "Movimiento reducido mediante el ajuste del sistema",
  "case.system.title": "Núcleo estático, interacción solo donde aporta valor.",
  "case.system.text":
    "Astro genera todas las páginas como HTML estático. El contenido se mantiene de forma estructurada y después puede reutilizarse automáticamente para el hub, el archivo y los casos de estudio. JavaScript solo controla la selección y pequeños detalles de interfaz.",
  "case.metric.tracking": "Scripts de seguimiento",
  "case.metric.static": "despliegue estático",
  "case.metric.accessibility": "Objetivo de accesibilidad",
  "case.next.title": "Ahora llegan los proyectos reales.",
  "case.next.text":
    "El escenario técnico y visual está listo. A continuación, el contenido real sustituirá los espacios preparados, acompañado de capturas, resultados y decisiones técnicas concretas.",
  "case.library": "Ver biblioteca →",
};

const translations: Record<Language, Record<string, string>> = {
  de,
  en,
  fr,
  es,
};

const languageNames: Record<Language, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  es: "Español",
};

const STORAGE_KEY = "dh-console-language";

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" &&
  (supportedLanguages as readonly string[]).includes(value);

export const getLanguage = (): Language => {
  const current = document.documentElement.dataset.language;
  return isLanguage(current) ? current : "de";
};

export const getLocale = (language = getLanguage()) =>
  ({ de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES" })[language];

export const t = (
  key: string,
  params: TranslationParams = {},
  language = getLanguage(),
) => {
  const template = translations[language][key] ?? translations.de[key] ?? key;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    String(params[name] ?? `{{${name}}}`),
  );
};

const parseParams = (element: HTMLElement): TranslationParams => {
  const raw = element.dataset.i18nParams;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as TranslationParams;
  } catch {
    return {};
  }
};

const translateElement = (element: HTMLElement) => {
  const params = parseParams(element);
  const textKey = element.dataset.i18n;
  const ariaKey = element.dataset.i18nAria;
  const titleKey = element.dataset.i18nTitle;
  const altKey = element.dataset.i18nAlt;
  if (textKey) element.textContent = t(textKey, params);
  if (ariaKey) element.setAttribute("aria-label", t(ariaKey, params));
  if (titleKey) element.title = t(titleKey, params);
  if (altKey && element instanceof HTMLImageElement) {
    element.alt = t(altKey, params);
  }
};

export const applyTranslations = (root: ParentNode = document) => {
  root
    .querySelectorAll<HTMLElement>(
      "[data-i18n], [data-i18n-aria], [data-i18n-title], [data-i18n-alt]",
    )
    .forEach(translateElement);

  const body = document.body;
  const titleKey = body?.dataset.i18nDocumentTitle;
  const descriptionKey = body?.dataset.i18nDocumentDescription;
  if (titleKey) document.title = t(titleKey);
  if (descriptionKey) {
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", t(descriptionKey));
  }
};

const updateLanguageControls = () => {
  const language = getLanguage();
  document
    .querySelectorAll<HTMLElement>("[data-language-current]")
    .forEach((element) => (element.textContent = language.toUpperCase()));
  document
    .querySelectorAll<HTMLButtonElement>("[data-language-option]")
    .forEach((button) => {
      const selected = button.dataset.languageOption === language;
      button.setAttribute("aria-checked", String(selected));
      button.dataset.selected = String(selected);
    });
  document
    .querySelectorAll<HTMLButtonElement>("[data-language-toggle]")
    .forEach((button) =>
      button.setAttribute(
        "aria-label",
        t("language.current", { language: languageNames[language] }),
      ),
    );
};

export const setLanguage = (language: Language, persist = true) => {
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Language persistence is optional.
    }
  }
  applyTranslations();
  updateLanguageControls();
  window.dispatchEvent(
    new CustomEvent("console:language-changed", { detail: { language } }),
  );
};

export const initializeI18n = () => {
  applyTranslations();
  updateLanguageControls();

  document
    .querySelectorAll<HTMLButtonElement>("[data-language-toggle]")
    .forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const switcher = toggle.closest<HTMLElement>(
          "[data-language-switcher]",
        );
        if (!switcher) return;
        const willOpen = switcher.dataset.open !== "true";
        document
          .querySelectorAll<HTMLElement>("[data-language-switcher]")
          .forEach((item) => (item.dataset.open = "false"));
        switcher.dataset.open = String(willOpen);
        toggle.setAttribute("aria-expanded", String(willOpen));
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>("[data-language-option]")
    .forEach((option) => {
      option.addEventListener("click", () => {
        const language = option.dataset.languageOption;
        if (!isLanguage(language)) return;
        setLanguage(language);
        document
          .querySelectorAll<HTMLElement>("[data-language-switcher]")
          .forEach((item) => (item.dataset.open = "false"));
        document
          .querySelectorAll<HTMLButtonElement>("[data-language-toggle]")
          .forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
      });
    });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("[data-language-switcher]")) return;
    document
      .querySelectorAll<HTMLElement>("[data-language-switcher]")
      .forEach((item) => (item.dataset.open = "false"));
    document
      .querySelectorAll<HTMLButtonElement>("[data-language-toggle]")
      .forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document
      .querySelectorAll<HTMLElement>("[data-language-switcher]")
      .forEach((item) => (item.dataset.open = "false"));
    document
      .querySelectorAll<HTMLButtonElement>("[data-language-toggle]")
      .forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
  });
};

export const getLaunchTips = () =>
  Array.from({ length: 26 }, (_, index) =>
    t(`launch.tip.${String(index + 1).padStart(2, "0")}`),
  );
