"use client";

import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export const Dialog = RDialog.Root;
export const DialogTrigger = RDialog.Trigger;
export const DialogClose = RDialog.Close;

interface DialogContentProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showClose?: boolean;
}

export function DialogContent({
  children,
  title,
  description,
  className = "",
  showClose = true,
}: DialogContentProps) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
      <RDialog.Content
        dir="rtl"
        className={`glass fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-2xl max-w-md w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ${className}`}
      >
        {!title && <RDialog.Title className="sr-only">مربع حوار</RDialog.Title>}
        {!description && <RDialog.Description className="sr-only">محتوى مربع الحوار</RDialog.Description>}
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              {title && (
                <RDialog.Title className="text-lg font-extrabold">{title}</RDialog.Title>
              )}
              {description && (
                <RDialog.Description className="text-sm text-muted-foreground mt-1">
                  {description}
                </RDialog.Description>
              )}
            </div>
            {showClose && (
              <RDialog.Close
                className="w-8 h-8 nb-border rounded-lg flex items-center justify-center bg-card hover:bg-muted shrink-0"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </RDialog.Close>
            )}
          </div>
        )}
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  );
}
