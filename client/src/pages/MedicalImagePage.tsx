import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Eye,
  Image as ImageIcon,
  Loader2,
  ShieldAlert,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AiConfigNotice } from "@/components/AiConfigNotice";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useBlobUrl } from "@/hooks/useBlobUrl";
import { api } from "@/services/api";
import type { UploadedMedicalImage } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatBytes, formatDateTime } from "@/utils/format";

export function MedicalImagePage() {
  const { aiConfigured } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<UploadedMedicalImage[]>([]);
  const [selected, setSelected] = useState<UploadedMedicalImage | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageContext, setImageContext] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { blobUrl: storedImageUrl } = useBlobUrl(
    selected ? `/api/images/${selected.id}/file` : null
  );

  useEffect(() => {
    api
      .listImages()
      .then((list) => {
        setImages(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!pendingFile) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const handleSelectFile = (file: File) => {
    setError(null);
    const lower = file.name.toLowerCase();
    if (![".jpg", ".jpeg", ".png"].some((ext) => lower.endsWith(ext))) {
      setError("Only JPG, JPEG, and PNG images are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be 10 MB or smaller.");
      return;
    }
    setPendingFile(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFile) {
      setError("Please select an image first.");
      return;
    }
    setError(null);
    setAnalyzing(true);
    setProgress(0);
    try {
      const created = await api.analyzeImage(pendingFile, imageContext, setProgress);
      setImages((prev) => [created, ...prev]);
      setSelected(created);
      setPendingFile(null);
      setImageContext("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await api.deleteImage(id);
      const remaining = images.filter((i) => i.id !== id);
      setImages(remaining);
      if (selected?.id === id) setSelected(remaining[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete image.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Medical Image Analysis</h1>
        <p className="text-sm text-slate-500">
          Upload a JPG or PNG image for educational Vision AI observations. Images are never
          medically diagnosed by AI.
        </p>
      </div>

      <AiConfigNotice show={!aiConfigured} />

      <DisclaimerBanner
        title="Vision AI Educational Notice"
        message="AI image analysis provides descriptive visual observations only and CANNOT diagnose skin lesions, radiographs, scans, or infections. Always have medical images reviewed by a qualified doctor or radiologist."
      />

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upload Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-blue-600" />
              Upload Image for Review
            </CardTitle>
            <CardDescription>Accepted formats: JPG, JPEG, PNG (max 10 MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSelectFile(f);
                  }}
                />
                <ImageIcon className="h-9 w-9 text-cyan-600" />
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {pendingFile ? pendingFile.name : "Choose a medical image"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {pendingFile ? formatBytes(pendingFile.size) : "Click to upload JPG or PNG"}
                </p>
              </div>

              {localPreview && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                  <img
                    src={localPreview}
                    alt="Selected preview"
                    className="mx-auto max-h-52 rounded-lg object-contain"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="img-ctx">Optional Context</Label>
                <Input
                  id="img-ctx"
                  placeholder="e.g., Photo of forearm rash for 2 days, or knee X-ray print"
                  value={imageContext}
                  onChange={(e) => setImageContext(e.target.value)}
                />
              </div>

              {analyzing && (
                <div className="space-y-1">
                  <Progress value={progress} />
                  <p className="text-right text-xs text-blue-700">Uploading & analyzing... {progress}%</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={analyzing || !pendingFile}>
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing with Vision AI...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Analyze Image Safely
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results & History */}
        <div className="space-y-4 lg:col-span-3">
          {selected ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{selected.original_filename}</CardTitle>
                  <CardDescription>
                    Uploaded {formatDateTime(selected.created_at)}
                    {selected.ai_model ? ` • Model: ${selected.ai_model}` : ""}
                  </CardDescription>
                </div>
                <Badge variant="warning">Educational Observation Only</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {storedImageUrl && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={storedImageUrl}
                      alt={selected.original_filename}
                      className="mx-auto max-h-64 rounded-lg object-contain"
                    />
                  </div>
                )}

                {selected.image_context && (
                  <p className="rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-600">
                    <strong>Provided context:</strong> {selected.image_context}
                  </p>
                )}

                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Observation Summary
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {selected.analysis_summary}
                  </p>
                </div>

                {selected.observations.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      Visual Observations
                    </h3>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {selected.observations.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.limitations && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-950">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <ShieldAlert className="h-4 w-4 text-amber-600" />
                      Limitations & Uncertainty
                    </p>
                    <p className="mt-1 leading-relaxed">{selected.limitations}</p>
                  </div>
                )}

                {selected.recommended_next_steps && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-sm text-blue-950">
                    <p className="font-semibold">Recommended Professional Medical Review</p>
                    <p className="mt-1 leading-relaxed">{selected.recommended_next_steps}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
              <ImageIcon className="h-12 w-12 text-cyan-500/80" />
              <p className="mt-3 font-display text-lg font-bold text-slate-900">
                No Image Selected
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Upload a medical-related image on the left to view AI visual observations and
                limitations.
              </p>
            </Card>
          )}

          {/* Previous Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved Medical Images ({images.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingList ? (
                <div className="flex items-center py-4 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : images.length === 0 ? (
                <p className="text-sm text-slate-500">No medical images analyzed yet.</p>
              ) : (
                images.map((img) => (
                  <div
                    key={img.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border p-3",
                      selected?.id === img.id ? "border-blue-300 bg-blue-50/70" : "border-slate-100"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(img)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {img.original_filename}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(img.file_size_bytes)} • {formatDateTime(img.created_at)}
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label="Delete image"
                      onClick={() => handleDelete(img.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
