import { addComment, getComments, isValidArticleSlug } from "../src/lib/comments.js";

const recentPosts = new Map<string, { count: number; resetAt: number }>();
const maxNameLength = 60;
const maxCommentLength = 2000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isRateLimited(request: Request): boolean {
  const now = Date.now();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const current = recentPosts.get(address);

  if (!current || current.resetAt <= now) {
    recentPosts.set(address, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (current.count >= 3) {
    return true;
  }

  current.count += 1;
  return false;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET") {
      const article = url.searchParams.get("article");
      if (!isValidArticleSlug(article)) {
        return jsonResponse({ error: "A valid article slug is required." }, 400);
      }

      try {
        return jsonResponse({ comments: await getComments(article) });
      } catch (error) {
        console.error("Could not load article comments.", error);
        return jsonResponse({ error: "Comments could not be loaded. Please try again." }, 500);
      }
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }
    if (!isSameOrigin(request)) {
      return jsonResponse({ error: "Comments can only be posted from this website." }, 403);
    }
    if (Number(request.headers.get("content-length")) > 10_000) {
      return jsonResponse({ error: "The comment is too large." }, 413);
    }
    if (isRateLimited(request)) {
      return jsonResponse({ error: "Please wait before posting another comment." }, 429);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "The comment request is not valid JSON." }, 400);
    }
    if (!isRecord(body)) {
      return jsonResponse({ error: "The comment request is invalid." }, 400);
    }
    if (typeof body.website === "string" && body.website.trim()) {
      return jsonResponse({ accepted: true }, 202);
    }
    const article = body.article;
    if (!isValidArticleSlug(article)) {
      return jsonResponse({ error: "A valid article slug is required." }, 400);
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (name.length === 0 || name.length > maxNameLength) {
      return jsonResponse({ error: `Name must be between 1 and ${maxNameLength} characters.` }, 400);
    }
    if (content.length === 0 || content.length > maxCommentLength) {
      return jsonResponse({ error: `Comment must be between 1 and ${maxCommentLength} characters.` }, 400);
    }

    try {
      await addComment(article, {
        id: crypto.randomUUID(),
        name,
        content,
        createdAt: new Date().toISOString(),
      });
      return jsonResponse({ accepted: true }, 201);
    } catch (error) {
      console.error("Could not save an article comment.", error);
      return jsonResponse({ error: "Your comment could not be saved. Please try again." }, 500);
    }
  },
};
