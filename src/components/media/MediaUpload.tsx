"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileImage, FileVideo, FileAudio, FileText, FileArchive } from "lucide-react";

const ACCEPTED_TYPES: Record<string, string[]> = {
  image: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
  ],
};

const ALL_ACCEPTED = Object.values(ACCEPTED_TYPES).flat();
const MAX_SIZE_MB = 100;

interface MediaUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string[];
  maxSizeMb?: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage className="size-8 text-blue-500" />;
  if (mimeType.startsWith("video/")) return <FileVideo className="size-8 text-purple-500" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="size-8 text-green-500" />;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text"))
    return <FileText className="size-8 text-orange-500" />;
  return <FileArchive className="size-8 text-gray-500" />;
}

export function MediaUpload({ onUpload, accept, maxSizeMb = MAX_SIZE_MB }: MediaUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [preview, setPreview] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const acceptedTypes = accept ?? ALL_ACCEPTED;

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type "${file.type}" is not supported.`;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `File size exceeds ${maxSizeMb}MB limit.`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setPreview(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 20, 90));
    }, 200);

    try {
      await onUpload(preview);
      setProgress(100);
      setTimeout(() => {
        setPreview(null);
        setPreviewUrl(null);
        setProgress(0);
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }, 500);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <Upload className="mb-3 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drop a file here or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Max {maxSizeMb}MB. Images, videos, audio, and documents.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {preview && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-4">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={preview.name}
                className="size-16 rounded-lg object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-lg bg-muted/40">
                {getFileIcon(preview.type)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{preview.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(preview.size)} • {preview.type}
              </p>
            </div>
            {!uploading && (
              <Button variant="ghost" size="icon-sm" onClick={handleCancel}>
                <X className="size-4" />
              </Button>
            )}
          </div>

          {uploading && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {progress >= 100 ? "Upload complete" : `Uploading... ${Math.round(progress)}%`}
              </p>
            </div>
          )}

          {!uploading && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={handleUpload}>
                <Upload className="mr-1.5 size-3.5" />
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
