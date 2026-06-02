"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Folder } from "@/lib/db/schema";

const ICONS = ["📁", "💼", "👤", "⭐", "🔧", "📊", "💡", "🎯", "🔗", "📝", "🏢", "🌐"];
const COLORS = [
  "#1967D2", "#1E8E3E", "#D93025", "#F29900", "#9334E6",
  "#00ACC1", "#E8710A", "#F439A0", "#4CAF50", "#607D8B",
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
  const [color, setColor] = useState(initial?.color ?? "#1967D2");
  const [type, setType] = useState<"personal" | "work" | "shared">(
    (initial?.type as "personal" | "work" | "shared") ?? "shared"
  );

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setIcon(initial?.icon ?? "📁");
      setColor(initial?.color ?? "#1967D2");
      setType((initial?.type as "personal" | "work" | "shared") ?? "shared");
    }
  }, [open]);

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
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              폴더 이름
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 업무 도구"
              className="h-9 text-[13px]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              용도
            </Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["shared", "work", "personal"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-[13px] font-medium transition-all border-r border-border last:border-r-0
                    ${type === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {t === "shared" ? "공용" : t === "work" ? "업무" : "개인"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              아이콘
            </Label>
            <div className="grid grid-cols-6 gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all
                    ${icon === ic
                      ? "bg-secondary ring-2 ring-primary/40"
                      : "hover:bg-muted border border-transparent hover:border-border"
                    }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              색상
            </Label>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${color === c ? "ring-2 ring-offset-2 ring-foreground/40 scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
              취소
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              저장
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
