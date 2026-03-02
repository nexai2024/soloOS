"use client";

import { useState } from "react";

interface PublicWaitlistFormProps {
  slug: string;
}

export default function PublicWaitlistForm({ slug }: PublicWaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email: email.trim(),
          message: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to join waitlist");
      }
      setSubmitted(true);
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join waitlist");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Join the waitlist</h3>
      <p className="text-sm text-slate-500 mt-1">
        Be the first to know when we launch.
      </p>
      {submitted ? (
        <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
          You're on the list. We'll be in touch soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <textarea
            placeholder="Optional message"
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          {error && (
            <div className="text-xs text-rose-600">{error}</div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 text-white text-sm py-2 disabled:opacity-60"
          >
            {submitting ? "Joining..." : "Join waitlist"}
          </button>
        </form>
      )}
    </div>
  );
}
