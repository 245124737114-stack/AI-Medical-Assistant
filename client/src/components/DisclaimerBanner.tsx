import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/utils/cn";

export function DisclaimerBanner({
  variant = "info",
  title = "Medical Safety Disclaimer",
  message = "AI Medical Assistant provides general health education only. It does not diagnose medical conditions, prescribe medication, or replace professional clinical care. For medical emergencies, call your local emergency number immediately.",
  className,
}: {
  variant?: "info" | "emergency";
  title?: string;
  message?: string;
  className?: string;
}) {
  const isEmergency = variant === "emergency";
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-sm",
        isEmergency
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-blue-200 bg-blue-50/80 text-blue-950",
        className
      )}
    >
      {isEmergency ? (
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      ) : (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
      )}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 leading-relaxed opacity-90">{message}</p>
      </div>
    </div>
  );
}
