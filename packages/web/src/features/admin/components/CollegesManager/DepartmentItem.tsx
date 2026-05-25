"use client";

import { Pencil, Trash2, Check, X } from "lucide-react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { Input } from "@/components/ui";

type College = FunctionReturnType<typeof api.colleges.listWithDepartments>[number];
type Department = College["departments"][number];

interface DepartmentItemProps {
  dep: Department;
  editingDepId: Id<"departments"> | null;
  editingDepName: string;
  setEditingDepId: (id: Id<"departments"> | null) => void;
  setEditingDepName: (name: string) => void;
  handleUpdateDep: (id: Id<"departments">) => void;
  handleRemoveDep: (id: Id<"departments">) => void;
}

export function DepartmentItem({
  dep,
  editingDepId,
  editingDepName,
  setEditingDepId,
  setEditingDepName,
  handleUpdateDep,
  handleRemoveDep,
}: DepartmentItemProps) {
  return (
    <div key={dep._id} className="flex items-center gap-3">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
      {editingDepId === dep._id ? (
        <Input
          value={editingDepName}
          onChange={(e) => setEditingDepName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUpdateDep(dep._id)}
          className="flex-1 py-1 text-sm"
          autoFocus
        />
      ) : (
        <span className="flex-1 text-sm font-medium">{dep.name}</span>
      )}
      <div className="flex items-center gap-1">
        {editingDepId === dep._id ? (
          <>
            <button onClick={() => handleUpdateDep(dep._id)} className="hover:bg-foreground/5 rounded transition-colors p-1 text-success">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditingDepId(null)} className="hover:bg-foreground/5 rounded transition-colors p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setEditingDepId(dep._id); setEditingDepName(dep.name); }}
              className="hover:bg-foreground/5 rounded transition-colors p-1"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRemoveDep(dep._id)}
              className="hover:bg-foreground/5 rounded transition-colors p-1 text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
