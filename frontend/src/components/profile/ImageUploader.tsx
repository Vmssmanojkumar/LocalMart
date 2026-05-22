import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Check, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  currentImage?: string;
  fallback: React.ReactNode;
  onUpload: (dataUrl: string) => Promise<void>;
  shape?: "circle" | "square";
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ImageUploader({
  currentImage,
  fallback,
  onUpload,
  shape = "circle",
  size = "md",
  label = "Change photo",
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  const processFile = useCallback((file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, or WEBP images allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      await onUpload(preview);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displaySrc = preview || currentImage;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        {/* Main avatar */}
        <div
          className={`${sizeClasses[size]} ${shapeClass} overflow-hidden ring-4 ring-background shadow-soft bg-primary/10 flex items-center justify-center`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {displaySrc ? (
            <img src={displaySrc} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            fallback
          )}
          <AnimatePresence>
            {dragging && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`absolute inset-0 ${shapeClass} bg-primary/70 flex flex-col items-center justify-center text-white text-xs gap-1`}
              >
                <ImageIcon className="h-5 w-5" />
                <span>Drop here</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Camera overlay button */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center ${shapeClass === "rounded-full" ? "rounded-full" : "rounded-xl"} bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition`}
          aria-label={label}
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
        />
      </div>

      {/* Preview actions */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={handleSave}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              <Check className="h-3 w-3" />
              {uploading ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setPreview(null)}
              className="flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1.5 text-xs font-medium hover:bg-foreground/20"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </motion.div>
        )}
        {!preview && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-foreground/5 transition"
          >
            <Upload className="h-3 w-3" /> {label}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
