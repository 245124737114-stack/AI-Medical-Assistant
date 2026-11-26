import type {
  ActivityItem,
  AuthResponse,
  ChatMessage,
  ChatSendResponse,
  ChatSession,
  DashboardOverview,
  LabMarker,
  LibraryArticle,
  MedicalReport,
  SymptomAnalyzeInput,
  SymptomAnalyzeResult,
  SymptomHistoryItem,
  UploadedMedicalImage,
  User,
} from "@/types/api";

const TOKEN_STORAGE_KEY = "ama_access_token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") {
        detail = data.detail;
      } else if (Array.isArray(data?.detail)) {
        detail = data.detail.map((item: { msg?: string }) => item.msg || "Validation error").join(" ");
      }
    } catch {
      // keep fallback detail
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

export function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", path);
    const token = getStoredToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const parsed = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(parsed as T);
        } else {
          reject(new ApiError(parsed?.detail || `Upload failed (${xhr.status})`, xhr.status));
        }
      } catch {
        reject(new ApiError(`Upload failed (${xhr.status})`, xhr.status));
      }
    };

    xhr.onerror = () => reject(new ApiError("Network error while uploading file.", 0));
    xhr.send(formData);
  });
}

export async function fetchProtectedBlob(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const token = getStoredToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(path, { headers });
  if (!response.ok) {
    throw new ApiError(`Unable to load file (${response.status})`, response.status);
  }
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/i);
  const blob = await response.blob();
  return { blob, filename: match ? match[1] : null };
}

export const api = {
  health: () =>
    request<{
      status: string;
      ai_configured: boolean;
      ai_provider: string;
      chat_model: string;
      vision_model: string;
      tesseract_ocr_available: boolean;
    }>("/api/health"),

  // Auth
  register: (payload: { full_name: string; email: string; password: string }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () => request<{ message: string }>("/api/auth/logout", { method: "POST" }),

  forgotPassword: (email: string) =>
    request<{ message: string; delivery_mode: string; reset_token?: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    ),

  resetPassword: (payload: { token: string; new_password: string }) =>
    request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request<User>("/api/auth/me"),

  // Profile & Activity
  updateProfile: (payload: Record<string, unknown>) =>
    request<User>("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: { current_password: string; new_password: string }) =>
    request<{ message: string }>("/api/users/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getActivity: (limit = 50) => request<ActivityItem[]>(`/api/users/activity?limit=${limit}`),

  deleteActivity: (id: string) =>
    request<{ message: string }>(`/api/users/activity/${id}`, { method: "DELETE" }),

  // Dashboard
  getDashboardOverview: () => request<DashboardOverview>("/api/dashboard/overview"),

  // Chat
  listChatSessions: () => request<ChatSession[]>("/api/chat/sessions"),
  createChatSession: (title?: string) =>
    request<ChatSession>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  getSessionMessages: (sessionId: string) =>
    request<ChatMessage[]>(`/api/chat/sessions/${sessionId}/messages`),
  clearSessionMessages: (sessionId: string) =>
    request<{ message: string }>(`/api/chat/sessions/${sessionId}/messages`, {
      method: "DELETE",
    }),
  deleteChatSession: (sessionId: string) =>
    request<{ message: string }>(`/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
    }),
  sendChatMessage: (payload: { session_id?: string | null; message: string }) =>
    request<ChatSendResponse>("/api/chat/message", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Symptoms
  analyzeSymptoms: (payload: SymptomAnalyzeInput) =>
    request<SymptomAnalyzeResult>("/api/symptoms/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSymptomHistory: () => request<SymptomHistoryItem[]>("/api/symptoms/history"),

  // Reports
  uploadReport: (file: File, onProgress?: (percent: number) => void) => {
    const fd = new FormData();
    fd.append("file", file);
    return uploadWithProgress<MedicalReport>("/api/reports/upload", fd, onProgress);
  },
  summarizeReport: (reportId: string) =>
    request<MedicalReport>(`/api/reports/${reportId}/summarize`, { method: "POST" }),
  listReports: () => request<MedicalReport[]>("/api/reports/"),
  getReport: (reportId: string) => request<MedicalReport>(`/api/reports/${reportId}`),
  getParsedMarkers: (reportId: string) =>
    request<{ markers: LabMarker[] }>(`/api/reports/${reportId}/parsed-markers`),
  deleteReport: (reportId: string) =>
    request<{ message: string }>(`/api/reports/${reportId}`, { method: "DELETE" }),

  // Images
  analyzeImage: (
    file: File,
    imageContext: string,
    onProgress?: (percent: number) => void
  ) => {
    const fd = new FormData();
    fd.append("file", file);
    if (imageContext.trim()) {
      fd.append("image_context", imageContext.trim());
    }
    return uploadWithProgress<UploadedMedicalImage>("/api/images/analyze", fd, onProgress);
  },
  listImages: () => request<UploadedMedicalImage[]>("/api/images/"),
  deleteImage: (imageId: string) =>
    request<{ message: string }>(`/api/images/${imageId}`, { method: "DELETE" }),

  // Library
  getLibraryArticles: (params?: { category?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== "All") qs.set("category", params.category);
    if (params?.q?.trim()) qs.set("q", params.q.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ categories: string[]; total: number; articles: LibraryArticle[] }>(
      `/api/library/articles${suffix}`
    );
  },
  getLibraryArticle: (id: string) => request<LibraryArticle>(`/api/library/articles/${id}`),
};
