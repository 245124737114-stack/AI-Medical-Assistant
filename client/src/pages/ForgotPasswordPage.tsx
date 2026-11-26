import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { validateEmail, validatePassword } from "@/utils/validation";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setInfoMessage(res.message);
      if (res.reset_token) {
        setToken(res.reset_token);
      }
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not initiate password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }
    const pw = validatePassword(newPassword);
    if (!pw.valid) {
      setError(pw.message);
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ token: token.trim(), new_password: newPassword });
      setInfoMessage(res.message);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 flex justify-center">
        <BrandLogo />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            {step === "request" && "Enter your account email to generate a time-limited reset token."}
            {step === "reset" && "Enter your reset token and choose a strong new password."}
            {step === "done" && "Your password has been updated."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fp-email">Account Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="fp-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Reset Token"}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleCompleteReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fp-token">Reset Token</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="fp-token"
                    placeholder="Paste reset token"
                    className="pl-10 font-mono text-xs"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fp-new-pw">New Password</Label>
                <Input
                  id="fp-new-pw"
                  type="password"
                  placeholder="Min 8 chars, upper, lower, number, symbol"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}

          {step === "done" && (
            <Button className="w-full" asChild>
              <Link to="/login">Return to Sign In</Link>
            </Button>
          )}

          <p className="text-center text-sm text-slate-600">
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
