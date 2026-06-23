"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import styles from "./flight-request-page.module.css";

type FlightDatePickerProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  description?: string;
};

export function FlightDatePicker({
  label,
  value,
  placeholder,
  onChange,
  minDate,
  maxDate,
  disabled,
  description,
}: FlightDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const min = useMemo(() => parseIsoDate(minDate), [minDate]);
  const max = useMemo(() => parseIsoDate(maxDate), [maxDate]);
  const disabledRules = [
    min ? { before: min } : null,
    max ? { after: max } : null,
  ].filter((rule): rule is { before: Date } | { after: Date } => Boolean(rule));

  function handleSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    onChange(toIsoDate(date));
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={styles.dateTrigger}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        <span>{label}</span>
        <strong>
          {selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
        </strong>
        <CalendarDays aria-hidden="true" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={styles.dateDialog}>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {description ?? "Choose the exact date for this flight request."}
            </DialogDescription>
          </DialogHeader>
          <div className={styles.dialogCalendarShell}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={disabledRules}
              showOutsideDays={false}
              className={styles.dialogCalendar}
              captionLayout="dropdown"
            />
          </div>
          <DialogFooter className={styles.dateDialogFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange("")}
            >
              Clear date
            </Button>
            <Button type="button" onClick={() => setIsOpen(false)}>
              Use date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function parseIsoDate(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00`);
}

function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}
