"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Plus,
  Check,
  X,
  BookOpen,
  Download,
} from "lucide-react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { toast } from "@/lib/toast";
import { Button, Input, Card} from "@/components/ui";
import { CollegeRow } from "./CollegeRow";

export default function CollegesManager() {
  const data = useQuery(api.colleges.listWithDepartments, {});
  const createCollege = useMutation(api.colleges.create);
  const updateCollege = useMutation(api.colleges.update);
  const removeCollege = useMutation(api.colleges.remove);
  const addDepartment = useMutation(api.colleges.addDepartment);
  const updateDepartment = useMutation(api.colleges.updateDepartment);
  const removeDepartment = useMutation(api.colleges.removeDepartment);
  const seed = useMutation(api.colleges.seed);

  const [newCollegeName, setNewCollegeName] = useState("");
  const [showNewCollege, setShowNewCollege] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<Id<"colleges"> | null>(null);
  const [editingCollegeName, setEditingCollegeName] = useState("");
  const [expandedColleges, setExpandedColleges] = useState<Set<string>>(new Set());
  const [newDepNames, setNewDepNames] = useState<Record<string, string>>({});
  const [showNewDep, setShowNewDep] = useState<Record<string, boolean>>({});
  const [editingDepId, setEditingDepId] = useState<Id<"departments"> | null>(null);
  const [editingDepName, setEditingDepName] = useState("");

  const toggleCollege = (id: string) => {
    setExpandedColleges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSeed = async () => {
    try {
      await seed({});
      toast.success("تم استيراد الكليات الافتراضية بنجاح");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const handleCreateCollege = async () => {
    if (!newCollegeName.trim()) return;
    try {
      await createCollege({ name: newCollegeName });
      setNewCollegeName("");
      setShowNewCollege(false);
      toast.success("تمت إضافة الكلية");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const handleUpdateCollege = async (id: Id<"colleges">) => {
    if (!editingCollegeName.trim()) return;
    try {
      await updateCollege({ id, name: editingCollegeName });
      setEditingCollegeId(null);
      toast.success("تم تعديل اسم الكلية");
    } catch {
      toast.error("حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const handleRemoveCollege = async (id: Id<"colleges">) => {
    if (!confirm("هل تؤكد حذف هذه الكلية وجميع التخصصات التابعة لها؟")) return;
    try {
      await removeCollege({ id });
      toast.success("تم حذف الكلية");
    } catch {
      toast.error("حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const handleAddDep = async (collegeId: Id<"colleges">) => {
    const name = newDepNames[collegeId]?.trim();
    if (!name) return;
    try {
      await addDepartment({ collegeId, name });
      setNewDepNames((p) => ({ ...p, [collegeId]: "" }));
      setShowNewDep((p) => ({ ...p, [collegeId]: false }));
      toast.success("تمت إضافة التخصص");
    } catch {
      toast.error("حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const handleUpdateDep = async (id: Id<"departments">) => {
    if (!editingDepName.trim()) return;
    try {
      await updateDepartment({ id, name: editingDepName });
      setEditingDepId(null);
      toast.success("تم تعديل اسم التخصص");
    } catch {
      toast.error("حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const handleRemoveDep = async (id: Id<"departments">) => {
    if (!confirm("هل تؤكد حذف هذا التخصص؟")) return;
    try {
      await removeDepartment({ id });
      toast.success("تم حذف التخصص");
    } catch {
      toast.error("حدث خطأ أثناء تنفيذ العملية");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold mb-1">إدارة الكليات والتخصصات</h2>
          <p className="text-muted-foreground font-medium">إضافة الكليات والتخصصات وتعديلها وحذفها</p>
        </div>
        <div className="flex gap-2">
          {data !== undefined && data.length === 0 && (
            <button
              onClick={handleSeed}
              className="hover:bg-foreground/5 rounded transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              استيراد الكليات الافتراضية
            </button>
          )}
          <Button
            onPress={() => setShowNewCollege(!showNewCollege)}
            variant="primary"
            size="sm"
          >
            {showNewCollege ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            إضافة كلية
          </Button>
        </div>
      </div>

      {/* New College Form */}
      {showNewCollege && (
        <Card className="p-4 flex gap-3 items-center">
          <Input
            value={newCollegeName}
            onChange={(e) => setNewCollegeName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateCollege()}
            placeholder="اسم الكلية الجديدة"
            className="flex-1"
            autoFocus
          />
          <Button onPress={handleCreateCollege} variant="primary" size="sm">
            <Check className="w-4 h-4" />
            حفظ
          </Button>
          <button onClick={() => setShowNewCollege(false)} className="hover:bg-foreground/5 rounded transition-colors p-2">
            <X className="w-4 h-4" />
          </button>
        </Card>
      )}

      {/* Colleges List */}
      {data === undefined ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">لا توجد كليات مضافة بعد</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((college) => (
            <CollegeRow
              key={college._id}
              college={college}
              expandedColleges={expandedColleges}
              toggleCollege={toggleCollege}
              editingCollegeId={editingCollegeId}
              editingCollegeName={editingCollegeName}
              setEditingCollegeId={setEditingCollegeId}
              setEditingCollegeName={setEditingCollegeName}
              handleUpdateCollege={handleUpdateCollege}
              handleRemoveCollege={handleRemoveCollege}
              editingDepId={editingDepId}
              editingDepName={editingDepName}
              setEditingDepId={setEditingDepId}
              setEditingDepName={setEditingDepName}
              handleUpdateDep={handleUpdateDep}
              handleRemoveDep={handleRemoveDep}
              showNewDep={showNewDep}
              setShowNewDep={setShowNewDep}
              newDepNames={newDepNames}
              setNewDepNames={setNewDepNames}
              handleAddDep={handleAddDep}
            />
          ))}
        </div>
      )}
    </div>
  );
}
