"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Link } from "@/lib/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Link>) => void;
  initial?: Partial<Link>;
  folderId?: string;
}

export function LinkDialog({ open, onClose, onSave, initial, folderId }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setUrl(initial?.url ?? "");
      setDescription(initial?.description ?? "");
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...initial, title, url, description, folderId: folderId ?? initial?.folderId });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "링크 편집" : "링크 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              제목
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) Notion 워크스페이스"
              className="h-9 text-[13px]"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className="h-9 text-[13px]"
              type="url"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              설명 (선택)
            </Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="#키워드 형식으로 입력하세요"
              className="h-9 text-[13px]"
            />
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
