"use client";

import { useState } from "react";
import { leadSchema, BUDGET_OPTIONS, type LeadInput } from "@/lib/validations";

export default function Home() {
  const [formData, setFormData] = useState<LeadInput>({
    name: "",
    email: "",
    budgetRange: "under-1k",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadInput, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = leadSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        budgetRange: fieldErrors.budgetRange?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          setErrors({
            name: data.errors.name?.[0],
            email: data.errors.email?.[0],
            budgetRange: data.errors.budgetRange?.[0],
            message: data.errors.message?.[0],
          });
          setStatus("error");
          return;
        }
        throw new Error("Failed to submit");
      }

      setStatus("success");
      setFormData({ name: "", email: "", budgetRange: "under-1k", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">LeadDesk</h1>
          <a href="/admin" className="text-sm text-slate-500 hover:text-slate-700">
            Admin
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Capture Quality Leads
          </h2>
          <p className="text-lg text-slate-600">
            Tell us about your project and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              Thank you!
            </h3>
            <p className="text-emerald-600">
              Your submission has been received. We&apos;ll be in touch soon.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm text-emerald-700 underline hover:text-emerald-900"
            >
              Submit another lead
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="budgetRange" className="block text-sm font-medium text-slate-700 mb-1">
                Budget Range
              </label>
              <select
                id="budgetRange"
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value as LeadInput["budgetRange"] })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.budgetRange && (
                <p className="mt-1 text-sm text-red-600">{errors.budgetRange}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Tell us about your project..."
              />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Submitting..." : "Submit Lead"}
            </button>

            {status === "error" && (
              <p className="text-sm text-red-600 text-center">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
