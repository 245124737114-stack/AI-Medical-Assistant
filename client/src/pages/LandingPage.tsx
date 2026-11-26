import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileSearch,
  HeartHandshake,
  Image as ImageIcon,
  Lock,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { HeroIllustration } from "@/assets/HeroIllustration";
import { BrandLogo } from "@/components/BrandLogo";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const FEATURES = [
  {
    icon: MessageSquareHeart,
    title: "AI Medical Chatbot",
    description:
      "Ask general health questions in plain language and receive educational, non-diagnostic explanations with emergency red-flag detection.",
    to: "/dashboard/chat",
  },
  {
    icon: Activity,
    title: "Symptom Information Checker",
    description:
      "Enter age, symptom duration, severity, and context to explore general educational possibilities and know when to see a doctor.",
    to: "/dashboard/symptoms",
  },
  {
    icon: FileSearch,
    title: "Medical Report Summarizer",
    description:
      "Upload PDF, JPG, or PNG lab reports to extract text, inspect measured markers against report reference ranges, and download summaries.",
    to: "/dashboard/reports",
  },
  {
    icon: ImageIcon,
    title: "Medical Image Analysis",
    description:
      "Securely upload medical-related images for Vision AI visual observations paired with clear limitations and clinician review guidance.",
    to: "/dashboard/images",
  },
  {
    icon: BookOpen,
    title: "Health Information Library",
    description:
      "Browse six curated wellness categories backed by trusted public health sources including MedlinePlus, WHO, and CDC.",
    to: "/library",
  },
  {
    icon: Lock,
    title: "Private Health Vault",
    description:
      "Your medical reports, summaries, conversations, and activity history stay isolated to your authenticated personal account.",
    to: "/dashboard/records",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create Your Private Account",
    detail: "Register securely and set up your personal health preferences and profile context.",
  },
  {
    step: "02",
    title: "Choose a Health Support Tool",
    detail: "Chat with the AI companion, check symptom education, or upload a lab report or image.",
  },
  {
    step: "03",
    title: "Review Plain-English Insights",
    detail: "Understand medical terms, lab markers, and warning signs with transparent AI guardrails.",
  },
  {
    step: "04",
    title: "Prepare for Your Doctor Visit",
    detail: "Save or download summaries and take clear, informed questions to your healthcare clinician.",
  },
];

const BENEFITS = [
  "Translates complex medical jargon into clear, everyday English.",
  "Never fabricates laboratory reference ranges—uses only report-supplied ranges or verified citations.",
  "Built-in emergency keyword detection immediately prompts urgent care when red flags appear.",
  "Strict user-level data isolation with private file storage and one-click record deletion.",
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="healthcare-grid-bg relative overflow-hidden border-b border-blue-100/80 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <Badge variant="cyan" className="px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Educational AI Healthcare Platform
            </Badge>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Health,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Smarter with AI
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              AI Medical Assistant helps you understand medical terminology, analyze uploaded lab
              reports, explore symptom education, and access reliable health resources from
              MedlinePlus, WHO, and CDC—all in one secure portal.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" asChild>
                <Link to={user ? "/dashboard" : "/register"}>
                  {user ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Explore Services</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Non-diagnostic safety guardrails
              </span>
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-cyan-600" />
                Private user records
              </span>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="default">Platform Services</Badge>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Intelligent Tools Built for Patient Understanding
          </h2>
          <p className="mt-3 text-slate-600">
            Every module is designed to clarify medical information and support safer, better-informed
            conversations with your healthcare provider.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title} className="group hover:shadow-card-hover">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/10 to-cyan-500/15 text-blue-600 transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feat.title}</CardTitle>
                  <CardDescription className="pt-1 leading-relaxed">{feat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to={feat.to}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open module
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y border-blue-100 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="cyan">How It Works</Badge>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              From Questions to Clarity in Four Steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-6"
              >
                <span className="font-display text-3xl font-extrabold text-blue-600/80">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Benefits */}
      <section id="benefits" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="default">Why AI Medical Assistant</Badge>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Designed Around Safety, Privacy, and Clarity
            </h2>
            <p className="mt-3 text-slate-600">
              Healthcare information can feel overwhelming. We combine structured document parsing,
              server-side AI models, and verified public-health education without replacing clinical
              judgment.
            </p>

            <ul className="mt-6 space-y-3.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Card className="border-blue-100 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-7 w-7 text-cyan-100" />
                  <CardTitle className="text-white">Clinician-First Philosophy</CardTitle>
                </div>
                <CardDescription className="text-blue-100">
                  Every summary and symptom guide equips you with thoughtful questions to ask your
                  healthcare provider rather than making diagnostic claims.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Button variant="outline" className="border-white/30 bg-white text-blue-700" asChild>
                  <Link to="/library">Browse Health Library</Link>
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/15 hover:text-white" asChild>
                  <Link to={user ? "/dashboard" : "/register"}>Create Free Account</Link>
                </Button>
              </CardContent>
            </Card>

            <DisclaimerBanner
              title="Important Medical Safety Disclaimer"
              message="AI Medical Assistant is an educational healthcare support platform. It does not provide medical diagnoses, prescribe medications, or replace licensed medical professionals. If you experience chest pain, trouble breathing, stroke symptoms, severe bleeding, or a mental health crisis, call emergency services immediately."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="space-y-3 md:col-span-2">
            <BrandLogo />
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              AI Medical Assistant — Your Intelligent Healthcare Companion for understanding lab
              reports, medical terms, and evidence-based health education.
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <HeartHandshake className="h-4 w-4 text-blue-600" />
              Educational Use Only • Not a Substitute for Clinical Care
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-slate-900">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/library" className="hover:text-blue-600">
                  Health Library
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-600">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-slate-900">Trusted Sources & Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <a
                  href="https://medlineplus.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600"
                >
                  MedlinePlus (NIH)
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600"
                >
                  World Health Organization
                </a>
              </li>
              <li>
                <a
                  href="https://www.cdc.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600"
                >
                  CDC Health Portal
                </a>
              </li>
              <li className="pt-1 text-xs text-slate-500">Support: support@aimedicalassistant.edu</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
