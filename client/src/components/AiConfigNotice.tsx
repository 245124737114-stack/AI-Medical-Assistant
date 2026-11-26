import { KeyRound } from "lucide-react";

export function AiConfigNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold">Server AI API Key Not Configured</p>
        <p className="mt-0.5 leading-relaxed">
          To enable live AI responses (Chatbot, Symptom Analysis, AI Report Summarization, and
          Vision Image Analysis), add your <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">OPENAI_API_KEY</code> to{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">server/.env</code> and restart the backend server. File uploads, PDF extraction, authentication, and the Health Library remain fully operational.
        </p>
      </div>
    </div>
  );
}
