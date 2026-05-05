"use client";

import {BookOpen} from "lucide-react";
import { Spinner } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import ArticleCard from "./ArticleCard";
import { useStudentArticlesList } from "../hooks/useArticlesList";

/**
 * Student-facing article list page content.
 */
export default function ArticlesList() {
  const { articles, loading } = useStudentArticlesList();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-extrabold">المقالات</h1>
        {!loading && (
          <span className="text-sm font-bold text-muted-foreground mr-1">
            — {articles.length} مقالة
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" color="current" className="text-accent" />
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد مقالات بعد"
          description="سيقوم المشرفون بنشر مقالات إرشادية وتعريفية هنا قريباً."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a, i) => (
            <ArticleCard
              key={a._id}
              article={a}
              href={`/student/articles/${a._id}`}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
