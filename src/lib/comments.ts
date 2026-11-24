import { BlobPreconditionFailedError, get, list, put } from "@vercel/blob";

export interface CommentReply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommentThread {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  replies: CommentReply[];
}

export interface AdminCommentThread extends CommentThread {
  article: string;
}

interface StoredDocument {
  comments: CommentThread[];
}

interface ReadDocument extends StoredDocument {
  etag?: string;
}

const storagePrefix = "comments/v1/";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReply(value: unknown): value is CommentReply {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.author === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string"
  );
}

function isThread(value: unknown): value is CommentThread {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.replies) &&
    value.replies.every(isReply)
  );
}

function parseDocument(value: unknown): StoredDocument {
  if (!isRecord(value) || !Array.isArray(value.comments) || !value.comments.every(isThread)) {
    throw new Error("Stored comments have an invalid format.");
  }

  return { comments: value.comments };
}

function documentPath(article: string): string {
  return `${storagePrefix}${article}.json`;
}

export function isValidArticleSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

async function readDocument(article: string): Promise<ReadDocument> {
  const blob = await get(documentPath(article), { access: "private", useCache: false });
  if (!blob) {
    return { comments: [] };
  }
  if (blob.statusCode !== 200 || !blob.stream) {
    throw new Error("The comments document could not be read.");
  }

  const stored: unknown = await new Response(blob.stream).json();
  return { ...parseDocument(stored), etag: blob.blob.etag };
}

async function mutateDocument<T>(
  article: string,
  mutate: (comments: CommentThread[]) => { comments: CommentThread[]; result: T; changed: boolean },
): Promise<T> {
  const pathname = documentPath(article);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await readDocument(article);
    const update = mutate(current.comments);
    if (!update.changed) {
      return update.result;
    }

    try {
      await put(pathname, JSON.stringify({ comments: update.comments }), {
        access: "private",
        contentType: "application/json",
        allowOverwrite: current.etag !== undefined,
        ...(current.etag ? { ifMatch: current.etag } : {}),
      });
      return update.result;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError && attempt < 4) {
        continue;
      }
      if (!current.etag && attempt < 4) {
        const created = await get(pathname, { access: "private", useCache: false });
        if (created) {
          continue;
        }
      }
      throw error;
    }
  }

  throw new Error("Comments changed too frequently. Please try again.");
}

export async function getComments(article: string): Promise<CommentThread[]> {
  return (await readDocument(article)).comments.sort(
    (first, second) => second.createdAt.localeCompare(first.createdAt),
  );
}

export async function getAllComments(): Promise<AdminCommentThread[]> {
  const articles = new Set<string>();
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const page = await list({ prefix: storagePrefix, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const match = blob.pathname.match(/^comments\/v1\/([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/);
      if (match) {
        articles.add(match[1]);
      }
    }
    if (page.hasMore && !page.cursor) {
      throw new Error("The comments list could not be paginated.");
    }
    cursor = page.cursor;
    hasMore = page.hasMore;
  }

  const documents = await Promise.all(
    [...articles].map(async (article) => ({
      article,
      comments: await getComments(article),
    })),
  );

  return documents
    .flatMap(({ article, comments }) => comments.map((comment) => ({ ...comment, article })))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function addComment(
  article: string,
  comment: Omit<CommentThread, "replies">,
): Promise<void> {
  await mutateDocument(article, (comments) => ({
    comments: [{ ...comment, replies: [] }, ...comments],
    result: undefined,
    changed: true,
  }));
}

export async function addReply(
  article: string,
  commentId: string,
  reply: CommentReply,
): Promise<boolean> {
  return mutateDocument(article, (comments) => {
    if (!comments.some((comment) => comment.id === commentId)) {
      return { comments, result: false, changed: false };
    }
    return {
      comments: comments.map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
      result: true,
      changed: true,
    };
  });
}

export async function removeComment(article: string, commentId: string): Promise<boolean> {
  return mutateDocument(article, (comments) => {
    const filtered = comments.filter((comment) => comment.id !== commentId);
    return {
      comments: filtered,
      result: filtered.length !== comments.length,
      changed: filtered.length !== comments.length,
    };
  });
}
