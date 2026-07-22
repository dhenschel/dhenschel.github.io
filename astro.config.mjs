import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = "https://dhenschel.de";
const excludedSitemapPaths = new Set(["/404/", "/datenschutz/", "/impressum/"]);

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        const normalizedPath = pathname.endsWith("/")
          ? pathname
          : `${pathname}/`;
        return !excludedSitemapPaths.has(normalizedPath);
      },
    }),
  ],
  build: {
    format: "directory",
  },
});
