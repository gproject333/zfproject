"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  BookOpen,
  Download,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";

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
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
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
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  const handleUpdateCollege = async (id: Id<"colleges">) => {
    if (!editingCollegeName.trim()) return;
    try {
      await updateCollege({ id, name: editingCollegeName });
      setEditingCollegeId(null);
      toast.success("تم تعديل اسم الكلية");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleRemoveCollege = async (id: Id<"colleges">) => {
    if (!confirm("هل أنت متأكد من حذف هذه الكلية وجميع تخصصاتها؟")) return;
    try {
      await removeCollege({ id });
      toast.success("تم حذف الكلية");
    } catch {
      toast.error("حدث خطأ");
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
      toast.error("حدث خطأ");
    }
  };

  const handleUpdateDep = async (id: Id<"departments">) => {
    if (!editingDepName.trim()) return;
    try {
      await updateDepartment({ id, name: editingDepName });
      setEditingDepId(null);
      toast.success("تم تعديل اسم التخصص");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleRemoveDep = async (id: Id<"departments">) => {
    if (!confirm("هل أنت متأكد من حذف هذا التخصص؟")) return;
    try {
      await removeDepartment({ id });
      toast.success("تم حذف التخصص");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold mb-1">إدارة الكليات والتخصصات</h2>
          <p className="text-muted-foreground font-medium">إضافة وتعديل وحذف الكليات والتخصصات</p>
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
            style={{ background: "#DC2626" }}
          >
            {showNewCollege ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            إضافة كلية
          </Button>
        </div>
      </div>

      {/* New College Form */}
      {showNewCollege && (
        <div className="nb-card p-4 flex gap-3 items-center">
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
        </div>
      )}

      {/* Colleges List */}
      {data === undefined ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="nb-card p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">لا توجد كليات مضافة بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((college) => {
            const isExpanded = expandedColleges.has(college._id);
            const isEditingThis = editingCollegeId === college._id;
            return (
              <div key={college._id} className="nb-card overflow-hidden">
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
                    ))}

                    {/* Add Department */}
                    {showNewDep[college._id] ? (
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          value={newDepNames[college._id] ?? ""}
                          onChange={(e) =>
                            setNewDepNames((p) => ({ ...p, [college._id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleAddDep(college._id)}
                          placeholder="اسم التخصص الجديد"
                          className="flex-1 py-1 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddDep(college._id)}
                          className="hover:bg-foreground/5 rounded transition-colors p-1.5 text-success"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setShowNewDep((p) => ({ ...p, [college._id]: false }))
                          }
                          className="hover:bg-foreground/5 rounded transition-colors p-1.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setShowNewDep((p) => ({ ...p, [college._id]: true }))
                        }
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة تخصص
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
