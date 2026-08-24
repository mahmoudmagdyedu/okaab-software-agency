import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

import { MonoText } from "@/components/mawid/mono-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CalendarStaff } from "@/lib/calendar";
import { cn } from "@/lib/utils";

export interface CalendarToolbarProps {
  weekLabel: string;
  staff: CalendarStaff[];
  activeStaffIds: string[];
  query: string;
  onQueryChange: (value: string) => void;
  onToggleStaff: (id: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onNewAppointment: () => void;
}

export function CalendarToolbar({
  weekLabel,
  staff,
  activeStaffIds,
  query,
  onQueryChange,
  onToggleStaff,
  onPrevWeek,
  onNextWeek,
  onToday,
  onNewAppointment,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3 xl:flex-row xl:items-center">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start">
        <div className="flex items-center gap-1">
          {/* سهم «السابق» يشير يمينًا في RTL */}
          <Button variant="outline" size="icon" aria-label="الأسبوع السابق" onClick={onPrevWeek}>
            <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <Button variant="outline" size="icon" aria-label="الأسبوع التالي" onClick={onNextWeek}>
            <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <Button variant="outline" className="min-h-10" onClick={onToday}>
            اليوم
          </Button>
        </div>

        <MonoText className="whitespace-nowrap text-body-sm text-[var(--text-secondary)]">
          {weekLabel}
        </MonoText>
      </div>

      <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 xl:min-w-0 xl:flex-1 xl:pb-0">
        {staff.map((member) => {
          const active = activeStaffIds.includes(member.id);
          return (
            <button
              key={member.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleStaff(member.id)}
              className={cn(
                "min-h-10 shrink-0 whitespace-nowrap rounded-[6px] border px-3 text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)]",
                active
                  ? "border-accent-100 bg-accent-50 text-accent-700"
                  : "border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
              )}
            >
              {member.fullName}
            </button>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 sm:ms-auto sm:w-auto">
        <div className="relative sm:w-[240px]">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="بحث عن عميل"
            placeholder="ابحث باسم العميل"
            className="pr-9"
          />
        </div>

        <Button className="min-h-10 gap-2 whitespace-nowrap" onClick={onNewAppointment}>
          <Plus className="size-4" strokeWidth={1.5} aria-hidden />
          <span className="hidden sm:inline">موعد جديد</span>
          <span className="sm:hidden">جديد</span>
        </Button>
      </div>
    </div>
  );
}
