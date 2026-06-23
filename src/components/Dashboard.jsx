import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BriefcaseMedical, Scissors, Stethoscope, UserPlus, Database } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { greeting } from "../lib/format";
import StatCard from "./dashboard/StatCard";
import SurgeryCard from "./dashboard/SurgeryCard";
import RecentActivity from "./dashboard/RecentActivity";
import TodaySchedule from "./dashboard/TodaySchedule";

function Dashboard() {
  const { session, profile, openNewAppointment, openEditAppointment } = useOutletContext();
  const [range, setRange] = useState("today");
  const { loading, needsSetup, error, stats, surgery, activity, schedule } =
    useDashboard(session, range);

  const displayName = profile?.full_name || session?.user?.email || "";
  const isWeek = range === "week";

  const checkupBadge =
    stats.checkupTrend != null
      ? `${stats.checkupTrend >= 0 ? "+" : ""}${stats.checkupTrend}%`
      : stats.checkups > 0
        ? "New"
        : null;

  // Thresholds scale with the range so "Busy" still means busy over a week.
  const groomingHigh = isWeek ? 20 : 5;
  const groomingMid = isWeek ? 8 : 2;
  const groomingBadge =
    stats.groomings >= groomingHigh
      ? "Busy"
      : stats.groomings >= groomingMid
        ? "Steady"
        : stats.groomings > 0
          ? "Light"
          : null;

  const clientBadge = stats.newClients > 0 ? "New" : null;
  const surgeryBadge = stats.surgeries > 0 ? "OR" : null;

  return (
    <main className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Header: greeting + range toggle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-quicksand font-bold text-[32px] leading-10 tracking-[-0.64px] text-ink">
          {greeting(displayName)}
        </h1>
        <div className="flex items-center gap-1 rounded-[32px] bg-input p-1">
          {["today", "week"].map((value) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={
                range === value
                  ? "rounded-full bg-card px-5 py-1.5 font-nunito font-bold text-xs uppercase tracking-[0.6px] text-brand-dark shadow-sm"
                  : "rounded-full px-5 py-1.5 font-nunito font-bold text-xs uppercase tracking-[0.6px] text-subtle"
              }
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Setup / error notices */}
      {needsSetup && (
        <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-surface p-4">
          <Database className="size-5 shrink-0 text-brand-dark" strokeWidth={2} />
          <p className="font-nunito text-sm text-ink">
            Your database tables are not set up yet. Run{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-brand-dark">
              supabase/setup.sql
            </code>{" "}
            in the Supabase SQL Editor to populate the dashboard.
          </p>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-nunito text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left column: KPI strip + today's schedule (hero) */}
        <div className="flex flex-col gap-4 xl:col-span-8">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              Icon={BriefcaseMedical}
              value={loading ? "—" : stats.checkups}
              label={isWeek ? "Check-ups This Week" : "Check-ups Today"}
              badge={loading ? null : checkupBadge}
              variant="teal"
            />
            <StatCard
              Icon={Scissors}
              value={loading ? "—" : stats.groomings}
              label={isWeek ? "Groomings This Week" : "Groomings"}
              badge={loading ? null : groomingBadge}
              variant="rust"
            />
            <StatCard
              Icon={Stethoscope}
              value={loading ? "—" : stats.surgeries}
              label={isWeek ? "Surgeries This Week" : "Surgeries Today"}
              badge={loading ? null : surgeryBadge}
              variant="deep"
            />
            <StatCard
              Icon={UserPlus}
              value={loading ? "—" : stats.newClients}
              label={isWeek ? "New Clients This Week" : "New Clients"}
              badge={loading ? null : clientBadge}
              variant="gold"
            />
          </div>
          <TodaySchedule
            items={loading ? [] : schedule}
            loading={loading}
            title={isWeek ? "This Week's Schedule" : "Today's Schedule"}
            showDay={isWeek}
            onNew={openNewAppointment}
            onEdit={openEditAppointment}
          />
        </div>

        {/* Right rail: surgery alert + recent activity */}
        <div className="flex flex-col gap-4 xl:col-span-4">
          <SurgeryCard surgery={loading ? null : surgery} />
          <RecentActivity items={loading ? [] : activity} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
