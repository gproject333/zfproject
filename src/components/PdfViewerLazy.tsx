"use client";

import dynamic from "next/dynamic";

const PdfViewerLazy = dynamic(() => import("./PdfViewer"), { ssr: false });
export default PdfViewerLazy;
