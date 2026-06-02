"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Folder } from "@/lib/db/schema";

const ICONS = ["📁", "💼", "👤", "⭐", "🔧", "📊", "💡", "🎯", "🔗", "📝", "🏢", "🌐"];
const COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#84cc16", "#f97316", "#64748b",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Folder>) => void;
  initial?: Partial<Folder>;
  parentId?: string;
}

export function FolderDialog({ open, onClose, onSave, initial, parentId }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "📁");
  const [color, setColor] = useState(initial?.color ?? "#6366f1");
  const [type, setType] = useState<"personal" | "work" | "shared">(
    (initial?.type as "personal" | "work" | "shared") ?? "shared"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...initial, name, icon, color, type, parentId });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "폴더 편집" : "폴더 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">폴더 이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 업무 도구"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>용도</Label>
            <div className="flex gap-2">
              {(["shared", "work", "personal"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    type === t
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "border-border text-muted-foreground hover:border-indigo-300"
                  }`}
                >
                  {t === "shared" ? "공용" : t === "work" ? "업무" : "개인"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>아이콘</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${
                    icon === ic ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-border hover:border-indigo-300"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>색상</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>취소</Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
