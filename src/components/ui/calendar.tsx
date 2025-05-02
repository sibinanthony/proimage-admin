"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Simple calendar implementation without dependencies
export interface CalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | null;
  onSelect?: (date: Date | null) => void;
  className?: string;
  initialFocus?: boolean;
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  initialFocus,
}: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());

  // Go to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Go to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Build calendar days
  const buildCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    return days;
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    if (!selected || !date) return false;

    if (Array.isArray(selected)) {
      return selected.some((s) => 
        s.getDate() === date.getDate() && 
        s.getMonth() === date.getMonth() && 
        s.getFullYear() === date.getFullYear()
      );
    }

    return (
      selected.getDate() === date.getDate() &&
      selected.getMonth() === date.getMonth() &&
      selected.getFullYear() === date.getFullYear()
    );
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Handle date selection
  const handleSelect = (date: Date) => {
    if (onSelect) {
      // Pass null for toggle if same date is selected again
      if (isSelected(date) && mode === 'single') {
        onSelect(null);
      } else {
        onSelect(date);
      }
    }
  };

  const days = buildCalendar();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={cn("p-3 bg-black text-white", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-center pt-1 relative">
          <div className="text-sm font-medium">
            {monthNames[currentMonth]} {currentYear}
          </div>
          <div className="space-x-1 flex items-center absolute right-1">
            <button
              onClick={prevMonth}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-gray-800 text-white p-0 opacity-80 hover:opacity-100 hover:bg-gray-700 border-gray-700"
              )}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-gray-800 text-white p-0 opacity-80 hover:opacity-100 hover:bg-gray-700 border-gray-700"
              )}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="w-full border-collapse space-y-1">
          <div className="flex">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-gray-400 rounded-md w-8 font-normal text-[0.8rem] text-center"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => (
              <div key={i} className="relative p-0 text-center">
                {day ? (
                  <button
                    onClick={() => handleSelect(day)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-8 w-8 p-0 font-normal text-white hover:bg-gray-700",
                      isSelected(day) &&
                        "bg-blue-600 text-white hover:bg-blue-700",
                      isToday(day) && !isSelected(day) && "bg-gray-800 text-white border border-gray-700"
                    )}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <div className="h-8 w-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Calendar }; 