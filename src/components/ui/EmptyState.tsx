"use client";

import { ReactNode } from "react";
import { Rocket, Inbox, FileText, Search } from "lucide-react";

type EmptyVariant = "no-applications" | "no-results" | "empty-inbox" | "get-started";

const VARIANTS: Record<EmptyVariant, {
  icon: ReactNode;
  bg: string;
  shapes: ReactNode;
}> = {
  "no-applications": {
    icon: <FileText className="w-10 h-10" />,
    bg: "bg-primary/20",
    shapes: (
      <>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary nb-border rounded-md rotate-12 animate-float" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent nb-border rounded-full animate-float" style={{ animationDelay: "1s" }} />
      </>
    ),
  },
  "no-results": {
    icon: <Search className="w-10 h-10" />,
    bg: "bg-info/20",
    shapes: (
      <>
        <div className="absolute -top-2 -left-3 w-7 h-7 bg-warning nb-border rotate-45 animate-float" />
        <div className="absolute -bottom-3 -right-2 w-5 h-5 bg-primary nb-border rounded-full animate-float" style={{ animationDelay: "0.7s" }} />
      </>
    ),
  },
  "empty-inbox": {
    icon: <Inbox className="w-10 h-10" />,
    bg: "bg-muted",
    shapes: (
      <>
        <div className="absolute -top-3 -left-2 w-6 h-6 bg-success nb-border rounded-lg rotate-6 animate-float" />
        <div className="absolute -bottom-2 -right-3 w-7 h-7 bg-warning nb-border rounded-full animate-float" style={{ animationDelay: "1.3s" }} />
      </>
    ),
  },
  "get-started": {
    icon: <Rocket className="w-10 h-10" />,
    bg: "bg-secondary/20",
    shapes: (
      <>
        <div className="absolute -top-4 -right-4 w-9 h-9 bg-primary nb-border rounded-xl -rotate-12 animate-float" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-accent nb-border rotate-45 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-1/2 -right-6 w-4 h-4 bg-warning nb-border rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
      </>
    ),
  },
};

export function EmptyState({
  variant = "no-applications",
  title,
  description,
  action,
}: {
  variant?: EmptyVariant;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const v = VARIANTS[variant];

  return (
    <div className="nb-card p-12 text-center">
      {/* Illustration */}
      <div className="relative inline-block mb-6">
        <div className={`w-20 h-20 ${v.bg} nb-border rounded-2xl flex items-center justify-center relative z-10`}>
          {v.icon}
        </div>
        {v.shapes}
      </div>

      <h3 className="text-xl font-extrabold mb-2">{title}</h3>
      <p className="text-muted-foreground font-medium mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}
