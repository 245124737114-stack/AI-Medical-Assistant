import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AiConfigNotice } from "@/components/AiConfigNotice";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useBlobUrl } from "@/hooks/useBlobUrl";
import { api, fetchProtectedBlob } from "@/services/api";
import type { LabMarker, MedicalReport } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatBytes, formatDateTime } from "@/utils/format";

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

function StatusBadge({ status }: { status: LabMarker["status"] }) {
  if (status === "high") return <Badge variant="danger">HIGH</Badge>;
  if (status === "low") return <Badge variant="warning">LOW</Badge>;
  if (status === "normal") return <Badge variant="success">NORMAL</Badge>;
  return <Badge variant="neutral">RANGE NOT IN REPORT</Badge>;
}

export function ReportSummarizerPage() {
  const { aiConfigured } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [parsedMarkers, setParsedMarkers] = useState<LabMarker[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summarizing, setSummarizing] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const protectedFileUrl = selectedReport ? `/api/reports/${selectedReport.id}/file` : null;
  const { blobUrl: storedFilePreviewUrl } = useBlobUrl(protectedFileUrl);

  const loadReports = async (selectId?: string) => {
    try {
      const list = await api.listReports();
      setReports(list);
      if (selectId) {
        const found = list.find((r) => r.id === selectId) || null;
        setSelectedReport(found);
      } else if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedReport) {
      setParsedMarkers([]);
      return;
    }
    if (selectedReport.summary) {
      setParsedMarkers(selectedReport.summary.lab_markers);
    } else if (selectedReport.extracted_text) {
      api
        .getParsedMarkers(selectedReport.id)
        .then((res) => setParsedMarkers(res.markers))
        .catch(() => setParsedMarkers([]));
    } else {
      setParsedMarkers([]);
    }
  }, [selectedReport]);

  useEffect(() => {
    if (!pendingFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const validateAndSelectFile = (file: File) => {
    setError(null);
    setSuccessMsg(null);
    const lower = file.name.toLowerCase();
    const validExt = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!validExt) {
      setError("Only PDF, JPG, JPEG, and PNG files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or smaller.");
      return;
    }
    setPendingFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setError(null);
    setSuccessMsg(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await api.uploadReport(pendingFile, setUploadProgress);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setReports((prev) => [uploaded, ...prev]);
      setSelectedReport(uploaded);
      setSuccessMsg(
        uploaded.extracted_text
          ? `Uploaded '${uploaded.original_filename}' and extracted readable text.`
          : `Uploaded '${uploaded.original_filename}'. No readable text was extracted (scanned image/PDF without OCR).`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSummarize = async (reportId: string) => {
    setError(null);
    setSuccessMsg(null);
    setSummarizing(true);
    try {
      const updated = await api.summarizeReport(reportId);
      setSelectedReport(updated);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSuccessMsg("AI educational report summary generated and saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarization failed.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleDownloadSummary = async (report: MedicalReport) => {
    setError(null);
    try {
      const { blob, filename } = await fetchProtectedBlob(`/api/reports/${report.id}/summary/download`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${report.original_filename}_summary.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download summary.");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setError(null);
    try {
      await api.deleteReport(reportId);
      const remaining = reports.filter((r) => r.id !== reportId);
      setReports(remaining);
      if (selectedReport?.id === reportId) {
        setSelectedReport(remaining[0] || null);
      }
      setSuccessMsg("Report deleted permanently.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete report.");
    }
  };

  const activeMarkers = selectedReport?.summary?.lab_markers ?? parsedMarkers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Medical Report Summarizer
        </h1>
        <p className="text-sm text-slate-500">
          Upload PDF, JPG, JPEG, or PNG medical reports to extract text, inspect lab markers against
          supplied reference ranges, and generate plain-English summaries.
        </p>
      </div>

      <AiConfigNotice show={!aiConfigured} />

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-blue-600" />
            Upload Medical Report
          </CardTitle>
          <CardDescription>Supported formats: PDF, JPG, JPEG, PNG (max 10 MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) validateAndSelectFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
              dragActive
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/40"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateAndSelectFile(file);
              }}
            />
            <FileSearch className="h-10 w-10 text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900">
              Drag & drop your medical report here, or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Stored privately under your user account with server-side file verification.
            </p>
          </div>

          {pendingFile && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{pendingFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(pendingFile.size)} • {pendingFile.type || "Document"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingFile(null)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpload} disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload & Extract Text"
                    )}
                  </Button>
                </div>
              </div>

              {localPreviewUrl && pendingFile.type.startsWith("image/") && (
                <img
                  src={localPreviewUrl}
                  alt="Pending report preview"
                  className="mt-3 max-h-56 rounded-xl border border-slate-200 object-contain"
                />
              )}

              {uploading && (
                <div className="mt-3 space-y-1">
                  <Progress value={uploadProgress} />
                  <p className="text-right text-xs font-medium text-blue-700">{uploadProgress}%</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports Split View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Saved Reports List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Your Uploaded Reports</CardTitle>
            <CardDescription>{reports.length} saved files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingList ? (
              <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : reports.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                No reports uploaded yet.
              </p>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-xl border p-3 transition-colors",
                    selectedReport?.id === rep.id
                      ? "border-blue-300 bg-blue-50/70"
                      : "border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedReport(rep)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {rep.original_filename}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatBytes(rep.file_size_bytes)} • {formatDateTime(rep.created_at)}
                    </p>
                    <div className="mt-1.5">
                      <Badge variant={rep.summary ? "success" : "default"}>
                        {rep.summary ? "Summarized" : rep.status}
                      </Badge>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label="Delete report"
                    onClick={() => handleDeleteReport(rep.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Report Detail & Summary */}
        <div className="space-y-4 lg:col-span-2">
          {!selectedReport ? (
            <Card className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-blue-500/70" />
              <p className="mt-3 font-display text-lg font-bold text-slate-900">
                Select or Upload a Report
              </p>
              <p className="mt-1 text-sm text-slate-500">
                View extracted text, parsed lab markers, and AI-generated plain-English summaries.
              </p>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle>{selectedReport.original_filename}</CardTitle>
                    <CardDescription>
                      Extraction: {selectedReport.extraction_method} •{" "}
                      {formatBytes(selectedReport.file_size_bytes)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSummarize(selectedReport.id)}
                      disabled={summarizing || !selectedReport.extracted_text}
                    >
                      {summarizing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {selectedReport.summary ? "Re-Generate AI Summary" : "Summarize with AI"}
                        </>
                      )}
                    </Button>
                    {selectedReport.summary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSummary(selectedReport)}
                      >
                        <Download className="h-4 w-4" />
                        Download Summary
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stored File Preview */}
                  {storedFilePreviewUrl && selectedReport.mime_type.startsWith("image/") && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Uploaded Report Preview
                      </p>
                      <img
                        src={storedFilePreviewUrl}
                        alt={selectedReport.original_filename}
                        className="max-h-72 rounded-lg object-contain"
                      />
                    </div>
                  )}

                  {storedFilePreviewUrl && selectedReport.mime_type === "application/pdf" && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        PDF Preview
                      </p>
                      <iframe
                        src={storedFilePreviewUrl}
                        title={selectedReport.original_filename}
                        className="h-64 w-full rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  )}

                  {/* Extracted Text */}
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Extracted Report Text
                    </p>
                    {selectedReport.extracted_text ? (
                      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-700">
                        {selectedReport.extracted_text}
                      </pre>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        No readable text could be extracted automatically ({selectedReport.extraction_method}).
                        For scanned images/PDFs, install Tesseract OCR or configure OPENAI_API_KEY
                        on the server for Vision OCR.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lab Markers Table */}
              {activeMarkers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identified Laboratory Markers</CardTitle>
                    <CardDescription>
                      Values and reference ranges are shown strictly from the uploaded report—never
                      fabricated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                          <th className="py-2.5 pr-4">Marker</th>
                          <th className="py-2.5 pr-4">Measured Value</th>
                          <th className="py-2.5 pr-4">Reference Range</th>
                          <th className="py-2.5 pr-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeMarkers.map((m, idx) => (
                          <tr key={`${m.name}-${idx}`}>
                            <td className="py-3 pr-4">
                              <p className="font-semibold text-slate-900">{m.name}</p>
                              {m.explanation && (
                                <p className="text-xs text-slate-500">{m.explanation}</p>
                              )}
                            </td>
                            <td className="py-3 pr-4 font-mono text-slate-800">
                              {m.value} {m.unit}
                            </td>
                            <td className="py-3 pr-4 text-slate-600">{m.reference_range}</td>
                            <td className="py-3 pr-4">
                              <StatusBadge status={m.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {/* AI Plain-Language Summary */}
              {selectedReport.summary && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>AI Plain-English Summary</CardTitle>
                      {selectedReport.summary.ai_model && (
                        <Badge variant="cyan">{selectedReport.summary.ai_model}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-700">
                    <p className="leading-relaxed">{selectedReport.summary.plain_summary}</p>

                    {selectedReport.summary.medical_terms.length > 0 && (
                      <div>
                        <p className="mb-2 font-semibold text-slate-900">Medical Terms Explained</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {selectedReport.summary.medical_terms.map((t, i) => (
                            <div key={i} className="rounded-xl bg-slate-50 p-3">
                              <p className="font-semibold text-blue-700">{t.term}</p>
                              <p className="mt-0.5 text-xs text-slate-600">{t.simple_explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReport.summary.questions_for_doctor.length > 0 && (
                      <div className="rounded-xl bg-blue-50/70 p-4">
                        <p className="font-semibold text-blue-950">Questions to Ask Your Doctor</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-blue-900">
                          {selectedReport.summary.questions_for_doctor.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <DisclaimerBanner message="Reference ranges vary by laboratory, age, sex, and clinical context. Never make medication or treatment changes without reviewing the original report with a qualified clinician." />
    </div>
  );
}
