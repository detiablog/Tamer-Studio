"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  CalendarDays,
  ListTodo,
  Bell,
  CheckCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  AlertCircle,
  Timer,
  Settings,
  Loader,
  Trash2,
  Edit3,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch(() => ({ data: [] }));

type Tab = "calendar" | "agenda" | "tasks" | "timeline" | "reminders" | "settings";

type CalendarEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
  time?: string;
  color?: string;
};

type CalendarTask = {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  status: string;
  progress: number;
};

type CalendarReminder = {
  id: string;
  title: string;
  remindAt: string;
  enabled: boolean;
};

const EVENT_COLORS: Record<string, string> = {
  content: "bg-blue-500",
  meeting: "bg-green-500",
  deadline: "bg-red-500",
  reminder: "bg-yellow-500",
  other: "bg-gray-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "destructive",
  medium: "warning",
  low: "info",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "muted",
  "in-progress": "info",
  completed: "success",
  cancelled: "destructive",
};

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function MonthCalendar({
  events,
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  t,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  t: (key: string, fallback?: string) => string;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  events.forEach((event) => {
    const d = new Date(event.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    }
  });

  const monthLabel = currentDate.toLocaleString(undefined, { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-24" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const dayEvents = eventsByDay[d] || [];
    cells.push(
      <div
        key={d}
        className={`min-h-24 rounded-lg border border-border p-1.5 ${isToday ? "bg-primary/10 border-primary" : "bg-muted/20"}`}
      >
        <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {d}
        </div>
        <div className="space-y-0.5">
          {dayEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate"
            >
              <div className={`size-1.5 rounded-full shrink-0 ${EVENT_COLORS[event.type] || EVENT_COLORS.other}`} />
              <span className="truncate">{event.title}</span>
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onToday}>
            {t("contentCalendar.today", "Today")}
          </Button>
          <Button variant="ghost" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{t(`contentCalendar.${d}`, d.slice(0, 3))}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
}

export function CalendarPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("calendar");
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [showCreateEvent, setShowCreateEvent] = React.useState(false);
  const [showCreateTask, setShowCreateTask] = React.useState(false);

  const { data: eventsData, isLoading: eventsLoading, mutate: mutateEvents } = useSWR("/api/calendar/events", fetcher);
  const { data: tasksData, isLoading: tasksLoading, mutate: mutateTasks } = useSWR("/api/calendar/tasks", fetcher);
  const { data: remindersData, isLoading: remindersLoading, mutate: mutateReminders } = useSWR("/api/calendar/reminders", fetcher);
  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/calendar/stats", fetcher);

  const events: CalendarEvent[] = eventsData?.data ?? [];
  const tasks: CalendarTask[] = tasksData?.data ?? [];
  const reminders: CalendarReminder[] = remindersData?.data ?? [];
  const stats = statsData?.data ?? { totalEvents: 0, upcomingTasks: 0, activeReminders: 0, completedThisWeek: 0 };

  const [eventTitle, setEventTitle] = React.useState("");
  const [eventType, setEventType] = React.useState("content");
  const [eventDate, setEventDate] = React.useState("");
  const [eventTime, setEventTime] = React.useState("");
  const [eventSubmitting, setEventSubmitting] = React.useState(false);

  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskPriority, setTaskPriority] = React.useState("medium");
  const [taskDueDate, setTaskDueDate] = React.useState("");
  const [taskSubmitting, setTaskSubmitting] = React.useState(false);

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDate) return;
    setEventSubmitting(true);
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: eventTitle, type: eventType, date: eventDate, time: eventTime }),
      });
      if (res.ok) {
        toast.success(t("contentCalendar.eventCreated"));
        setEventTitle("");
        setEventType("content");
        setEventDate("");
        setEventTime("");
        setShowCreateEvent(false);
        mutateEvents();
        mutateStats();
      }
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !taskDueDate) return;
    setTaskSubmitting(true);
    try {
      const res = await fetch("/api/calendar/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, priority: taskPriority, dueDate: taskDueDate }),
      });
      if (res.ok) {
        toast.success(t("contentCalendar.taskCreated"));
        setTaskTitle("");
        setTaskPriority("medium");
        setTaskDueDate("");
        setShowCreateTask(false);
        mutateTasks();
        mutateStats();
      }
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/tasks/${id}/complete`, { method: "POST" });
      if (res.ok) {
        toast.success(t("contentCalendar.taskCompleted"));
        mutateTasks();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleToggleReminder = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/calendar/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (res.ok) {
        mutateReminders();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutateEvents();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const agendaEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const agendaGrouped: Record<string, CalendarEvent[]> = {};
  agendaEvents.forEach((event) => {
    const day = new Date(event.date).toLocaleDateString();
    if (!agendaGrouped[day]) agendaGrouped[day] = [];
    agendaGrouped[day].push(event);
  });

  const timelineEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabs = [
    { id: "calendar" as Tab, label: t("contentCalendar.calendar"), icon: CalendarDays },
    { id: "agenda" as Tab, label: t("contentCalendar.agenda"), icon: ListTodo },
    { id: "tasks" as Tab, label: t("contentCalendar.tasks"), icon: Flag },
    { id: "timeline" as Tab, label: t("contentCalendar.timeline"), icon: Clock },
    { id: "reminders" as Tab, label: t("contentCalendar.reminders"), icon: Bell },
    { id: "settings" as Tab, label: t("contentCalendar.settings"), icon: Settings },
  ];

  const renderCalendar = () => (
    <DashboardCard title={t("contentCalendar.calendar")}>
      <MonthCalendar
        events={events}
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        t={t}
      />
    </DashboardCard>
  );

  const renderAgenda = () => (
    <DashboardCard title={t("contentCalendar.agenda")}>
      {eventsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
      ) : Object.keys(agendaGrouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <CalendarDays className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("contentCalendar.noEvents")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(agendaGrouped).map(([day, dayEvents]) => (
            <div key={day}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">{day}</h4>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-3 rounded-full ${EVENT_COLORS[event.type] || EVENT_COLORS.other}`} />
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time || event.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("contentCalendar.tasks")}</h3>
        <Button size="sm" onClick={() => setShowCreateTask(!showCreateTask)}>
          <Plus className="mr-1 size-4" />
          {t("contentCalendar.createTask")}
        </Button>
      </div>
      {showCreateTask && (
        <DashboardCard title={t("contentCalendar.createTask")}>
          <div className="space-y-3">
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder={t("contentCalendar.eventTitle")}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("contentCalendar.priority")}</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("contentCalendar.dueDate")}</label>
                <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} disabled={taskSubmitting || !taskTitle.trim() || !taskDueDate}>
                {taskSubmitting ? <Loader className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                {t("contentCalendar.createTask")}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateTask(false)}>{t("common.cancel")}</Button>
            </div>
          </div>
        </DashboardCard>
      )}
      <DashboardCard title={t("contentCalendar.tasks")}>
        {tasksLoading ? (
          <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ListTodo className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("contentCalendar.noTasks")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {task.status !== "completed" && (
                    <Button variant="ghost" size="icon-sm" onClick={() => handleCompleteTask(task.id)}>
                      <CheckCircle className="size-4" />
                    </Button>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone={PRIORITY_COLORS[task.priority] as any || "muted"}>{task.priority}</Badge>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-20">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{task.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );

  const renderTimeline = () => (
    <DashboardCard title={t("contentCalendar.timeline")}>
      {eventsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
      ) : timelineEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Clock className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("contentCalendar.noEvents")}</p>
        </div>
      ) : (
        <div className="relative ml-3 border-l-2 border-border pl-6 space-y-6">
          {timelineEvents.map((event) => (
            <div key={event.id} className="relative">
              <div className={`absolute -left-[31px] top-1 size-4 rounded-full border-2 border-background ${EVENT_COLORS[event.type] || EVENT_COLORS.other}`} />
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone="info">{event.type}</Badge>
                      <span className="text-xs text-muted-foreground">{event.date}{event.time ? ` ${event.time}` : ""}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderReminders = () => (
    <DashboardCard title={t("contentCalendar.reminders")}>
      {remindersLoading ? (
        <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Bell className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("contentCalendar.noReminders")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-3">
                <AlertCircle className={`size-5 ${reminder.enabled ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">{reminder.title}</p>
                  <p className="text-xs text-muted-foreground">{reminder.remindAt}</p>
                </div>
              </div>
              <Button
                variant={reminder.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleReminder(reminder.id, reminder.enabled)}
              >
                {reminder.enabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderSettings = () => (
    <div className="space-y-4">
      <DashboardCard title={t("contentCalendar.settings")}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("common.timezone")}</label>
            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>UTC</option>
              <option>America/New_York</option>
              <option>America/Los_Angeles</option>
              <option>Europe/London</option>
              <option>Asia/Tokyo</option>
              <option>Asia/Bangkok</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("settings.notifications")}</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-border" />
                Email notifications for upcoming events
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-border" />
                Push notifications for task deadlines
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-border" />
                Daily agenda summary
              </label>
            </div>
          </div>
          <Button>{t("common.save")}</Button>
        </div>
      </DashboardCard>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("contentCalendar.title")} description={t("contentCalendar.description")} />

      <div className="grid gap-4 sm:grid-cols-4">
        <DashboardCard title={t("contentCalendar.totalEvents")}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title={t("contentCalendar.upcomingTasks")}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Flag className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.upcomingTasks}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title={t("contentCalendar.activeReminders")}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Bell className="size-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeReminders}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title={t("contentCalendar.completedThisWeek")}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {activeTab === "calendar" && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowCreateEvent(!showCreateEvent)}>
            <Plus className="mr-1 size-4" />
            {t("contentCalendar.createEvent")}
          </Button>
        </div>
      )}

      {activeTab === "calendar" && showCreateEvent && (
        <DashboardCard title={t("contentCalendar.createEvent")}>
          <div className="space-y-3">
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder={t("contentCalendar.eventTitle")}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("contentCalendar.eventType")}</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="content">Content</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("contentCalendar.eventDate")}</label>
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("contentCalendar.eventTime")}</label>
                <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateEvent} disabled={eventSubmitting || !eventTitle.trim() || !eventDate}>
                {eventSubmitting ? <Loader className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                {t("contentCalendar.createEvent")}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateEvent(false)}>{t("common.cancel")}</Button>
            </div>
          </div>
        </DashboardCard>
      )}

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "calendar" && renderCalendar()}
      {activeTab === "agenda" && renderAgenda()}
      {activeTab === "tasks" && renderTasks()}
      {activeTab === "timeline" && renderTimeline()}
      {activeTab === "reminders" && renderReminders()}
      {activeTab === "settings" && renderSettings()}
    </div>
  );
}
