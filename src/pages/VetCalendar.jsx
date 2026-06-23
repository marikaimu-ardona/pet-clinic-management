import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCalendar } from "../hooks/useCalendar";
import { rangeFor, startOfMonth } from "../lib/calendar";
import CalendarHeader from "../components/calendar/CalendarHeader";
import DayTimeline from "../components/calendar/DayTimeline";
import WeekView from "../components/calendar/WeekView";
import MonthView from "../components/calendar/MonthView";
import YearView from "../components/calendar/YearView";
import DailySummaryCard from "../components/calendar/DailySummaryCard";

const SUMMARY_TITLE = {
  day: "Daily Summary",
  week: "Weekly Summary",
  month: "Monthly Summary",
  year: "Yearly Summary",
};

function VetCalendar() {
  const { openNewAppointment, openEditAppointment } = useOutletContext();
  const [view, setView] = useState("day");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { start, end } = useMemo(() => rangeFor(view, selectedDate), [view, selectedDate]);
  const { loading, error, appointments, summary } = useCalendar(start, end);

  // Drilling down: clicking a day in week/month/year opens the Day view.
  const openDay = (date) => {
    setSelectedDate(date);
    setView("day");
  };
  const openMonth = (date) => {
    setSelectedDate(startOfMonth(date));
    setView("month");
  };

  return (
    <main className="relative flex flex-col gap-6 p-6 sm:p-8">
      <CalendarHeader
        view={view}
        onChangeView={setView}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-nunito text-sm text-red-700">
          {error}
        </div>
      )}

      {view === "day" && (
        <DayTimeline appointments={appointments} loading={loading} onEdit={openEditAppointment} />
      )}
      {view === "week" && (
        <WeekView
          selectedDate={selectedDate}
          appointments={appointments}
          loading={loading}
          onSelectDay={openDay}
        />
      )}
      {view === "month" && (
        <MonthView
          selectedDate={selectedDate}
          appointments={appointments}
          loading={loading}
          onSelectDay={openDay}
        />
      )}
      {view === "year" && (
        <YearView
          selectedDate={selectedDate}
          appointments={appointments}
          loading={loading}
          onSelectDay={openDay}
          onSelectMonth={openMonth}
        />
      )}

      {/* Summary (floating on large screens, inline otherwise) */}
      <div className="pointer-events-none fixed bottom-8 right-8 z-20 hidden xl:block">
        <div className="pointer-events-auto">
          <DailySummaryCard summary={summary} title={SUMMARY_TITLE[view]} />
        </div>
      </div>
      <div className="xl:hidden">
        <DailySummaryCard summary={summary} title={SUMMARY_TITLE[view]} />
      </div>

      {/* Contextual FAB */}
      <button
        onClick={openNewAppointment}
        aria-label="Book new appointment"
        className="fixed bottom-8 right-8 z-30 flex size-14 items-center justify-center rounded-full bg-accent-rust text-white shadow-2xl transition hover:brightness-105 active:scale-95 xl:bottom-[19rem]"
      >
        <Plus className="size-5" strokeWidth={3} />
      </button>
    </main>
  );
}

export default VetCalendar;
