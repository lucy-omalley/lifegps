"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/discovery/images";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string | undefined) => void;
  onError?: (message: string) => void;
}

export function ImageUpload({ label, value, onChange, onError }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    setLoading(true);
    try {
      const { compressImageForUpload } = await import("@/lib/discovery/images");
      const base64 = await compressImageForUpload(file);
      onChange(base64);
    } catch {
      onError?.("Failed to process image. Please try another file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="max-h-48 w-full object-contain bg-muted/30" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-10 transition-colors hover:border-teal-500/40 hover:bg-teal-500/5"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {loading ? "Processing..." : "Click to upload image"}
          </span>
          <span className="text-xs text-muted-foreground">JPEG, PNG, or WebP · Max 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
