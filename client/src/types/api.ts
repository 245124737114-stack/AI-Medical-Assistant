export interface UserProfile {
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  blood_type: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  emergency_contact: string | null;
  preferred_units: "metric" | "imperial";
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  profile: UserProfile | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  emergency_flagged: boolean;
  created_at: string;
}

export interface ChatSendResponse {
  session: ChatSession;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  emergency_detected: boolean;
  emergency_reasons: string[];
  emergency_banner: string | null;
  disclaimer: string;
  ai_model: string;
}

export interface SymptomAnalyzeInput {
  age: number;
  gender?: string;
  main_symptom: string;
  duration: string;
  severity: "Mild" | "Moderate" | "Severe";
  additional_symptoms?: string;
  relevant_context?: string;
}

export interface SymptomExplanation {
  title: string;
  description: string;
}

export interface SymptomAnalyzeResult {
  educational_overview: string;
  possible_explanations: SymptomExplanation[];
  recommended_next_steps: string[];
  warning_signs: string[];
  when_to_consult_doctor: string;
  questions_for_doctor: string[];
  emergency_detected: boolean;
  emergency_reasons: string[];
  emergency_banner?: string;
  disclaimer: string;
  ai_model: string;
}

export interface SymptomHistoryItem {
  id: string;
  description: string;
  created_at: string;
  input: SymptomAnalyzeInput | null;
  result: SymptomAnalyzeResult | null;
}

export interface LabMarker {
  name: string;
  value: string;
  unit: string;
  reference_range: string;
  status: "high" | "low" | "normal" | "unknown";
  explanation: string;
}

export interface MedicalTerm {
  term: string;
  simple_explanation: string;
}

export interface ReportSummary {
  id: string;
  report_id: string;
  plain_summary: string;
  lab_markers: LabMarker[];
  medical_terms: MedicalTerm[];
  questions_for_doctor: string[];
  warnings: string[];
  ai_model: string | null;
  disclaimer: string;
  created_at: string;
}

export interface MedicalReport {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  extraction_method: string;
  extracted_text: string | null;
  status: string;
  created_at: string;
  summary: ReportSummary | null;
}

export interface UploadedMedicalImage {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  image_context: string | null;
  analysis_summary: string | null;
  observations: string[];
  limitations: string | null;
  recommended_next_steps: string | null;
  ai_model: string | null;
  status: string;
  disclaimer: string;
  created_at: string;
}

export interface LibrarySource {
  name: string;
  organization: string;
  url: string;
}

export interface LibraryArticle {
  id: string;
  title: string;
  category: string;
  reading_time: string;
  summary: string;
  key_points: string[];
  sections: { heading: string; body: string }[];
  when_to_seek_care: string;
  sources: LibrarySource[];
}

export interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardOverview {
  user: User;
  stats: {
    total_reports: number;
    total_summaries: number;
    total_conversations: number;
    total_images: number;
    total_symptom_checks: number;
  };
  recent_reports: MedicalReport[];
  recent_conversations: ChatSession[];
  recent_activity: ActivityItem[];
  system_status: {
    ai_configured: boolean;
    ai_provider: string;
    chat_model: string;
    vision_model: string;
  };
}
