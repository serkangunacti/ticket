"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  src: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
};

const CONTAINER = 280;
const OUTPUT = 128;

export function ImageCropper({ src, onCrop, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState({ w: 1, h: 1 });
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  /* Load image and center it initially */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      const bs = Math.max(
        CONTAINER / img.naturalWidth,
        CONTAINER / img.naturalHeight,
      );
      const dw = img.naturalWidth * bs;
      const dh = img.naturalHeight * bs;
      setPos({ x: (CONTAINER - dw) / 2, y: (CONTAINER - dh) / 2 });
    };
    img.src = src;
  }, [src]);

  const baseScale = Math.max(CONTAINER / natural.w, CONTAINER / natural.h);
  const dispW = natural.w * baseScale * zoom;
  const dispH = natural.h * baseScale * zoom;

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const p = "touches" in e ? e.touches[0] : e;
      dragRef.current = {
        sx: p.clientX,
        sy: p.clientY,
        ox: pos.x,
        oy: pos.y,
      };
    },
    [pos],
  );

  const onMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragRef.current) return;
      const p = "touches" in e ? e.touches[0] : e;
      setPos({
        x: dragRef.current.ox + p.clientX - dragRef.current.sx,
        y: dragRef.current.oy + p.clientY - dragRef.current.sy,
      });
    },
    [],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = natural.w / dispW;
    const scaleY = natural.h / dispH;
    const srcX = Math.max(0, -pos.x * scaleX);
    const srcY = Math.max(0, -pos.y * scaleY);
    const srcW = CONTAINER * scaleX;
    const srcH = CONTAINER * scaleY;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT, OUTPUT);
    onCrop(canvas.toDataURL("image/png", 0.9));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-[340px] rounded-2xl bg-[#0f2745] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 text-sm font-semibold text-white">
          Logoyu kırpın
        </p>
        <p className="mb-3 text-xs text-white/40">
          Görüntüyü sürükleyerek konumlandırın
        </p>

        <div
          className="relative mx-auto cursor-move overflow-hidden rounded-xl border border-white/15"
          style={{
            width: CONTAINER,
            height: CONTAINER,
            background:
              "repeating-conic-gradient(#1a3a5c 0% 25%, #0f2745 0% 50%) 50% / 20px 20px",
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
              width: dispW,
              height: dispH,
              transform: `translate(${pos.x}px, ${pos.y}px)`,
            }}
          />
          {/* Crop frame overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-dashed border-white/25" />
        </div>

        <div className="mt-4 flex items-center gap-3 text-white/50">
          <ZoomOut className="h-4 w-4 shrink-0" />
          <input
            type="range"
            min="1"
            max="4"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#37c2e8]"
          />
          <ZoomIn className="h-4 w-4 shrink-0" />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-white/50 transition hover:bg-white/10 hover:text-white/80"
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
    </div>
  );
}
