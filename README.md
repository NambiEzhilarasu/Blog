# Nambi Ezhilarasu — Technical Journal

An F1-inspired, static technical blog built with Astro. The homepage, About page,
and article routes are ready; no articles or personal biography have been added.

## Add an article

1. Copy `templates/article-template.md` into `src/content/articles/`.
2. Rename it to a URL-friendly name, such as `memory-safety-notes.md`.
3. Fill in the frontmatter and write the article below the second `---`.
4. Put article images in `public/images/articles/`.
5. Reference images with a site path, for example
   `![Diagram](/images/articles/diagram.png)`.
6. Run `npm run dev` to preview. Astro discovers the Markdown file, creates its
   article page, and includes it on the homepage automatically.

Required frontmatter: `title`, `description`, and `publishedAt` (`YYYY-MM-DD`).
Optional fields: `tags` (a list) and `coverImage` (a path beginning with `/`).
The homepage sorts entries by publication date, newest first.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

Keep the project and its `src/content/articles/` and `public/images/articles/`
folders under `C:\Users\NambiEzhilarasu\Desktop\Article` so posts and images
stay alongside the website source.
