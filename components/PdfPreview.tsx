"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const RED = "#C8102E";

interface Props {
  url: string;
  fileName: string;
  fileSize: string;
  onReplace: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PdfPreview({ url, fileName, fileSize, onReplace, onFileChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1.3);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const renderingRef = useRef(false);
  const pendingRef = useRef<{ page: number; scale: number } | null>(null);

  const renderPage = useCallback(async (pageNum: number, scale: number) => {
    if (renderingRef.current) {
      pendingRef.current = { page: pageNum, scale };
      return;
    }
    renderingRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument(url).promise;
      setPageCount(pdf.numPages);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas) { renderingRef.current = false; return; }

      const ctx = canvas.getContext("2d");
      if (!ctx) { renderingRef.current = false; return; }

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
      setLoading(false);
    } catch (e) {
      console.error("PDF render failed:", e);
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setError(true);
      setLoading(false);
    } finally {
      renderingRef.current = false;
      if (pendingRef.current) {
        const { page, scale } = pendingRef.current;
        pendingRef.current = null;
        renderPage(page, scale);
      }
    }
  }, [url]);

  useEffect(() => {
    renderPage(currentPage, zoom);
  }, [renderPage, currentPage, zoom]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: RED }}>PDF</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#111" }}>{fileName}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#999" }}>{fileSize}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {pageCount > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "2px 6px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}
                style={{ background:"none", border:"none", cursor: currentPage===1?"default":"pointer", fontSize:14, color: currentPage===1?"#ccc":"#555", padding:"0 4px" }}>‹</button>
              <span style={{ fontSize:11, fontWeight:600, color:"#555", minWidth:50, textAlign:"center" }}>{currentPage} / {pageCount}</span>
              <button onClick={() => setCurrentPage(p => Math.min(pageCount, p+1))} disabled={currentPage===pageCount}
                style={{ background:"none", border:"none", cursor: currentPage===pageCount?"default":"pointer", fontSize:14, color: currentPage===pageCount?"#ccc":"#555", padding:"0 4px" }}>›</button>
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:4, background:"#fff", border:"1px solid #e0e0e0", borderRadius:8, padding:"2px 6px" }}>
            <button onClick={() => setZoom(z => Math.max(0.5, +(z-0.15).toFixed(2)))}
              style={{ background:"none", border:"none", cursor:"pointer", width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#555", fontWeight:700 }}>−</button>
            <span style={{ fontSize:11, fontWeight:600, color:"#555", minWidth:38, textAlign:"center" }}>{Math.round(zoom*100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, +(z+0.15).toFixed(2)))}
              style={{ background:"none", border:"none", cursor:"pointer", width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#555", fontWeight:700 }}>+</button>
          </div>
          <button onClick={onReplace}
            style={{ background:"none", border:"1px solid #e0e0e0", borderRadius:6, cursor:"pointer", fontSize:12, color:"#555", padding:"4px 12px", fontWeight:500 }}>Replace</button>
        </div>
      </div>

      <div style={{ background:"#e5e7eb", padding:"20px 16px", display:"flex", justifyContent:"center", overflowY:"auto", maxHeight:800, minHeight:300 }}>
        {error ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, color:"#888", fontSize:13, gap:8 }}>
            <span>Preview unavailable — file is ready for analysis.</span>
            {errorMsg && <span style={{ fontSize:11, color:"#f87171", maxWidth:320, textAlign:"center", wordBreak:"break-word" }}>{errorMsg}</span>}
          </div>
        ) : (
          <div style={{ position:"relative", background:"#fff", boxShadow:"0 4px 20px rgba(0,0,0,0.15)", display:"inline-block" }}>
            {loading && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", zIndex:1, minWidth:400, minHeight:200 }}>
                <div style={{ width:24, height:24, border:"3px solid #eee", borderTopColor:RED, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              </div>
            )}
            <canvas ref={canvasRef} style={{ display:"block", maxWidth:"100%" }} />
          </div>
        )}
      </div>

      <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", background:"#f9fafb", borderTop:"1px solid #e5e7eb", cursor:"pointer", fontSize:12, color:"#666", fontWeight:500 }}>
        <input type="file" accept=".pdf,.docx,.txt" style={{ display:"none" }} onChange={onFileChange} />
        📎 Upload a different file
      </label>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
