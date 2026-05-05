"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import {UserCircle, Calendar, ChevronRight} from "lucide-react";
import { formatArabicDate } from "@/lib/formatters";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs, buttonVariants, Spinner } from "@/components/ui";
import { useArticleDetail } from "../hooks/useArticlesList";
import type { Id } from "../../../../convex/_generated/dataModel";

interface ArticleDetailProps {
  id: Id<"articles">;
  /** Back-link href for the "كل المقالات" button. */
  backHref: string;
}

const ALLOWED_ELEMENTS = [
  "p", "strong", "em", "del", "ul", "ol", "li",
  "a", "code", "pre", "blockquote", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "table", "thead", "tbody", "tr", "th", "td",
  "img",
];

/**
 * Full article read view. Used on both /student/articles/[id] and
 * /supervisor/articles/[id] — the Convex `getById` enforces audience
 * restrictions for students so we render the same component for both.
 */
export default function ArticleDetail({ id, backHref }: ArticleDetailProps) {
  const { article, loading } = useArticleDetail(id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" color="current" className="text-accent" />
      </div>
    );
  }

  if (!article) {
    return (
      <EmptyState
        variant="no-results"
        title="المقالة غير متاحة"
        description="قد تكون المقالة قد حُذفت أو لم تُنشر بعد."
        action={
          <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
            <ChevronRight className="w-4 h-4" />
            العودة للمقالات
          </Link>
        }
      />
    );
  }

  return (
    <article className="animate-fade-in max-w-3xl mx-auto">
      <Breadcrumbs className="mb-4">
        <Breadcrumbs.Item href={backHref.startsWith("/supervisor") ? "/supervisor" : "/student"}>
          الرئيسية
        </Breadcrumbs.Item>
        <Breadcrumbs.Item href={backHref}>المقالات</Breadcrumbs.Item>
        <Breadcrumbs.Item>{article.title}</Breadcrumbs.Item>
      </Breadcrumbs>

      {article.coverUrl && (
        <div className="nb-card p-0 overflow-hidden mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverUrl}
            alt={article.title}
            className="w-full h-auto max-h-80 object-cover"
          />
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold mb-3">{article.title}</h1>
        {article.summary && (
          <p className="text-base text-muted-foreground font-medium mb-4">
            {article.summary}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-bold">
          <span className="flex items-center gap-1.5">
            <UserCircle className="w-4 h-4" />
            {article.authorName ?? "مشرف"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatArabicDate(article.createdAt)}
          </span>
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {article.tags.map((tag) => (
              <span key={tag} className="nb-badge-soft text-xs !bg-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="nb-card p-6 text-sm leading-relaxed break-words markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} allowedElements={ALLOWED_ELEMENTS}>
          {article.body}
        </ReactMarkdown>
      </div>
    </article>
  );
}
