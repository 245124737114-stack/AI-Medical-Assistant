import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  KeyRound,
  Loader2,
  MessageSquareHeart,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { api, fetchProtectedBlob } from "@/services/api";
import type { ActivityItem, ChatSession, MedicalReport } from "@/types/api";
import { formatBytes, formatDateTime } from "@/utils/format";
import { validatePassword } from "@/utils/validation";

export function PersonalHealthPage() {
  const { user, setUser } = useAuth();

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [age, setAge] = useState(user?.profile?.age != null ? String(user.profile.age) : "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.profile?.date_of_birth || "");
  const [gender, setGender] = useState(user?.profile?.gender || "");
  const [bloodType, setBloodType] = useState(user?.profile?.blood_type || "");
  const [allergies, setAllergies] = useState(user?.profile?.allergies || "");
  const [chronicConditions, setChronicConditions] = useState(
    user?.profile?.chronic_conditions || ""
  );
  const [emergencyContact, setEmergencyContact] = useState(user?.profile?.emergency_contact || "");
  const [preferredUnits, setPreferredUnits] = useState<"metric" | "imperial">(
    user?.profile?.preferred_units || "metric"
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [repList, chatList, actList] = await Promise.all([
        api.listReports(),
        api.listChatSessions(),
        api.getActivity(50),
      ]);
      setReports(repList);
      setSessions(chatList);
      setActivities(actList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load personal records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDownloadOriginal = async (report: MedicalReport) => {
    setError(null);
    try {
      const { blob } = await fetchProtectedBlob(`/api/reports/${report.id}/file`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.original_filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download file.");
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
      setError(err instanceof Error ? err.message : "Unable to download summary.");
    }
  };

  const handleDeleteReport = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await api.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setSuccess("Medical report deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete report.");
    }
  };

  const handleDeleteChat = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await api.deleteChatSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Conversation deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete conversation.");
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await api.deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete activity entry.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    let parsedAge: number | null = null;
    if (age.trim()) {
      parsedAge = Number(age);
      if (Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        setError("Age must be between 0 and 130.");
        return;
      }
    }

    setSavingProfile(true);
    try {
      const updatedUser = await api.updateProfile({
        full_name: fullName.trim(),
        age: parsedAge,
        date_of_birth: dateOfBirth.trim() || null,
        gender: gender.trim() || null,
        blood_type: bloodType.trim() || null,
        allergies: allergies.trim() || null,
        chronic_conditions: chronicConditions.trim() || null,
        emergency_contact: emergencyContact.trim() || null,
        preferred_units: preferredUnits,
      });
      setUser(updatedUser);
      setSuccess("Personal health profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const pw = validatePassword(newPassword);
    if (!pw.valid) {
      setError(pw.message);
      return;
    }
    setChangingPw(true);
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Personal Health Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage your private medical reports, summaries, AI conversations, profile details, and
          activity log.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4" />
            Reports & Summaries ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="chats">
            <MessageSquareHeart className="h-4 w-4" />
            Conversations ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="profile">
            <UserIcon className="h-4 w-4" />
            Profile & Health Info
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4" />
            Activity & Security
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Uploaded Medical Reports</CardTitle>
                <CardDescription>Download original files, AI summaries, or delete records.</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link to="/dashboard/reports">Upload New Report</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center py-8 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading reports...
                </div>
              ) : reports.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No uploaded medical reports found.
                </p>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {rep.original_filename}
                          </p>
                          <Badge variant={rep.summary ? "success" : "default"}>
                            {rep.summary ? "Summarized" : rep.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatBytes(rep.file_size_bytes)} • {formatDateTime(rep.created_at)}
                        </p>
                        {rep.summary && (
                          <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                            {rep.summary.plain_summary}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadOriginal(rep)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Original
                        </Button>
                        {rep.summary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadSummary(rep)}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Summary
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteReport(rep.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="chats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Previous AI Conversations</CardTitle>
                <CardDescription>Review or remove saved conversation sessions.</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link to="/dashboard/chat">Open Chatbot</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No conversations saved.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{s.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {s.message_count} messages • Updated {formatDateTime(s.updated_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/dashboard/chat">Open</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteChat(s.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Health Profile</CardTitle>
              <CardDescription>
                Keep basic health context updated for your own reference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-name">Full Name *</Label>
                  <Input
                    id="prof-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-email">Email (Read-Only)</Label>
                  <Input id="prof-email" value={user?.email || ""} disabled />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-age">Age</Label>
                  <Input
                    id="prof-age"
                    type="number"
                    min={0}
                    max={130}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-dob">Date of Birth</Label>
                  <Input
                    id="prof-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-gender">Gender</Label>
                  <Input
                    id="prof-gender"
                    placeholder="Optional"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-blood">Blood Type</Label>
                  <Input
                    id="prof-blood"
                    placeholder="e.g., O+, A-"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-emergency">Emergency Contact</Label>
                  <Input
                    id="prof-emergency"
                    placeholder="Name & phone number"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-units">Preferred Units</Label>
                  <select
                    id="prof-units"
                    value={preferredUnits}
                    onChange={(e) => setPreferredUnits(e.target.value as "metric" | "imperial")}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="prof-allergies">Known Allergies</Label>
                  <Textarea
                    id="prof-allergies"
                    rows={2}
                    placeholder="List medication, food, or environmental allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="prof-cond">Chronic Conditions</Label>
                  <Textarea
                    id="prof-cond"
                    rows={2}
                    placeholder="e.g., Hypertension, asthma, diabetes"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Health Profile"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity & Security Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-blue-600" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="grid max-w-md gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cp-curr">Current Password</Label>
                  <Input
                    id="cp-curr"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cp-new">New Password</Label>
                  <Input
                    id="cp-new"
                    type="password"
                    placeholder="Min 8 chars, upper, lower, number, symbol"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={changingPw}>
                  {changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Account Activity</CardTitle>
              <CardDescription>Audit log of actions taken under your account</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-slate-500">No activity recorded.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {activities.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{item.description}</p>
                        <p className="text-xs text-slate-500">
                          {item.activity_type} • {formatDateTime(item.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Delete activity entry"
                        onClick={() => handleDeleteActivity(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DisclaimerBanner />
    </div>
  );
}
