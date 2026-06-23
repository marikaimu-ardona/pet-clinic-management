import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Database } from "lucide-react";
import { useGrooming } from "../hooks/useGrooming";
import { rangeLabel, addByView } from "../lib/calendar";
import WeekStrip from "../components/grooming/WeekStrip";
import GroomingAgenda from "../components/grooming/GroomingAgenda";
import GroomingWeek from "../components/grooming/GroomingWeek";
import TodaysLoadCard from "../components/grooming/TodaysLoadCard";
import StaffOnDutyCard from "../components/grooming/StaffOnDutyCard";
import QuickNoteCard from "../components/grooming/QuickNoteCard";
import MonthView from "../components/calendar/MonthView";

const VIEWS = ["week", "day", "month"];

function Grooming() {
  const { openNewAppointment, openEditAppointment } = useOutletContext();
  const [view, setView] = useState("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { loading, error, needsSetup, dayAppointments, rangeAppointments, staff, load, note } =
    useGrooming(view, selectedDate);

  const openDay = (date) => {
    setSelectedDate(date);
    setView("day");
  };

  return (
    <main className="flex flex-col gap-6 p-6 sm:p-8">
      <h1 className="font-quicksand font-bold text-[32px] leading-10 tracking-[-0.64px] text-ink">
        Grooming Calendar
      </h1>

      {/* Controls + primary action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 rounded-[32px] bg-input p-1">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={
                  view === v
                    ? "rounded-full bg-card px-4 py-1.5 font-nunito font-bold text-xs capitalize text-brand-dark shadow-sm"
                    : "rounded-full px-4 py-1.5 font-nunito font-bold text-xs capitalize text-subtle"
                }
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-surface px-2 py-1">
            <button
              onClick={() => setSelectedDate(addByView(selectedDate, view, -1))}
              aria-label="Previous"
              className="rounded-full p-1.5 text-subtle hover:bg-card"
            >
              <ChevronLeft className="size-4" strokeWidth={2.5} />
            </button>
            <span className="font-nunito font-bold text-sm text-ink">
              {rangeLabel(view, selectedDate)}
            </span>
            <button
              onClick={() => setSelectedDate(addByView(selectedDate, view, 1))}
              aria-label="Next"
              className="rounded-full p-1.5 text-subtle hover:bg-card"
            >
              <ChevronRight className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <button
          onClick={openNewAppointment}
          className="flex items-center gap-2 rounded-full bg-brand-dark px-6 py-3 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110 active:brightness-95"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          New Appointment
        </button>
      </div>

      {needsSetup && (
        <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-surface p-4">
          <Database className="size-5 shrink-0 text-brand-dark" strokeWidth={2} />
          <p className="font-nunito text-sm text-ink">
            Grooming tables are not set up yet. Run{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-brand-dark">
              supabase/0004_grooming.sql
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Schedule */}
        <div className="flex flex-col gap-4 xl:col-span-8">
          {view !== "month" && (
            <WeekStrip selectedDate={selectedDate} onSelectDay={setSelectedDate} />
          )}
          {view === "day" && (
            <GroomingAgenda
              appointments={dayAppointments}
              loading={loading}
              onEdit={openEditAppointment}
              onNew={openNewAppointment}
            />
          )}
          {view === "week" && (
            <GroomingWeek
              selectedDate={selectedDate}
              appointments={rangeAppointments}
              loading={loading}
              onSelectDay={openDay}
              onEdit={openEditAppointment}
            />
          )}
          {view === "month" && (
            <MonthView
              selectedDate={selectedDate}
              appointments={rangeAppointments}
              loading={loading}
              onSelectDay={openDay}
            />
          )}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4 xl:col-span-4">
          <TodaysLoadCard load={load} />
          <StaffOnDutyCard staff={staff} />
          <QuickNoteCard note={note?.note} />
        </div>
      </div>
    </main>
  );
}

export default Grooming;
