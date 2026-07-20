# dhenschel.de — Interactive Developer Portfolio

An interactive, console-inspired portfolio that turns a conventional list of
projects into a small digital environment. Instead of scrolling through a
standard résumé page, visitors select a profile, enter a home menu, browse
website “channels,” preview projects, listen to procedural music, and navigate
the whole experience with a mouse, keyboard, or gamepad.

## Project overview

Developer portfolios often present technically strong work in an interchangeable
template: a hero section, a list of skills, and a grid of screenshots. That makes
it difficult for visitors to understand the personality behind the work or to
remember individual projects after leaving the page.

dhenschel.de solves that presentation problem by making the portfolio itself a
demonstration of frontend engineering. The site uses the visual language of a
console home menu to give every project a recognizable channel, while still
keeping the important information—project links, profile details, contact
options, and legal pages—easy to reach. The interaction design shows the same
skills that the portfolio describes: responsive UI engineering, browser API
integration, animation, accessibility-aware state management, internationalized
content, and careful media loading.

The application is deliberately static and privacy-friendly. It has no backend,
database, analytics, advertising scripts, or cookie banner. Project data and
media live in the repository, preferences stay in the visitor's browser, and the
contact form prepares an email locally instead of transmitting form data to a
server.

## Live demo

**Open the deployed website:** [https://dhenschel.github.io/](https://dhenschel.github.io/)

The configured canonical domain is
[https://www.dhenschel.de/](https://www.dhenschel.de/). The GitHub Pages URL above
is the direct deployment URL and can be used if custom-domain DNS is still
propagating.

## Features

- **Console-style project hub:** Projects are presented as channels in a
  responsive 4 × 3 home-menu grid, with recognizable cover artwork, status
  information, and direct links to the live projects.
- **Animated launch flow:** Selecting an external project expands its channel
  artwork into a full-screen transition, displays a playful loading state, and
  then opens the destination.
- **Lazy video previews:** Supported project cards load their preview video only
  after a deliberate hover or gamepad focus. Previews pause, fade, reset, and can
  replay without making every visitor download all videos up front. Reduced
  motion preferences disable this behavior.
- **Profile startup experience:** A profile carousel, animated boot screen, skip
  option, and session-aware routing create a memorable entry without forcing the
  intro to repeat on every navigation.
- **Built-in About channel:** Personal information is part of the console rather
  than a disconnected page. Hash-based views and browser history keep Gallery,
  About, Music, and Back navigation predictable.
- **Procedural Music Channel:** The Web Audio API synthesizes the soundtrack in
  the browser. Visitors can select seven compositions, use a configurable
  shuffle disc, or choose the silent disc; no audio files or streaming service
  are required.
- **Four interface languages:** German, English, French, and Spanish are
  available from both the startup screen and the main console. The selected
  language is retained locally.
- **Multiple input methods:** The complete experience supports mouse, touch,
  keyboard, and standard-mapped gamepads. Controller mode includes a virtual
  pointer, directional navigation, shortcuts, connection feedback, and vibration
  where supported.
- **Personal display controls:** Light and dark themes, sound on/off, and browser
  fullscreen controls are available from the console. Preferences persist in
  `localStorage`.
- **Responsive and accessibility-aware UI:** Semantic controls, visible focus
  states, ARIA labels and live regions, inert inactive views, keyboard operation,
  reduced-motion handling, and layouts for desktop and mobile are built into the
  custom interface.
- **Privacy-conscious contact flow:** The contact dialog validates the entered
  fields and opens the visitor's email client with a prepared subject and body.
  The website itself sends or stores nothing.
- **Production essentials:** The site includes custom legal pages, a 404 page,
  structured data, canonical metadata, a web app manifest, `robots.txt`, and an
  automatically generated sitemap.

## Tech stack

| Area          | Technology                                                         | Purpose                                                                                    |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Framework     | Astro 7                                                            | Static page generation and component composition                                           |
| Language      | TypeScript 6, modern JavaScript                                    | Typed project data and client-side interaction                                             |
| Styling       | Component-scoped CSS, global CSS, CSS Custom Properties            | Responsive layout, themes, transitions, and the original visual system                     |
| Browser APIs  | Web Audio, Gamepad, Fullscreen, History, Web Storage, `matchMedia` | Procedural music, controller input, view state, preferences, and accessibility adaptations |
| Content       | TypeScript data modules and repository-hosted assets               | Projects, profile data, music metadata, images, and video previews                         |
| SEO           | `@astrojs/sitemap`, JSON-LD, canonical and social metadata         | Discoverability and share previews                                                         |
| Hosting       | GitHub Pages                                                       | Static production hosting                                                                  |
| CI/CD         | GitHub Actions on Node.js 24                                       | Formatting/type checks, production builds, artifact upload, and deployment                 |
| Database      | None                                                               | The project requires no server-side state                                                  |
| External APIs | None at runtime                                                    | No third-party service receives visitor data                                               |

The only “API” integrations used by the running site are native browser APIs.
The optional contact action uses a `mailto:` URL, and links to portfolio projects
are normal outbound links. This keeps deployment inexpensive, removes secrets and
environment variables from the setup, and makes the site work as a self-contained
static build.

## Setup instructions

### Prerequisites

- [Node.js 24](https://nodejs.org/) (the same major version used in CI)
- npm, included with Node.js
- Git, if you want to clone the repository

### Install and start the development server

```bash
git clone https://github.com/dhenschel/dhenschel.github.io.git
cd dhenschel.github.io
npm ci
npm run dev
```

Astro prints the local URL in the terminal; by default it is
[http://localhost:4321/](http://localhost:4321/). No `.env` file, API key,
database, or local service is required.

Use `npm install` instead of `npm ci` only when intentionally changing
dependencies. `npm ci` is recommended for a reproducible installation from
`package-lock.json`.

### Available commands

```bash
npm run dev          # Start the Astro development server
npm run check        # Run Astro diagnostics and TypeScript checks
npm run format:check # Verify formatting with Prettier
npm run format       # Apply Prettier formatting
npm run build        # Check the project and build the static site into dist/
npm run preview      # Serve the production build locally
```

To verify the exact production output locally:

```bash
npm run build
npm run preview
```

A push to `main` triggers the GitHub Pages workflow. Pull requests run formatting,
Astro/TypeScript checks, and a full production build before merge.

## Test instructions for judges

The experience is designed to be explored, so the most useful review combines a
short technical check with the following manual journey:

1. **Enter through the startup screen.** Move between the three profile cards,
   observe the unavailable guest states, choose `dhenschel`, and start the menu.
   Reload once to confirm that the intro can be skipped within the same browser
   session. The explicit **Skip** control can also be used.
2. **Explore the project gallery.** Focus or hover over the Restaurant Lava and
   CozySite channels for a little over one second. Their videos should be loaded
   on demand, fade in, play, and return cleanly to the cover. Select a project to
   see the launch animation and continue to its live site.
3. **Open internal channels.** Enter **About Me**, return with the in-app Back
   button, then use the browser's Back and Forward buttons. The URL hash, visible
   panel, and focus state should stay synchronized.
4. **Try the Music Channel.** Open it with the disc button in the header. Start
   several discs, compare their procedural arrangements, configure the shuffle
   pool, and select the silent disc. Audio starts only after a user interaction,
   as required by modern browsers.
5. **Change the presentation.** Toggle light/dark mode, sound, and fullscreen.
   Reload the page and confirm that persistent preferences are restored. Also
   switch between DE, EN, FR, and ES from both available language menus.
6. **Use keyboard navigation.** Complete the startup and move through the console
   without a mouse using `Tab`, arrow keys where offered, `Enter`, and `Space`.
   Focus indicators should remain visible and the active view should receive
   focus after transitions.
7. **Use a gamepad if available.** Connect a standard-mapped controller. Use the
   left stick as a virtual pointer or the D-pad for structured movement, `A` to
   activate, and `B` to go back. `X` toggles sound, `Y` toggles the theme, and the
   controller's menu button reopens the profile screen. Connection and input-mode
   indicators should update automatically.
8. **Check responsive and reduced-motion behavior.** Resize to a narrow mobile
   viewport and rotate if possible. Then enable the operating system's “reduce
   motion” preference and verify that nonessential motion and hover video previews
   are suppressed.
9. **Inspect the contact flow.** Fill in the contact dialog and submit it. The site
   should open a pre-addressed email draft; it must not issue a network request or
   store the form contents.
10. **Run the automated project checks.** From a clean checkout, execute:

    ```bash
    npm ci
    npm run format:check
    npm run check
    npm run build
    ```

    All commands should finish successfully and the generated site should be in
    `dist/`.

## OpenAI/Codex usage

Codex with **GPT-5.6** was used as an active engineering partner throughout the
Build Week, not as a runtime feature or a decorative chatbot added to the site.
The model worked directly with the repository while the human developer supplied
the product direction, visual judgment, personal content, project selection, and
final review.

Concrete uses included:

- turning the console-home-menu concept into an Astro component architecture and
  a typed content model;
- implementing and repeatedly refining the custom responsive layout, startup
  sequence, channel launch transition, dark/light themes, and focus behavior;
- designing the TypeScript state and browser-event handling for hash navigation,
  session state, lazy preview timing, fullscreen, and preference persistence;
- building the Gamepad API integration, including pointer and structured
  navigation modes, button shortcuts, repeat behavior, input-mode switching, and
  optional haptic feedback;
- authoring and tuning the Web Audio synthesis engine and the code-based musical
  arrangements used by the Music Channel;
- expanding the interface strings and behavior for German, English, French, and
  Spanish;
- diagnosing edge cases around interrupted animations, browser history, restored
  pages, focus hand-off, controller selection, audio activation, and video replay;
- setting up Astro/TypeScript/Prettier validation and GitHub Actions workflows for
  CI and GitHub Pages deployment; and
- maintaining the technical documentation and producing this competition-ready
  README from the implemented code and commit history.

The workflow was iterative: features were requested in small, testable slices;
GPT-5.6 inspected the existing implementation, proposed or applied repository
changes, ran the relevant checks, and refined the result based on human feedback.
The commit history intentionally preserves that progression rather than presenting
the project as a single generated code drop.

No OpenAI model or API is called by the deployed website. Visitors do not need an
OpenAI account, and no visitor data is sent to OpenAI.

## Build Week changes

The repository history begins with the initial portfolio implementation on
**13 July 2026**. The current interactive product was built and refined during
the Build Week through **20 July 2026**. The work completed in that period
includes:

- scaffolding the Astro 7 and TypeScript project, its data model, SEO metadata,
  sitemap, responsive base styles, CI checks, and GitHub Pages deployment;
- replacing the initial portfolio presentation with the distinctive
  console-inspired home menu and responsive 12-channel grid;
- adding project covers, the About and GitHub channels, BootBucht24, external
  launch transitions, playful loading messages, and robust page-restore logic;
- creating the animated profile-selection startup screen, guest artwork, session
  behavior, theme controls, contact dialog, fullscreen mode, and custom pointer;
- implementing lazy, delayed, reduced-motion-aware project video previews and
  refining their playback, exit, cooldown, and replay behavior;
- creating the complete procedural audio system, dedicated Music Channel, disc
  carousel, seven compositions, configurable shuffle mode, and silent mode;
- translating the complete console interface into four languages with persistent
  language selection;
- adding full keyboard and gamepad navigation, virtual-pointer control, controller
  shortcuts, vibration feedback, and input connection/status indicators; and
- integrating the imprint and privacy pages into the console design and completing
  final mobile, animation, music, preview, and interaction refinements.

In other words, the Build Week work was not a minor redesign of an existing
application: it produced the architecture, identity, core interactions, content
presentation, audio experience, internationalization, input system, and deployment
pipeline visible in the submitted version.

## Documentation

Additional project documentation is available in the repository:

- [Product and design plan](docs/PLAN.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Content planning](docs/CONTENT.md)
- [GitHub Pages and custom-domain deployment](docs/DEPLOYMENT.md)
- [Design references and findings](docs/REFERENCES.md)

## License

This is a public repository, but it is **not currently distributed under an
open-source license**. Unless a separate license file is added, all rights are
reserved. The source may be inspected for judging and learning, but the code,
copy, personal photographs, project artwork, name, and branding may not be copied,
modified, or redistributed without explicit permission from the repository owner.
Third-party names and trademarks remain the property of their respective owners.
