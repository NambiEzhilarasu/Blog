import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://nambi-ezhilarasu.vercel.app",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/admin/") && !page.includes("/404") && !page.endsWith("/rss.xml"),
    }),
  ],
});
