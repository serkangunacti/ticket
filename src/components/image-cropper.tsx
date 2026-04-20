"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

import { getCroppedSquareDataUrl } from "@/lib/image-utils";

type Props = {
  src: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
};

const VIEW = 272;
const OUTPUT = 128;
const BG = "#071526";

export function ImageCropper({ src, onCrop, onCancel }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const deferredArea = useDeferredValue(croppedAreaPixels);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPreview(null);
  }, [src]);

  useEffect(() => {
    let cancelled = false;

    if (!deferredArea) {
      return undefined;
    }

    void (async () => {
      const nextPreview = await getCroppedSquareDataUrl(
        src,
        deferredArea,
        OUTPUT,
        BG,
      );

      if (cancelled) {
        return;
      }

      startTransition(() => {
        setPreview(nextPreview);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [deferredArea, src]);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCrop = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    const dataUrl = await getCroppedSquareDataUrl(
      src,
      croppedAreaPixels,
      OUTPUT,
      BG,
    );
    onCrop(dataUrl);
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-[408px] rounded-[28px] border border-white/10 bg-[#0c1f38] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Logo kırpma</p>
            <p className="mt-0.5 text-[0.7rem] text-white/35">
              Sürükleyip yerleştirin, yakınlaştırıp portal görünümünü kontrol edin
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

        <div className="flex items-start gap-4">
          <div
            className="cropper-stage relative shrink-0 overflow-hidden rounded-[24px] border border-white/12 bg-[#071526] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            style={{ width: VIEW, height: VIEW }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(55,194,232,0.12),transparent_55%)]" />
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              minZoom={1}
              maxZoom={4}
              objectFit="contain"
              showGrid={false}
              restrictPosition
              disableAutomaticStylesInjection
              cropShape="rect"
              cropSize={{ width: VIEW, height: VIEW }}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, nextPixels) => {
                setCroppedAreaPixels(nextPixels);
              }}
              style={{
                containerStyle: {
                  backgroundColor: "transparent",
                },
                mediaStyle: {
                  filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.45))",
                },
                cropAreaStyle: {
                  border: "none",
                  boxShadow: "none",
                },
              }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/18" />
            <div className="pointer-events-none absolute inset-[14px] rounded-[18px] border border-white/10" />
            <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 rounded-tl border-l-2 border-t-2 border-white/40" />
            <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 rounded-tr border-r-2 border-t-2 border-white/40" />
            <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 rounded-bl border-b-2 border-l-2 border-white/40" />
            <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 rounded-br border-b-2 border-r-2 border-white/40" />
          </div>

          <div className="flex min-w-[88px] flex-col items-center gap-2">
            <span className="text-[0.6rem] font-medium uppercase tracking-wider text-white/30">
              Portal
            </span>
            <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-[#071526] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-contain" />
              ) : null}
            </div>
            <div className="mt-1 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#071526]">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-contain" />
              ) : null}
            </div>
            <p className="px-1 text-center text-[0.62rem] leading-4 text-white/28">
              Header kutusunda böyle görünecek
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#1e466c] bg-[#0f2845] px-4 py-3">
          <div className="flex items-center gap-3">
            <ZoomOut className="h-3.5 w-3.5 shrink-0 text-white/30" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#37c2e8]"
            />
            <ZoomIn className="h-3.5 w-3.5 shrink-0 text-white/30" />
            <span className="w-10 text-right text-[0.65rem] tabular-nums text-white/30">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

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

        <style jsx global>{`
          .cropper-stage .reactEasyCrop_Container {
            position: absolute;
            inset: 0;
            overflow: hidden;
            user-select: none;
            touch-action: none;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cropper-stage .reactEasyCrop_Container:active {
            cursor: grabbing;
          }

          .cropper-stage .reactEasyCrop_Image,
          .cropper-stage .reactEasyCrop_Video {
            will-change: transform;
          }

          .cropper-stage .reactEasyCrop_Contain {
            max-width: 100%;
            max-height: 100%;
            margin: auto;
            position: absolute;
            inset: 0;
          }

          .cropper-stage .reactEasyCrop_CropArea {
            display: none;
          }
        `}</style>
      </div>
    </div>,
    document.body,
  );
}
