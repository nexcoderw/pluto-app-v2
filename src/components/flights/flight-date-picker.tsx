"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import styles from "./flight-request-page.module.css";

const Calendar = dynamic(
	() => import("@/components/ui/calendar").then((module) => module.Calendar),
	{
		loading: () => (
			<div
				className={styles.calendarSkeleton}
				role="status"
				aria-label="Loading calendar"
			/>
		),
	},
);

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
	const [draftDate, setDraftDate] = useState<Date | undefined>(selectedDate);
	const min = useMemo(() => parseIsoDate(minDate), [minDate]);
	const max = useMemo(() => parseIsoDate(maxDate), [maxDate]);
	const disabledRules = [
		min ? { before: min } : null,
		max ? { after: max } : null,
	].filter((rule): rule is { before: Date } | { after: Date } => Boolean(rule));

	useEffect(() => {
		if (isOpen) {
			setDraftDate(selectedDate);
		}
	}, [isOpen, selectedDate]);

	function handleSelect(date: Date | undefined) {
		if (!date) {
			return;
		}

		setDraftDate(date);
	}

	function handleClearDate() {
		setDraftDate(undefined);
		onChange("");
	}

	function handleUseDate() {
		if (draftDate) {
			onChange(toIsoDate(draftDate));
		}

		setIsOpen(false);
	}

	return (
		<>
			<div className={styles.field}>
				<span>{label}</span>
				<button
					type="button"
					className={styles.dateTrigger}
					disabled={disabled}
					aria-label={`${label}: ${selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}`}
					aria-haspopup="dialog"
					onClick={() => setIsOpen(true)}
				>
					<strong>
						{selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
					</strong>
					<CalendarDays aria-hidden="true" />
				</button>
			</div>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className={styles.dateDialog}>
					<DialogHeader>
						<DialogTitle>{label}</DialogTitle>
						<DialogDescription>
							{description ?? "Choose the exact date for this flight request."}
						</DialogDescription>
					</DialogHeader>
					<div className={styles.dialogCalendarShell}>
						{isOpen ? (
							<Calendar
								mode="single"
								selected={draftDate}
								onSelect={handleSelect}
								disabled={disabledRules}
								showOutsideDays={false}
								className={styles.dialogCalendar}
								captionLayout="dropdown"
							/>
						) : null}
					</div>
					<DialogFooter className={styles.dateDialogFooter}>
						<Button
							type="button"
							variant="outline"
							className={styles.dateDialogButton}
							onClick={handleClearDate}
						>
							<XCircle aria-hidden="true" />
							Clear date
						</Button>
						<Button
							type="button"
							className={styles.dateDialogButton}
							onClick={handleUseDate}
						>
							<CheckCircle2 aria-hidden="true" />
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
