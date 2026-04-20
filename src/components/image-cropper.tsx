"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

type Props = {
  src: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
};

const VIEW = 260;
const OUTPUT = 128;
const BG = "#071526"; // header arka plan rengi — boş alanları doldurur

export function ImageCropper({ src, onCrop, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [nat, setNat] = useState({ w: 1, h: 1 });
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState<string | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const prevZoomRef = useRef(1);

  /* FIT: tüm görsel viewport'a sığsın */
  const fitScale = Math.min(VIEW / Math.max(nat.w, 1), VIEW / Math.max(nat.h, 1));
  const scale = fitScale * zoom;
  const imgW = nat.w * scale;
  const imgH = nat.h * scale;

  /* Load image & center */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setNat({ w: img.naturalWidth, h: img.naturalHeight });
      const fs = Math.min(VIEW / img.naturalWidth, VIEW / img.naturalHeight);
      setOff({
        x: (VIEW - img.naturalWidth * fs) / 2,
        y: (VIEW - img.naturalHeight * fs) / 2,
      });
      setZoom(1);
      prevZoomRef.current = 1;
    };
    img.src = src;
  }, [src]);

  /* Keep viewport center stable on zoom */
  useEffect(() => {
    const oldZ = prevZoomRef.current;
    if (oldZ === zoom) return;
    const ratio = zoom / oldZ;
    const cx = VIEW / 2;
    const cy = VIEW / 2;
    setOff((prev) => ({
      x: cx - (cx - prev.x) * ratio,
      y: cy - (cy - prev.y) * ratio,
    }));
    prevZoomRef.current = zoom;
  }, [zoom]);

  /* Canvas render helper (shared by preview & final crop) */
  const renderCrop = useCallback(
    (quality: number) => {
      const img = imgRef.current;
      if (!img || nat.w <= 1) return null;
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      /* Fill background so no transparent areas */
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, OUTPUT, OUTPUT);
      /* Map viewport → source pixels */
      const s = fitScale * zoom;
      const ratio = OUTPUT / VIEW;
      const dx = off.x * ratio;
      const dy = off.y * ratio;
      const dw = imgW * ratio;
      const dh = imgH * ratio;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);
      return canvas.toDataURL("image/png", quality);
    },
    [off, zoom, nat, fitScale, imgW, imgH],
  );

  /* Live preview */
  useEffect(() => {
    const url = renderCrop(0.7);
    if (url) setPreview(url);
  }, [renderCrop]);

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const p = "touches" in e ? e.touches[0] : e;
      dragRef.current = { sx: p.clientX, sy: p.clientY, ox: off.x, oy: off.y };
    },
    [off],
  );

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    const p = "touches" in e ? e.touches[0] : e;
    setOff({
      x: dragRef.current.ox + p.clientX - dragRef.current.sx,
      y: dragRef.current.oy + p.clientY - dragRef.current.sy,
    });
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    prevZoomRef.current = 1;
    setOff({
      x: (VIEW - nat.w * fitScale) / 2,
      y: (VIEW - nat.h * fitScale) / 2,
    });
  }, [nat, fitScale]);

  const handleCrop = () => {
    const url = renderCrop(0.9);
    if (url) onCrop(url);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-[380px] rounded-2xl border border-white/10 bg-[#0c1f38] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Logo kırpma</p>
            <p className="mt-0.5 text-[0.7rem] text-white/35">
              Sürükle &amp; yakınlaştır, ardından kırp
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[0.65rem] text-white/40 transition hover:bg-white/8 hover:text-white/70"
            title="Sıfırla"
          >
            <RotateCcw className="h-3 w-3" />
            Sıfırla
          </button>
        </div>

        {/* Main crop area + preview */}
        <div className="flex items-start gap-4">
          {/* Crop viewport */}
          <div
            className="relative shrink-0 cursor-move overflow-hidden rounded-xl border border-white/12"
            style={{
              width: VIEW,
              height: VIEW,
              backgroundColor: BG,
            }}
            onMouseDown={startDrag}
            onMouseMove={onMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={startDrag}
            onTouchMove={onMove}
            onTouchEnd={endDrag}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 select-none"
              style={{
                width: imgW,
                height: imgH,
                transform: `translate(${off.x}px, ${off.y}px)`,
                willChange: "transform",
              }}
            />
            {/* Crop frame */}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-inset ring-white/20" />
            {/* Corner marks */}
            <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-white/40 rounded-tl" />
            <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-white/40 rounded-tr" />
            <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-white/40 rounded-bl" />
            <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-white/40 rounded-br" />
          </div>

          {/* Live preview */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[0.6rem] font-medium uppercase tracking-wider text-white/30">
              Önizleme
            </span>
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-white/12 bg-[#071526]">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full" />
              ) : null}
            </div>
            <div className="mt-1 h-8 w-8 overflow-hidden rounded-lg border border-white/10 bg-[#071526]">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full" />
              ) : null}
            </div>
          </div>
        </div>

        {/* Zoom slider */}
        <div className="mt-4 flex items-center gap-3">
          <ZoomOut className="h-3.5 w-3.5 shrink-0 text-white/30" />
          <input
            type="range"
            min="1"
            max="5"
            step="0.02"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#37c2e8]"
          />
          <ZoomIn className="h-3.5 w-3.5 shrink-0 text-white/30" />
          <span className="w-10 text-right text-[0.65rem] tabular-nums text-white/30">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-white/40 transition hover:bg-white/8 hover:text-white/70"
          >
            İptal
          </button>
          <button
            onClick={handleCrop}
            className="rounded-lg bg-[#37c2e8]/20 px-4 py-2 text-sm font-semibold text-[#8de7ff] transition hover:bg-[#37c2e8]/30"
          >
            Kırp ve uygula
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
