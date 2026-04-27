"use client";

import Link from "next/link";
import { UserCircle, Calendar } from "lucide-react";
import { formatArabicDate } from "@/lib/formatters";
import type { ArticleDoc } from "../hooks/useArticleForm";

interface ArticleCardProps {
  article: ArticleDoc;
  href: string;
  index?: number;
}

/**
 * Preview card used in the student's article list. Shows cover (if
 * provided), title, summary, tags, author name, and publish date.
 */
export default function ArticleCard({ article, href, index = 0 }: ArticleCardProps) {
  return (
    <Link
      href={href}
      className="nb-card-interactive overflow-hidden flex flex-col animate-slide-up"
      style={{ opacity: 0, animationDelay: `${(index + 1) * 0.08}s` }}
    >
      {article.coverUrl && (
        <div className="aspect-video w-full bg-muted overflow-hidden border-b-2 border-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-extrabold text-base mb-1.5 line-clamp-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-sm text-muted-foreground font-medium line-clamp-3 mb-3">
            {article.summary}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="nb-badge-soft text-[11px] !bg-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-foreground/10 text-xs text-muted-foreground font-bold">
          <span className="flex items-center gap-1">
            <UserCircle className="w-3.5 h-3.5" />
            {article.authorName ?? "مشرف"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatArabicDate(article.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
