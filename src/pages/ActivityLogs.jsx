import { useMemo, useState } from "react";
import {
  Database,
  Filter,
  Download,
  Pencil,
  Plus,
  RotateCcw,
  FileText,
  Trash2,
  LogIn,
} from "lucide-react";
import { useAuditLog } from "../hooks/useAuditLog";
import Avatar from "../components/dashboard/Avatar";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";
import { usePagination } from "../lib/usePagination";

const ACTION_TYPES = ["create", "update", "delete", "password", "report", "login"];
const STATUSES = ["success", "pending", "failed"];

const ACTION_ICON = {
  update: { Icon: Pencil, wrap: "bg-cta/20 text-accent-rust" },
  create: { Icon: Plus, wrap: "bg-brand/20 text-brand-dark" },
  password: { Icon: RotateCcw, wrap: "bg-cta/20 text-accent-rust" },
  report: { Icon: FileText, wrap: "bg-input text-brand-dark" },
  delete: { Icon: Trash2, wrap: "bg-cta/20 text-accent-rust" },
  login: { Icon: LogIn, wrap: "bg-brand/20 text-brand-dark" },
};

const STATUS_STYLE = {
  success: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

// "Today, 9:42 AM" / "Yesterday, 5:05 PM" / "Oct 12, 2:30 PM"
function formatTimestamp(iso) {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
}

function ActivityLogs() {
  const { loading, error, needsSetup, logs } = useAuditLog();
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          (statusFilter === "all" || l.status === statusFilter) &&
          (typeFilter === "all" || l.action_type === typeFilter)
      ),
    [logs, statusFilter, typeFilter]
  );
  const pager = usePagination(filtered, 8);

  function exportCsv() {
    const rows = [
      ["Timestamp", "Action", "Actor", "Status"],
      ...filtered.map((l) => [
        new Date(l.created_at).toLocaleString(),
        l.action,
        l.actor_name ?? "",
        l.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="flex flex-col gap-6 p-6 sm:p-8">
      <h1 className="font-quicksand font-bold text-[32px] leading-10 tracking-[-0.64px] text-ink">
        Activity Logs
      </h1>

      {needsSetup && (
        <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-surface p-4">
          <Database className="size-5 shrink-0 text-brand-dark" strokeWidth={2} />
          <p className="font-nunito text-sm text-ink">
            The audit log table is not set up yet. Run{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-brand-dark">
              supabase/0006_user_management.sql
            </code>{" "}
            in the Supabase SQL Editor.
          </p>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-nunito text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[32px] bg-card shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between p-6">
          <h2 className="font-quicksand font-bold text-xl text-ink">Activity Log</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-nunito font-bold text-xs transition ${
                showFilters || statusFilter !== "all" || typeFilter !== "all"
                  ? "border-brand-dark bg-brand/10 text-brand-dark"
                  : "border-muted/30 text-subtle hover:bg-surface"
              }`}
            >
              <Filter className="size-3.5" strokeWidth={2} />
              Filter
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-full border border-muted/30 px-4 py-2 font-nunito font-bold text-xs text-subtle transition hover:bg-surface"
            >
              <Download className="size-3.5" strokeWidth={2} />
              Export CSV
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 border-t border-muted/10 px-6 py-4">
            <label className="flex items-center gap-2">
              <span className="font-nunito font-bold text-xs text-subtle">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-full bg-input pl-3 pr-8 font-nunito text-xs text-ink outline-none focus:ring-2 focus:ring-brand/60"
              >
                <option value="all">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="font-nunito font-bold text-xs text-subtle">Action</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-full bg-input pl-3 pr-8 font-nunito text-xs text-ink outline-none focus:ring-2 focus:ring-brand/60"
              >
                <option value="all">All</option>
                {ACTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </label>
            {(statusFilter !== "all" || typeFilter !== "all") && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="font-nunito font-bold text-xs text-brand-dark hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3 p-6">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-surface/50 text-left">
              <th className="px-6 py-3 font-nunito font-extrabold text-[10px] uppercase tracking-[1px] text-subtle">Timestamp</th>
              <th className="px-6 py-3 font-nunito font-extrabold text-[10px] uppercase tracking-[1px] text-subtle">Action</th>
              <th className="hidden px-6 py-3 font-nunito font-extrabold text-[10px] uppercase tracking-[1px] text-subtle sm:table-cell">Actor</th>
              <th className="px-6 py-3 text-right font-nunito font-extrabold text-[10px] uppercase tracking-[1px] text-subtle">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center font-nunito text-sm text-subtle">
                  No activity matches the filters.
                </td>
              </tr>
            )}
            {pager.pageItems.map((log) => {
              const icon = ACTION_ICON[log.action_type] ?? ACTION_ICON.report;
              const { Icon } = icon;
              return (
                <tr key={log.id} className="border-t border-muted/10">
                  <td className="px-6 py-4 font-nunito text-sm text-subtle">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${icon.wrap}`}>
                        <Icon className="size-4" strokeWidth={2} />
                      </span>
                      <span className="font-nunito font-semibold text-sm text-ink">{log.action}</span>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={log.actor_name}
                        src={log.actor_avatar}
                        className="size-7 shrink-0 rounded-full bg-input"
                        textClassName="text-[10px]"
                      />
                      <span className="font-nunito text-sm text-ink">{log.actor_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`rounded-full px-3 py-1 font-nunito font-bold text-[10px] uppercase tracking-[0.5px] ${STATUS_STYLE[log.status] ?? STATUS_STYLE.success}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="border-t border-muted/10">
            <Pagination {...pager} />
          </div>
        )}
      </div>
    </main>
  );
}

export default ActivityLogs;
