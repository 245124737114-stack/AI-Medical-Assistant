import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  Eraser,
  Loader2,
  MessageSquarePlus,
  Send,
  ShieldAlert,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { AiConfigNotice } from "@/components/AiConfigNotice";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { ChatMessage, ChatSession } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/format";

const SUGGESTED_QUESTIONS = [
  "What does Hemoglobin A1C measure in a blood test?",
  "What are common non-serious and serious causes of headaches?",
  "How can I prepare good questions before seeing my primary care doctor?",
  "What is the difference between systolic and diastolic blood pressure?",
];

export function ChatbotPage() {
  const { aiConfigured } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emergencyBanner, setEmergencyBanner] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const loadSessions = async (selectFirst = true) => {
    try {
      const list = await api.listChatSessions();
      setSessions(list);
      if (selectFirst && list.length > 0 && !activeSessionId) {
        selectSession(list[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat history.");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setError(null);
    setEmergencyBanner(null);
    setLoadingMessages(true);
    try {
      const msgs = await api.getSessionMessages(sessionId);
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNewConversation = async () => {
    setError(null);
    setEmergencyBanner(null);
    try {
      const created = await api.createChatSession("New Health Conversation");
      setSessions((prev) => [created, ...prev]);
      setActiveSessionId(created.id);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start new conversation.");
    }
  };

  const handleClearConversation = async () => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    setError(null);
    try {
      await api.clearSessionMessages(activeSessionId);
      setMessages([]);
      setEmergencyBanner(null);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, message_count: 0, last_message_preview: null } : s
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear conversation.");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setError(null);
    try {
      await api.deleteChatSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete conversation.");
    }
  };

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    setError(null);
    setSending(true);
    if (!textOverride) setInput("");

    try {
      const res = await api.sendChatMessage({
        session_id: activeSessionId,
        message: text,
      });

      setActiveSessionId(res.session.id);
      setMessages((prev) => [...prev, res.user_message, res.assistant_message]);
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== res.session.id);
        return [res.session, ...filtered];
      });

      if (res.emergency_detected && res.emergency_banner) {
        setEmergencyBanner(res.emergency_banner);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
      if (!textOverride) setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">AI Medical Chatbot</h1>
          <p className="text-sm text-slate-500">
            Educational health explanations in clear English—never a medical diagnosis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewConversation}>
            <MessageSquarePlus className="h-4 w-4" />
            New Conversation
          </Button>
          {activeSessionId && (
            <Button variant="outline" size="sm" onClick={handleClearConversation}>
              <Eraser className="h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      <AiConfigNotice show={!aiConfigured} />

      {emergencyBanner && (
        <DisclaimerBanner
          variant="emergency"
          title="Emergency Warning Signs Detected"
          message={emergencyBanner}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Conversations Sidebar */}
        <Card className="flex flex-col p-3 lg:col-span-1 lg:h-[620px]">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chat History
            </span>
            <span className="text-xs text-slate-400">{sessions.length}</span>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-8 text-xs text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : sessions.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                Your saved conversations will appear here.
              </p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "group flex items-start justify-between gap-2 rounded-xl border p-2.5 transition-colors",
                    s.id === activeSessionId
                      ? "border-blue-200 bg-blue-50/80"
                      : "border-transparent hover:bg-slate-50"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => selectSession(s.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-xs font-semibold text-slate-800">{s.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {formatRelativeDate(s.updated_at)} • {s.message_count} msgs
                    </p>
                  </button>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={() => handleDeleteSession(s.id)}
                    className="rounded p-1 text-slate-400 opacity-70 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Active Chat Panel */}
        <Card className="flex flex-col overflow-hidden lg:col-span-3 lg:h-[620px]">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Bot className="h-7 w-7" />
                </div>
                <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Ask Any General Health Question
                </h2>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Understand lab terminology, preventive care, or symptoms before talking with your
                  clinician.
                </p>

                <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-left text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                        isUser
                          ? "bg-blue-600 text-white"
                          : msg.emergency_flagged
                          ? "border border-red-200 bg-red-50/80 text-slate-900"
                          : "border border-slate-200 bg-slate-50 text-slate-800"
                      )}
                    >
                      {msg.emergency_flagged && !isUser && (
                        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          <ShieldAlert className="h-3.5 w-3.5" /> Urgent Care Notice
                        </div>
                      )}
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>
                    {isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Reviewing educational health guidance...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="border-t border-slate-100 bg-white p-3 sm:p-4"
          >
            <div className="flex items-end gap-2">
              <Textarea
                rows={2}
                placeholder="Ask a health education question (Press Enter to send, Shift+Enter for new line)..."
                className="min-h-[52px] resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={sending}
              />
              <Button type="submit" size="lg" disabled={sending || !input.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
