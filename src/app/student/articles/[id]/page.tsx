"use client";

import { useParams } from "next/navigation";
import ArticleDetail from "@/features/articles/components/ArticleDetail";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function StudentArticleDetailPage() {
  const params = useParams();
  const id = params.id as Id<"articles">;
  return <ArticleDetail id={id} backHref="/student/articles" />;
}
