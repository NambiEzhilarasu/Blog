import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error("Set the Astro site URL to generate the RSS feed.");
  }

  const articles = (await getCollection("articles")).sort(
    (first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf(),
  );

  return rss({
    title: "Nambi Ezhilarasu - Articles",
    description: "Articles on Functional Safety, ISO 26262, ASPICE and automotive R&D.",
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.publishedAt,
      description: article.data.description,
      link: `/articles/${article.id}/`,
      categories: article.data.tags,
    })),
  });
}
