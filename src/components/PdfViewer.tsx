"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  FileText,
  Loader2,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const DEFAULT_ZOOM_INDEX = 2;
const MIN_WIDTH = 320;
const MAX_WIDTH_RATIO = 0.95;
const DEFAULT_WIDTH = 760;

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [containerWidth, setContainerWidth] = useState(0);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  // +1 = left handle (drag left → wider), -1 = right handle (drag right → wider)
  const dragSign = useRef(1);

  const scale = ZOOM_STEPS[zoomIndex];

  const clampWidth = useCallback((w: number) =>
    Math.max(MIN_WIDTH, Math.min(Math.floor(window.innerWidth * MAX_WIDTH_RATIO), w)),
  []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPanelWidth(clampWidth(DEFAULT_WIDTH));
    requestAnimationFrame(() => setVisible(true));
  }, [clampWidth]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const delta = dragSign.current * (dragStartX.current - clientX);
      setPanelWidth(clampWidth(dragStartWidth.current + delta));
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [isDragging, clampWidth]);

  const startDrag = (sign: 1 | -1) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dragSign.current = sign;
    dragStartX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragStartWidth.current = panelWidth;
    setIsDragging(true);
  };

  const goTo = (p: number) => setPage(Math.max(1, Math.min(numPages, p)));

  const handlePageInputBlur = () => {
    const val = parseInt(pageInputRef.current?.value ?? "", 10);
    if (!isNaN(val)) goTo(val);
    else if (pageInputRef.current) pageInputRef.current.value = String(page);
  };

  const renderDragHandle = (sign: 1 | -1) => (
    <div
      onMouseDown={startDrag(sign)}
      onTouchStart={startDrag(sign)}
      className="absolute top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize group z-10 select-none"
      style={{ [sign === 1 ? "left" : "right"]: 0 }}
      title="اسحب لتغيير العرض"
    >
      <div className={`w-1 rounded-full h-16 transition-colors ${isDragging ? "bg-primary" : "bg-foreground/20 group-hover:bg-primary/60"}`} />
      <GripVertical className={`absolute w-4 h-4 transition-colors ${isDragging ? "text-primary" : "text-foreground/30 group-hover:text-primary/70"}`} />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      style={{ cursor: isDragging ? "col-resize" : undefined }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={isDragging ? undefined : handleClose}
      />

      {/* Panel */}
      <div
        className="relative flex flex-col bg-card nb-border nb-shadow-lg rounded-xl overflow-hidden w-full max-w-[calc(100vw-32px)]"
        style={{
          width: panelWidth,
          height: "min(90vh, 900px)",
          transition: isDragging ? "none" : "transform 300ms ease-out, opacity 300ms ease-out",
          transform: visible ? "scale(1)" : "scale(0.95)",
          opacity: visible ? 1 : 0,
        }}
      >
        {renderDragHandle(1)}
        {renderDragHandle(-1)}

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b-2 border-foreground/10 shrink-0">
          <div className="w-8 h-8 bg-destructive/10 nb-border rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold truncate">{title ?? "ملف PDF"}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
              PDF · صفحة {page} من {numPages || "—"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a href={url} download className="w-8 h-8 nb-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors" title="تحميل">
              <Download className="w-4 h-4" />
            </a>
            <a href={url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 nb-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors" title="فتح في تبويب جديد">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={handleClose} className="w-8 h-8 nb-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors" title="إغلاق">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-2 border-b border-foreground/10 bg-muted/30 shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={() => goTo(page - 1)} disabled={page <= 1} className="w-7 h-7 nb-border rounded-md flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs font-bold">
              <input
                ref={pageInputRef}
                type="number"
                min={1}
                max={numPages || 1}
                defaultValue={page}
                key={page}
                onBlur={handlePageInputBlur}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-10 text-center nb-border rounded-md px-1 py-0.5 bg-card text-xs font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-muted-foreground">/ {numPages || "—"}</span>
            </div>
            <button onClick={() => goTo(page + 1)} disabled={page >= numPages} className="w-7 h-7 nb-border rounded-md flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setZoomIndex((i) => Math.max(0, i - 1))} disabled={zoomIndex === 0} className="w-7 h-7 nb-border rounded-md flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="تصغير">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => setZoomIndex(DEFAULT_ZOOM_INDEX)} className="px-2 py-0.5 nb-border rounded-md text-xs font-bold hover:bg-muted transition-colors min-w-[48px] text-center" title="إعادة تعيين الحجم">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))} disabled={zoomIndex === ZOOM_STEPS.length - 1} className="w-7 h-7 nb-border rounded-md flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="تكبير">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-muted/20 flex justify-center py-4" dir="ltr">
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPage(1); }}
            loading={
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground">جاري تحميل الملف...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <p className="text-sm font-bold text-destructive">تعذّر تحميل الملف</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-outline text-sm">
                  <ExternalLink className="w-4 h-4" />
                  فتح في تبويب جديد
                </a>
              </div>
            }
          >
            <Page
              pageNumber={page}
              scale={scale}
              width={containerWidth > 0 ? containerWidth - 32 : undefined}
              renderTextLayer
              className="nb-border rounded-lg overflow-hidden nb-shadow"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
