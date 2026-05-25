"use client";

import { Search, X as XIcon } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/configs/application";
import {
  SUPERVISOR_STATUS_KEYS,
  SUPERVISOR_TYPE_KEYS,
} from "@/features/supervisor/hooks/useApplicationFilters";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import type { useApplicationFilters } from "@/features/supervisor/hooks/useApplicationFilters";

type Filters = ReturnType<typeof useApplicationFilters>;

interface FilterBarProps {
  search: Filters["search"];
  setSearch: Filters["setSearch"];
  statusFilter: Filters["statusFilter"];
  setStatusFilter: Filters["setStatusFilter"];
  typeFilter: Filters["typeFilter"];
  setTypeFilter: Filters["setTypeFilter"];
  departmentFilter: Filters["departmentFilter"];
  setDepartmentFilter: Filters["setDepartmentFilter"];
  dateRange: Filters["dateRange"];
  setDateRange: Filters["setDateRange"];
  facets: Filters["facets"];
  activeFilterCount: Filters["activeFilterCount"];
  clearFilters: Filters["clearFilters"];
}

export function FilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  departmentFilter,
  setDepartmentFilter,
  dateRange,
  setDateRange,
  facets,
  activeFilterCount,
  clearFilters,
}: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 mb-4"
      role="search"
      aria-label="تصفية الطلبات"
    >
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث باسم المشروع أو الطالب..."
          aria-label="بحث في الطلبات"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          className="pr-12 text-sm"
        />
      </div>

      <div className="min-w-[140px]">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger aria-label="تصفية حسب الحالة">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {SUPERVISOR_STATUS_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {STATUS_CONFIG[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px]">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger aria-label="تصفية حسب النوع">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {SUPERVISOR_TYPE_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {TYPE_CONFIG[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px]">
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger aria-label="تصفية حسب القسم">
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأقسام</SelectItem>
            {(facets?.departments ?? []).map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px]">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger aria-label="تصفية حسب نطاق التاريخ">
            <SelectValue placeholder="التاريخ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التواريخ</SelectItem>
            <SelectItem value="day">خلال اليوم الأخير</SelectItem>
            <SelectItem value="week">خلال الأسبوع الأخير</SelectItem>
            <SelectItem value="month">خلال الشهر الأخير</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button
          type="button"
          onPress={clearFilters}
          variant="outline"
          size="sm"
        >
          <XIcon className="w-4 h-4" />
          إزالة عوامل التصفية ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
