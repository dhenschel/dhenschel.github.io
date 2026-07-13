import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.dhenschel.de",
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) =>
        !["/impressum/", "/datenschutz/"].includes(new URL(page).pathname),
    }),
  ],
  build: {
    format: "directory",
  },
});
