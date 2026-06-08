"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, VideoIcon, X } from "lucide-react";
import { toast } from "sonner";

export type UploadedMedia = {
  url: string;
  publicId: string;
  type: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
};

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;

export default function MediaUploader({
  media,
  setMedia,
  disabled,
}: {
  media: UploadedMedia[];
  setMedia: (m: UploadedMedia[]) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) return toast.error("Only images or videos");
    const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (file.size > maxMB * 1024 * 1024) {
      return toast.error(`File too large. Max ${maxMB}MB.`);
    }
    if (media.length >= 4) return toast.error("Max 4 media per post");

    setUploading(true);
    try {
      const signRes = await fetch("/api/upload/sign", { method: "POST" });
      if (!signRes.ok) throw new Error("Could not sign upload");
      const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("folder", folder);

      const resourceType = isVideo ? "video" : "image";
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: fd }
      );
      if (!cloudRes.ok) throw new Error("Upload failed");
      const data = await cloudRes.json();
      const newItem: UploadedMedia = {
        url: data.secure_url,
        publicId: data.public_id,
        type: isVideo ? "video" : "image",
        width: data.width,
        height: data.height,
        duration: data.duration,
      };
      setMedia([...media, newItem]);
      toast.success("Uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (i: number) => setMedia(media.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {media.map((m, i) => (
            <div key={m.publicId} className="group relative overflow-hidden rounded-xl bg-slate-100">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="h-40 w-full object-cover" />
              ) : (
                <video src={m.url} className="h-40 w-full object-cover" muted />
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
              {m.type === "video" && (
                <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                  <VideoIcon className="h-3 w-3" /> video
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={disabled || uploading || media.length >= 4}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Photo / Video"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFile}
        />
        <span className="text-xs text-slate-500">
          Images ≤ {MAX_IMAGE_MB}MB · Videos ≤ {MAX_VIDEO_MB}MB
        </span>
      </div>
    </div>
  );
}
