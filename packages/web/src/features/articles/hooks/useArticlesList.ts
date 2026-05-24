"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

/** Published articles visible to the student audience. */
export function useStudentArticlesList() {
  const articles = useQuery(api.articles.listPublished, { audience: "student" });
  return { articles: articles ?? [], loading: articles === undefined };
}

/** Single article by id, with author name + cover URL resolved. */
export function useArticleDetail(id: Id<"articles">) {
  const article = useQuery(api.articles.getById, { id });
  return { article, loading: article === undefined };
}
