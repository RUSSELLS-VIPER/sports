"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  return (
    <button
      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
