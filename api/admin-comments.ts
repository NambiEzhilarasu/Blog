import { timingSafeEqual } from "node:crypto";
import { addReply, getAllComments, isValidArticleSlug, removeComment } from "../src/lib/comments";

const maxReplyLength = 2000;

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

function isAuthorized(request: Request): boolean {
  const expected = process.env.COMMENTS_ADMIN_PASSWORD;
  const authorization = request.headers.get("authorization");
  const supplied = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!expected || expected.length < 20 || supplied.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export default {
  async fetch(request: Request): Promise<Response> {
    const adminPassword = process.env.COMMENTS_ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 20) {
      return jsonResponse(
        { error: "Admin replies are not configured. Set a 20-character or longer COMMENTS_ADMIN_PASSWORD in Vercel." },
        503,
      );
    }
    if (!isAuthorized(request)) {
      return jsonResponse({ error: "The admin password is incorrect." }, 401);
    }
    if (request.method === "GET") {
      try {
        return jsonResponse({ comments: await getAllComments() });
      } catch (error) {
        console.error("Could not load admin comments.", error);
        return jsonResponse({ error: "Comments could not be loaded. Please try again." }, 500);
      }
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }
    if (!isSameOrigin(request)) {
      return jsonResponse({ error: "This action can only be performed from this website." }, 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "The admin request is not valid JSON." }, 400);
    }
    if (!isRecord(body)) {
      return jsonResponse({ error: "The admin request is invalid." }, 400);
    }
    const article = body.article;
    const commentId = body.commentId;
    if (
      !isValidArticleSlug(article) ||
      typeof commentId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(commentId)
    ) {
      return jsonResponse({ error: "The admin request is invalid." }, 400);
    }

    try {
      if (body.action === "reply") {
        const content = typeof body.content === "string" ? body.content.trim() : "";
        if (content.length === 0 || content.length > maxReplyLength) {
          return jsonResponse({ error: `Reply must be between 1 and ${maxReplyLength} characters.` }, 400);
        }
        const added = await addReply(article, commentId, {
          id: crypto.randomUUID(),
          author: "Nambi Ezhilarasu",
          content,
          createdAt: new Date().toISOString(),
        });
        return added
          ? jsonResponse({ accepted: true }, 201)
          : jsonResponse({ error: "That comment no longer exists." }, 404);
      }

      if (body.action === "delete") {
        const removed = await removeComment(article, commentId);
        return removed
          ? jsonResponse({ removed: true })
          : jsonResponse({ error: "That comment no longer exists." }, 404);
      }

      return jsonResponse({ error: "Choose a valid admin action." }, 400);
    } catch (error) {
      console.error("Could not update an article comment.", error);
      return jsonResponse({ error: "The comment could not be updated. Please try again." }, 500);
    }
  },
};
