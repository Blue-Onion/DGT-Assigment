"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { STATUS_OPTIONS } from "@/lib/validations";

interface Lead {
  id: number;
  name: string;
  email: string;
  budgetRange: string;
  message: string;
  status: string;
  createdAt: string;
}

const BUDGET_LABELS: Record<string, string> = {
  "under-1k": "Under $1,000",
  "1k-5k": "$1,000 - $5,000",
  "5k-10k": "$5,000 - $10,000",
  "10k-plus": "$10,000+",
};

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Contacted: "bg-amber-100 text-amber-800",
  Closed: "bg-emerald-100 text-emerald-800",
};

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";

  const fetchLeads = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const url = query ? `/api/leads?search=${encodeURIComponent(query)}` : "/api/leads";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchLeads(search), 300);
    return () => clearTimeout(timeout);
  }, [search, fetchLeads]);

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
        );
      }
    } catch {
      console.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">LeadDesk Admin</h1>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            Back to Landing
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-slate-500">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="text-slate-500">No leads found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Budget</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Message</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {BUDGET_LABELS[lead.budgetRange] || lead.budgetRange}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {lead.message}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-800"}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} total
        </p>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
