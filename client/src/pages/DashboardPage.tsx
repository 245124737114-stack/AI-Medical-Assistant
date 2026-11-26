import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BookOpen,
  FileText,
  FolderHeart,
  Image as ImageIcon,
  Loader2,
  MessageSquareHeart,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { AiConfigNotice } from "@/components/AiConfigNotice";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { DashboardOverview } from "@/types/api";
import { formatRelativeDate } from "@/utils/format";

const QUICK_SERVICES = [
  {
    title: "AI Medical Chatbot",
    desc: "Ask health questions in plain language",
    to: "/dashboard/chat",
    icon: MessageSquareHeart,
    color: "from-blue-600 to-blue-500",
  },
  {
    title: "Symptom Checker",
    desc: "Explore educational symptom guidance",
    to: "/dashboard/symptoms",
    icon: Activity,
    color: "from-cyan-500 to-teal-500",
  },
  {
    title: "Report Summarizer",
    desc: "Upload PDF or image lab reports",
    to: "/dashboard/reports",
    icon: FileText,
    color: "from-indigo-600 to-blue-500",
  },
  {
    title: "Medical Imaging",
    desc: "Vision AI educational observations",
    to: "/dashboard/images",
    icon: ImageIcon,
    color: "from-sky-500 to-cyan-500",
  },
];

const LIBRARY_SHORTCUTS = [
  { label: "Understanding Lab Results", query: "lab" },
  { label: "Healthy Diet & Nutrition", query: "diet" },
  { label: "Physical Activity Guidelines", query: "physical activity" },
  { label: "Mental Wellness & Stress", query: "stress" },
];

export function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboardOverview()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-slate-600">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading your personalized dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Unable to load dashboard</CardTitle>
          <CardDescription className="text-red-700">{error || "Unknown error"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const profile = data.user.profile;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-card sm:flex-row sm:items-center sm:p-8">
        <div>
          <Badge className="border-white/25 bg-white/15 text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Personal Health Workspace
          </Badge>
          <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            Welcome back, {data.user.full_name}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-blue-100">
            Review your medical reports, continue AI health conversations, or explore trusted
            educational guides.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-white/30 bg-white text-blue-700" asChild>
            <Link to="/dashboard/reports">Upload Report</Link>
          </Button>
          <Button className="bg-slate-900/25 text-white hover:bg-slate-900/40" asChild>
            <Link to="/dashboard/chat">Ask AI Assistant</Link>
          </Button>
        </div>
      </div>

      <AiConfigNotice show={!data.system_status.ai_configured} />

      {/* Real Database Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Uploaded Reports</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{data.stats.total_reports}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            {data.stats.total_summaries} summarized with AI
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI Conversations</CardDescription>
            <CardTitle className="text-3xl text-cyan-600">{data.stats.total_conversations}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Saved private chat sessions</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Symptom Checks</CardDescription>
            <CardTitle className="text-3xl text-indigo-600">
              {data.stats.total_symptom_checks}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Educational assessments logged</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Medical Images Analyzed</CardDescription>
            <CardTitle className="text-3xl text-sky-600">{data.stats.total_images}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Vision AI educational reviews</CardContent>
        </Card>
      </div>

      {/* Quick Access Services */}
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-slate-900">Quick Access Services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link key={svc.to} to={svc.to} className="group block">
                <Card className="h-full hover:border-blue-200 hover:shadow-card-hover">
                  <CardHeader>
                    <div
                      className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${svc.color} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{svc.title}</CardTitle>
                    <CardDescription>{svc.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Reports & Conversations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Medical Reports</CardTitle>
              <CardDescription>Latest files saved to your account</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/reports">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recent_reports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No medical reports uploaded yet.{" "}
                <Link to="/dashboard/reports" className="font-semibold text-blue-600 hover:underline">
                  Upload your first report
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recent_reports.map((report) => (
                  <li key={report.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {report.original_filename}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeDate(report.created_at)} • {report.extraction_method}
                      </p>
                    </div>
                    <Badge variant={report.summary ? "success" : "neutral"}>
                      {report.summary ? "Summarized" : report.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent AI Conversations</CardTitle>
              <CardDescription>Resume a previous educational chat</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/chat">
                Open chat <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recent_conversations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No conversations yet.{" "}
                <Link to="/dashboard/chat" className="font-semibold text-blue-600 hover:underline">
                  Start an AI health chat
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recent_conversations.map((session) => (
                  <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{session.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {session.last_message_preview || "Empty conversation"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {session.message_count} msgs
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Snapshot + Library Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Used to personalize your health workspace</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/records">
                <FolderHeart className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Age / Gender</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {profile?.age ?? "—"} / {profile?.gender || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Blood Type</p>
              <p className="mt-0.5 font-medium text-slate-900">{profile?.blood_type || "Not set"}</p>
            </div>
            <div className="col-span-2 rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Allergies</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {profile?.allergies || "None recorded"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-cyan-600" />
              <div>
                <CardTitle>Health Information Shortcuts</CardTitle>
                <CardDescription>Verified MedlinePlus, WHO & CDC articles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2.5 sm:grid-cols-2">
            {LIBRARY_SHORTCUTS.map((item) => (
              <Link
                key={item.label}
                to={`/dashboard/library?q=${encodeURIComponent(item.query)}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
              >
                <span className="truncate">{item.label}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
