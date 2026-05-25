"use client";

import { X, Search } from "lucide-react";
import { Input, Card } from "@/components/ui";

interface SearchFilterProps {
  search: string;
  setSearch: (s: string) => void;
}

export function SearchFilter({ search, setSearch }: SearchFilterProps) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="البحث بالاسم أو البريد الإلكتروني..."
          fullWidth
          className="px-9 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="مسح البحث"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
