"use client";

import { useState, useRef } from "react";
import { Building2, Pencil, Check, X, Upload } from "lucide-react";

import { ImageCropper } from "./image-cropper";

type HeaderBrandProps = {
  companyName: string;
  logoDataUrl: string | null;
  canEdit: boolean;
  updateAction: (formData: FormData) => Promise<void>;
};

export function HeaderBrand({
  companyName,
  logoDataUrl,
  canEdit,
  updateAction,
}: HeaderBrandProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(companyName);
  const [logoPreview, setLogoPreview] = useState<string | null>(logoDataUrl);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!editing) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/8">
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-5 w-5 text-[#8de7ff]" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {companyName}
          </span>
          {canEdit ? (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white/70"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      alert("Logo dosyası 2 MB'den küçük olmalıdır.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("companyName", name);
      if (logoPreview !== logoDataUrl) {
        fd.set("logoDataUrl", logoPreview ?? "");
      }
      await updateAction(fd);
      setEditing(false);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(companyName);
    setLogoPreview(logoDataUrl);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10"
      >
        {logoPreview ? (
          <img
            src={logoPreview}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Upload className="h-4 w-4 text-[#8de7ff]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Upload className="h-3.5 w-3.5 text-white" />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleLogoChange}
        />
      </button>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 w-48 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none focus:border-[#37c2e8]/50"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-[#37c2e8]/20 p-1.5 text-[#8de7ff] transition hover:bg-[#37c2e8]/30 disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleCancel}
        className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/80"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {cropSrc ? (
        <ImageCropper
          src={cropSrc}
          onCrop={(dataUrl) => {
            setLogoPreview(dataUrl);
            setCropSrc(null);
          }}
          onCancel={() => setCropSrc(null)}
        />
      ) : null}
    </div>
  );
}
