"use client";

import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { Input, Card } from "@/components/ui";
import { DepartmentItem } from "./DepartmentItem";
import { AddDepartmentForm } from "./AddDepartmentForm";

type College = FunctionReturnType<typeof api.colleges.listWithDepartments>[number];

interface CollegeRowProps {
  college: College;
  expandedColleges: Set<string>;
  toggleCollege: (id: string) => void;
  editingCollegeId: Id<"colleges"> | null;
  editingCollegeName: string;
  setEditingCollegeId: (id: Id<"colleges"> | null) => void;
  setEditingCollegeName: (name: string) => void;
  handleUpdateCollege: (id: Id<"colleges">) => void;
  handleRemoveCollege: (id: Id<"colleges">) => void;
  editingDepId: Id<"departments"> | null;
  editingDepName: string;
  setEditingDepId: (id: Id<"departments"> | null) => void;
  setEditingDepName: (name: string) => void;
  handleUpdateDep: (id: Id<"departments">) => void;
  handleRemoveDep: (id: Id<"departments">) => void;
  showNewDep: Record<string, boolean>;
  setShowNewDep: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  newDepNames: Record<string, string>;
  setNewDepNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddDep: (collegeId: Id<"colleges">) => void;
}

export function CollegeRow({
  college,
  expandedColleges,
  toggleCollege,
  editingCollegeId,
  editingCollegeName,
  setEditingCollegeId,
  setEditingCollegeName,
  handleUpdateCollege,
  handleRemoveCollege,
  editingDepId,
  editingDepName,
  setEditingDepId,
  setEditingDepName,
  handleUpdateDep,
  handleRemoveDep,
  showNewDep,
  setShowNewDep,
  newDepNames,
  setNewDepNames,
  handleAddDep,
}: CollegeRowProps) {
  const isExpanded = expandedColleges.has(college._id);
  const isEditingThis = editingCollegeId === college._id;
  return (
    <Card key={college._id} className="overflow-hidden">
      {/* College Row */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => toggleCollege(college._id)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {isEditingThis ? (
          <Input
            value={editingCollegeName}
            onChange={(e) => setEditingCollegeName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateCollege(college._id)}
            className="flex-1"
            autoFocus
          />
        ) : (
          <button
            onClick={() => toggleCollege(college._id)}
            className="flex-1 text-right font-extrabold text-base"
          >
            {college.name}
            <span className="mr-2 text-sm font-normal text-muted-foreground">
              ({college.departments.length} تخصص)
            </span>
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {isEditingThis ? (
            <>
              <button
                onClick={() => handleUpdateCollege(college._id)}
                className="hover:bg-foreground/5 rounded transition-colors p-1.5 text-success"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingCollegeId(null)}
                className="hover:bg-foreground/5 rounded transition-colors p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditingCollegeId(college._id);
                  setEditingCollegeName(college.name);
                }}
                className="hover:bg-foreground/5 rounded transition-colors p-1.5"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRemoveCollege(college._id)}
                className="hover:bg-foreground/5 rounded transition-colors p-1.5 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Departments */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3 space-y-2">
          {college.departments.map((dep) => (
            <DepartmentItem
              key={dep._id}
              dep={dep}
              editingDepId={editingDepId}
              editingDepName={editingDepName}
              setEditingDepId={setEditingDepId}
              setEditingDepName={setEditingDepName}
              handleUpdateDep={handleUpdateDep}
              handleRemoveDep={handleRemoveDep}
            />
          ))}

          {/* Add Department */}
          <AddDepartmentForm
            collegeId={college._id}
            showNewDep={showNewDep}
            setShowNewDep={setShowNewDep}
            newDepNames={newDepNames}
            setNewDepNames={setNewDepNames}
            handleAddDep={handleAddDep}
          />
        </div>
      )}
    </Card>
  );
}
