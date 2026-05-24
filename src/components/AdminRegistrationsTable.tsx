"use client";

import Link from "next/link";
import { useState } from "react";

export type RegistrationRow = {
  id: string;
  type: "athlete" | "coach";
  name: string;
  email: string;
  mobile: string;
  ageGroup: string;
  eventName: string;
  status: "Submitted" | "Approved" | "Rejected";
};

export default function AdminRegistrationsTable({
  initialRows,
  title,
}: {
  initialRows: RegistrationRow[];
  title?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [processingKey, setProcessingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateStatus = async (row: RegistrationRow, status: "Approved" | "Rejected") => {
    setProcessingKey(`${row.type}-${row.id}-${status}`);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/registrations/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: row.type, status }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to update status");
      setRows((prev) => prev.map((item) => (item.id === row.id && item.type === row.type ? { ...item, status } : item)));
      setMessage(`${row.type === "coach" ? "Coach" : "Athlete"} ${status.toLowerCase()} and email sent.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setProcessingKey("");
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title && <h2 className="px-4 pt-4 text-lg font-bold text-slate-900">{title}</h2>}
      {message && <p className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="p-3">Type</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Mobile</th>
            <th className="p-3">Age Group</th>
            <th className="p-3">Competition Applied</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const keyApprove = `${row.type}-${row.id}-Approved`;
            const keyReject = `${row.type}-${row.id}-Rejected`;
            const isBusy = processingKey === keyApprove || processingKey === keyReject;
            const detailHref = row.type === "coach" ? `/admin/coaches/${row.id}` : `/admin/athletes/${row.id}`;
            return (
              <tr key={`${row.type}-${row.id}`} className="border-t border-slate-100">
                <td className="p-3 capitalize">{row.type}</td>
                <td className="p-3">
                  <Link className="font-semibold text-emerald-700 hover:underline" href={detailHref}>
                    {row.name}
                  </Link>
                </td>
                <td className="p-3">{row.email}</td>
                <td className="p-3">{row.mobile}</td>
                <td className="p-3">{row.ageGroup}</td>
                <td className="p-3">{row.eventName}</td>
                <td className="p-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{row.status}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60" disabled={isBusy} onClick={() => updateStatus(row, "Approved")}>Approve</button>
                    <button className="rounded-lg bg-red-700 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60" disabled={isBusy} onClick={() => updateStatus(row, "Rejected")}>Reject</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
