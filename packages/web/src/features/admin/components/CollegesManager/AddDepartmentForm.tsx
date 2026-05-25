"use client";

import { Plus, Check, X } from "lucide-react";
import { Id } from "@smart-zuj/convex";
import { Input } from "@/components/ui";

interface AddDepartmentFormProps {
  collegeId: Id<"colleges">;
  showNewDep: Record<string, boolean>;
  setShowNewDep: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  newDepNames: Record<string, string>;
  setNewDepNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddDep: (collegeId: Id<"colleges">) => void;
}

export function AddDepartmentForm({
  collegeId,
  showNewDep,
  setShowNewDep,
  newDepNames,
  setNewDepNames,
  handleAddDep,
}: AddDepartmentFormProps) {
  return showNewDep[collegeId] ? (
    <div className="flex items-center gap-2 pt-1">
      <Input
        value={newDepNames[collegeId] ?? ""}
        onChange={(e) =>
          setNewDepNames((p) => ({ ...p, [collegeId]: e.target.value }))
        }
        onKeyDown={(e) => e.key === "Enter" && handleAddDep(collegeId)}
        placeholder="اسم التخصص الجديد"
        className="flex-1 py-1 text-sm"
        autoFocus
      />
      <button
        onClick={() => handleAddDep(collegeId)}
        className="hover:bg-foreground/5 rounded transition-colors p-1.5 text-success"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={() =>
          setShowNewDep((p) => ({ ...p, [collegeId]: false }))
        }
        className="hover:bg-foreground/5 rounded transition-colors p-1.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <button
      onClick={() =>
        setShowNewDep((p) => ({ ...p, [collegeId]: true }))
      }
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
    >
      <Plus className="w-4 h-4" />
      إضافة تخصص
    </button>
  );
}
