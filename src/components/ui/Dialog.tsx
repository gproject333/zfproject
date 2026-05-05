"use client";

import { Modal, ModalCloseTrigger } from "@heroui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Controlled modal — thin adapter on top of HeroUI's Modal so existing
 * callers keep using `open` / `onOpenChange` without learning the
 * `isOpen` rename.
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      {children}
    </Modal>
  );
}

interface DialogContentProps {
  children: ReactNode;
  /** Optional visible heading. When omitted, an sr-only heading is used so the dialog still has an accessible name. */
  title?: string;
  description?: string;
  className?: string;
  showClose?: boolean;
}

export function DialogContent({
  children,
  title,
  description,
  className,
  showClose = true,
}: DialogContentProps) {
  return (
    <>
      <Modal.Backdrop />
      <Modal.Container placement="center" className="justify-center">
        <Modal.Dialog className={`my-auto ${className ?? ""}`} dir="rtl">
          {title || description || showClose ? (
            <Modal.Header className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                {title ? (
                  <Modal.Heading className="text-lg font-extrabold">{title}</Modal.Heading>
                ) : (
                  <Modal.Heading className="sr-only">مربع حوار</Modal.Heading>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              {showClose && (
                <ModalCloseTrigger
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-card hover:bg-muted shrink-0"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </ModalCloseTrigger>
              )}
            </Modal.Header>
          ) : (
            <Modal.Heading className="sr-only">مربع حوار</Modal.Heading>
          )}
          {children}
        </Modal.Dialog>
      </Modal.Container>
    </>
  );
}

/**
 * Compatibility re-export. New call sites should prefer
 * `<Button onPress={() => onOpenChange(false)}>` because
 * `ModalCloseTrigger` does not support Radix's `asChild` slot pattern.
 */
export const DialogClose = ModalCloseTrigger;
