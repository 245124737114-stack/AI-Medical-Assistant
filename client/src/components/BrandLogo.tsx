import { HeartPulse } from "lucide-react";
import { cn } from "@/utils/cn";

export function BrandLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-600/20">
        <HeartPulse className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-extrabold tracking-tight text-slate-900">
            AI Medical Assistant
          </span>
          <span className="text-[11px] font-medium text-cyan-600">
            Your Intelligent Healthcare Companion
          </span>
        </div>
      )}
    </div>
  );
}
