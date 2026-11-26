import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  History,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { AiConfigNotice } from "@/components/AiConfigNotice";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { SymptomAnalyzeResult, SymptomHistoryItem } from "@/types/api";
import { formatDateTime } from "@/utils/format";

export function SymptomCheckerPage() {
  const { user, aiConfigured } = useAuth();
  const [age, setAge] = useState(user?.profile?.age ? String(user.profile.age) : "");
  const [gender, setGender] = useState(user?.profile?.gender || "");
  const [mainSymptom, setMainSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");
  const [additionalSymptoms, setAdditionalSymptoms] = useState("");
  const [relevantContext, setRelevantContext] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SymptomAnalyzeResult | null>(null);
  const [history, setHistory] = useState<SymptomHistoryItem[]>([]);

  const loadHistory = () => {
    api
      .getSymptomHistory()
      .then(setHistory)
      .catch(() => {});
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAge = Number(age);
    if (!age.trim() || Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      setError("Please enter a valid age between 0 and 120.");
      return;
    }
    if (mainSymptom.trim().length < 2) {
      setError("Please describe your main symptom.");
      return;
    }
    if (!duration.trim()) {
      setError("Please specify how long the symptom has lasted.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.analyzeSymptoms({
        age: parsedAge,
        gender: gender.trim() || undefined,
        main_symptom: mainSymptom.trim(),
        duration: duration.trim(),
        severity,
        additional_symptoms: additionalSymptoms.trim() || undefined,
        relevant_context: relevantContext.trim() || undefined,
      });
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Symptom analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Symptom Information Checker
        </h1>
        <p className="text-sm text-slate-500">
          Structured educational guidance to help you prepare for a medical consultation. Does not
          diagnose or prescribe.
        </p>
      </div>

      <AiConfigNotice show={!aiConfigured} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Symptom Details
            </CardTitle>
            <CardDescription>Complete the fields below for educational information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sym-age">Age *</Label>
                  <Input
                    id="sym-age"
                    type="number"
                    min={0}
                    max={120}
                    placeholder="e.g., 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sym-gender">Gender (optional)</Label>
                  <Input
                    id="sym-gender"
                    placeholder="Optional"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sym-main">Main Symptom *</Label>
                <Input
                  id="sym-main"
                  placeholder="e.g., Persistent throbbing headache"
                  value={mainSymptom}
                  onChange={(e) => setMainSymptom(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sym-duration">Duration *</Label>
                  <Input
                    id="sym-duration"
                    placeholder="e.g., 3 days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sym-severity">Severity *</Label>
                  <select
                    id="sym-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as "Mild" | "Moderate" | "Severe")}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sym-add">Additional Symptoms</Label>
                <Textarea
                  id="sym-add"
                  rows={2}
                  placeholder="e.g., Mild nausea, sensitivity to bright light"
                  value={additionalSymptoms}
                  onChange={(e) => setAdditionalSymptoms(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sym-ctx">Relevant Context</Label>
                <Textarea
                  id="sym-ctx"
                  rows={2}
                  placeholder="e.g., Recent travel, poor sleep, chronic conditions, or allergies"
                  value={relevantContext}
                  onChange={(e) => setRelevantContext(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Educational Overview...
                  </>
                ) : (
                  "Get Educational Information"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4 lg:col-span-3">
          {!result ? (
            <Card className="flex h-full min-h-[340px] flex-col items-center justify-center p-8 text-center">
              <Stethoscope className="h-12 w-12 text-blue-500/80" />
              <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
                Educational Guidance Will Appear Here
              </h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Submit your symptom details to see general educational context, clearly labelled
                possible explanations, warning signs, and questions to ask your doctor.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {result.emergency_detected && result.emergency_banner && (
                <DisclaimerBanner
                  variant="emergency"
                  title="Seek Immediate Emergency Care"
                  message={result.emergency_banner}
                />
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>General Educational Information</CardTitle>
                    <Badge variant="cyan">Non-Diagnostic</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-slate-700">
                  {result.educational_overview}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    Possible Common Explanations (Educational Possibilities Only)
                  </CardTitle>
                  <CardDescription>
                    These are general possibilities to discuss with a clinician—not a medical
                    diagnosis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.possible_explanations.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">Possibility</Badge>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Recommended Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {result.recommended_next_steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-950">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Warning Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-amber-950">
                      {result.warning_signs.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">When to Consult a Doctor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <p>{result.when_to_consult_doctor}</p>
                  {result.questions_for_doctor?.length > 0 && (
                    <div className="rounded-xl bg-blue-50/70 p-3.5">
                      <p className="flex items-center gap-1.5 font-semibold text-blue-900">
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                        Questions to Ask Your Clinician
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-blue-950">
                        {result.questions_for_doctor.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Past Symptom Checks */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-blue-600" />
              Recent Symptom Information Checks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.description}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                </div>
                {item.result && (
                  <Button variant="outline" size="sm" onClick={() => setResult(item.result)}>
                    View Guidance
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <DisclaimerBanner />
    </div>
  );
}
