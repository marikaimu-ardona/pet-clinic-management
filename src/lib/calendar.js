// Date helpers and timeline layout for the Vet Calendar.

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Monday as the first day of the week.
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  return addDays(d, -day);
}

// Seven Date objects, Monday to Sunday, for the week containing `date`.
export function weekDates(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// "October 12 - 18, 2023" (or spanning months / years where needed).
export function formatWeekRange(date) {
  const days = weekDates(date);
  const start = days[0];
  const end = days[6];
  const month = (d) => d.toLocaleDateString(undefined, { month: "long" });
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth && sameYear) {
    return `${month(start)} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (sameYear) {
    return `${month(start)} ${start.getDate()} - ${month(end)} ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${month(start)} ${start.getDate()}, ${start.getFullYear()} - ${month(end)} ${end.getDate()}, ${end.getFullYear()}`;
}

// Category -> visual accent + label. Falls back to the appointment type.
const CATEGORY_MAP = {
  routine: { accent: "teal", label: "Routine" },
  checkup: { accent: "teal", label: "Check-up" },
  vaccination: { accent: "gold", label: "Vaccination" },
  grooming: { accent: "gold", label: "Grooming" },
  surgery: { accent: "rust", label: "Surgery" },
};

export function categoryStyle(category, type) {
  return (
    CATEGORY_MAP[category] ??
    CATEGORY_MAP[type] ?? { accent: "teal", label: "Appointment" }
  );
}

// "check-up" / "grooming" / "surgery" for the block heading.
export function typeWord(type) {
  if (type === "checkup") return "check-up";
  return type;
}

function minutesOf(iso) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

// Greedy lane assignment so overlapping appointments sit side by side instead
// of stacking. Returns blocks with { appt, startMin, endMin, lane, lanes }.
export function layoutDay(appointments) {
  const items = appointments
    .map((appt) => {
      const startMin = minutesOf(appt.scheduled_at);
      return {
        appt,
        startMin,
        endMin: startMin + (appt.duration_minutes || 30),
      };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  // Split into clusters of transitively-overlapping items.
  const clusters = [];
  let current = [];
  let clusterEnd = -1;
  for (const it of items) {
    if (current.length && it.startMin >= clusterEnd) {
      clusters.push(current);
      current = [];
      clusterEnd = -1;
    }
    current.push(it);
    clusterEnd = Math.max(clusterEnd, it.endMin);
  }
  if (current.length) clusters.push(current);

  const blocks = [];
  for (const cluster of clusters) {
    const laneEnds = [];
    for (const it of cluster) {
      let lane = laneEnds.findIndex((end) => end <= it.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(it.endMin);
      } else {
        laneEnds[lane] = it.endMin;
      }
      it.lane = lane;
    }
    const lanes = laneEnds.length;
    for (const it of cluster) {
      blocks.push({ ...it, lanes });
    }
  }
  return blocks;
}

export function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function addYears(date, n) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + n);
  return d;
}

// 42 dates (6 weeks, Monday-first) covering the month grid for `date`.
export function monthGridDates(date) {
  const start = startOfWeek(startOfMonth(date));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

// First-of-month Date for each of the 12 months in `date`'s year.
export function yearMonths(date) {
  const year = date.getFullYear();
  return Array.from({ length: 12 }, (_, m) => new Date(year, m, 1));
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

// True if the date falls on a day before today (a passed day). Used to lock
// editing of appointments in the past.
export function isPastDay(dateOrIso) {
  const d = new Date(dateOrIso);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// Local "YYYY-MM-DD" key for bucketing appointments by day.
export function dayKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function groupByDay(appointments) {
  const map = {};
  for (const a of appointments) {
    const key = dayKey(a.scheduled_at);
    (map[key] ??= []).push(a);
  }
  return map;
}

// The [start, end) Date range to fetch for a given view + anchor date.
export function rangeFor(view, date) {
  if (view === "day") {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return { start, end: addDays(start, 1) };
  }
  if (view === "week") {
    const start = startOfWeek(date);
    return { start, end: addDays(start, 7) };
  }
  if (view === "month") {
    const dates = monthGridDates(date);
    return { start: dates[0], end: addDays(dates[41], 1) };
  }
  return { start: new Date(date.getFullYear(), 0, 1), end: new Date(date.getFullYear() + 1, 0, 1) };
}

// Step the anchor date forward/back by one unit of the active view.
export function addByView(date, view, dir) {
  if (view === "day") return addDays(date, dir);
  if (view === "week") return addDays(date, dir * 7);
  if (view === "month") return addMonths(date, dir);
  return addYears(date, dir);
}

// Heading label for the current view + date.
export function rangeLabel(view, date) {
  if (view === "day")
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  if (view === "week") return formatWeekRange(date);
  if (view === "month")
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return String(date.getFullYear());
}

// The visible time window, clamped so it always covers the day's appointments.
export function timelineBounds(appointments, defaultStart = 8, defaultEnd = 18) {
  if (!appointments.length) return { startHour: defaultStart, endHour: defaultEnd };
  let min = defaultStart * 60;
  let max = defaultEnd * 60;
  for (const a of appointments) {
    const start = minutesOf(a.scheduled_at);
    min = Math.min(min, start);
    max = Math.max(max, start + (a.duration_minutes || 30));
  }
  return {
    startHour: Math.max(0, Math.floor(min / 60)),
    endHour: Math.min(24, Math.ceil(max / 60)),
  };
}
