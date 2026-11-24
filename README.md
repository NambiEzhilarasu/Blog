# Nambi Ezhilarasu — Technical Journal

An F1-inspired technical blog built with Astro. New posts are discovered
automatically from Markdown files. **For each post, add a Markdown file and
optional images; you do not need to edit the website code or create a new page.**

## Add a post

1. Copy `templates/article-template.md` into `src/content/articles/`.
2. Rename the copy to a URL-friendly name, for example
   `memory-safety-notes.md`. This becomes `/articles/memory-safety-notes/`.
3. Update the title, summary, date, and optional tags at the top of the file.
   Keep the required fields and the `---` separators.
4. Write the article below the frontmatter using Markdown.
5. To include images, copy them into `public/images/articles/` and use a
   site-root path in the post, such as
   `![Safety flowchart](/images/articles/safety-flowchart.png)`.
6. Preview the site locally, then publish it using the instructions below.

### Article metadata

```yaml
---
title: "Memory Safety Notes"
description: "A short summary shown on the homepage and article page."
publishedAt: 2026-11-24
tags:
  - Embedded Systems
  - Functional Safety
# Optional: used as the article card image and at the top of the article.
# coverImage: /images/articles/memory-safety-cover.png
---
```

`title`, `description`, and `publishedAt` are required. Use the date format
`YYYY-MM-DD`. `tags` and `coverImage` are optional; the first tag appears on the
homepage card. A Markdown image in the article body is separate from the
optional cover image.

### Write the article

Use ordinary Markdown for headings, paragraphs, lists, links, images, and code:

```md
## Overview

Write your introduction here.

### Key considerations

- First point
- Second point

![Describe the image](/images/articles/example-diagram.png)
```

The homepage lists posts newest first. Astro creates each article page and
updates the homepage from the files in `src/content/articles/` during the
standard site build.

## Preview locally

Node.js `22.23.4` or newer is required. Install dependencies once, from the
website folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Astro. Stop the preview server with `Ctrl+C`.

To check a production build locally:

```sh
npm run build
npm run preview
```

## Publish a post

Adding a Markdown file does not change the live site until a new deployment is
made. The current Vercel project is deployed directly and is not connected to
GitHub for automatic deployments. After adding a post, ask Copilot:

> Build and deploy my latest blog post to Vercel.

This rebuilds the site with the new article; it does not require regenerating or
editing the website code. Once GitHub is connected to Vercel, publishing can
instead happen automatically when changes are pushed.

## Where files go

- Articles: `src/content/articles/`
- Article images: `public/images/articles/`
- Reusable post format: `templates/article-template.md`

Keep the project under `C:\Users\NambiEzhilarasu\Desktop\Article` so the
website, posts, and images stay together.
