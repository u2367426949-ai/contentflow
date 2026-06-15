"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: Date) => void;
  platform: string;
  contentPreview: string;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  platform,
  contentPreview,
}: ScheduleModalProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");

  if (!isOpen) return null;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const handleSchedule = () => {
    if (!selectedDate) return;
    const scheduled = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(hour),
      parseInt(minute)
    );
    if (scheduled <= new Date()) {
      alert("La date doit être dans le futur.");
      return;
    }
    onSchedule(scheduled);
  };

  const platformLabel: Record<string, string> = {
    linkedin: "LinkedIn",
    twitter: "Twitter / X",
    instagram: "Instagram",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Programmer</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Platform + preview */}
          <div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent/10 text-accent capitalize">
              {platformLabel[platform] || platform}
            </span>
            <p className="text-xs text-muted mt-2 line-clamp-2">{contentPreview.slice(0, 150)}</p>
          </div>

          {/* Calendar */}
          <div>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-surface transition-colors">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-sm font-medium text-foreground">
                {MONTHS[month]} {year}
              </span>
              <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-surface transition-colors">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isPast = dateStr < todayStr;
                const isSelected = selectedDate && 
                  selectedDate.getDate() === day && 
                  selectedDate.getMonth() === month && 
                  selectedDate.getFullYear() === year;

                return (
                  <button
                    key={day}
                    onClick={() => !isPast && handleDateClick(day)}
                    disabled={isPast}
                    className={`h-9 rounded-lg text-xs font-medium transition-all ${
                      isPast
                        ? "text-muted-foreground/30 cursor-default"
                        : isSelected
                          ? "bg-accent text-white shadow-sm"
                          : "hover:bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time picker */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              <Clock className="w-3 h-3 inline mr-1" />
              Heure
            </label>
            <div className="flex items-center gap-2">
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>
                    {String(i).padStart(2, "0")}h
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">:</span>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent outline-none"
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected date summary */}
          {selectedDate && (
            <div className="text-xs text-muted-foreground text-center py-1">
              📅 {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              {" à "}{hour}h{minute}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSchedule}
              disabled={!selectedDate}
              className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Programmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
