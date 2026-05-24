"use client";

import { ReactNode } from "react";
import { Rocket, Inbox, FileText, Search } from "lucide-react";
import { Card } from "@/components/ui";

type EmptyVariant = "no-applications" | "no-results" | "empty-inbox" | "get-started";

const VARIANT_ICON: Record<EmptyVariant, ReactNode> = {
  "no-applications": <FileText className="w-10 h-10 text-primary" />,
  "no-results": <Search className="w-10 h-10 text-info" />,
  "empty-inbox": <Inbox className="w-10 h-10 text-muted-foreground" />,
  "get-started": <Rocket className="w-10 h-10 text-secondary" />,
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
  return (
    <Card className="p-12 text-center">
      <div className="w-20 h-20 bg-muted ds-border rounded-2xl flex items-center justify-center mx-auto mb-6">
        {VARIANT_ICON[variant]}
      </div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </Card>
  );
}
