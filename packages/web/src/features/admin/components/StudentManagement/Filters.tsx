"use client";

import { Search, X } from "lucide-react";
import { Input, Card, Button } from "@/components/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Id } from "@smart-zuj/convex";

interface College {
  _id: Id<"colleges">;
  name: string;
}

interface Department {
  _id: Id<"departments">;
  name: string;
}

interface FiltersProps {
  search: string;
  setSearch: (v: string) => void;
  selectedCollege: string;
  setSelectedCollege: (v: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (v: string) => void;
  colleges: College[] | undefined;
  departments: Department[] | undefined;
}

export function Filters({
  search,
  setSearch,
  selectedCollege,
  setSelectedCollege,
  selectedDepartment,
  setSelectedDepartment,
  colleges,
  departments,
}: FiltersProps) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
        {/* Search */}
        <div className="relative flex-1 sm:min-w-[15rem]">
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

        {/* College */}
        <div className="sm:w-48">
          <Select
            value={selectedCollege || "all"}
            onValueChange={(v) => {
              setSelectedCollege(v === "all" ? "" : v);
              setSelectedDepartment("");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الكليات</SelectItem>
              {colleges?.map((c) => (
                <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div className="sm:w-48">
          <Select
            value={selectedDepartment || "all"}
            onValueChange={(v) => setSelectedDepartment(v === "all" ? "" : v)}
            isDisabled={!selectedCollege}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التخصصات</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear all */}
        {(search || selectedCollege || selectedDepartment) && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => { setSearch(""); setSelectedCollege(""); setSelectedDepartment(""); }}
          >
            <X className="w-4 h-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </Card>
  );
}
