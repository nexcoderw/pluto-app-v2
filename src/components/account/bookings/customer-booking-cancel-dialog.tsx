"use client";

import { useEffect, useState } from "react";
import { CalendarX2, LoaderCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { BookingSummary } from "@/services/api/bookings";
import { formatBookingDate } from "@/components/account/bookings/booking-display";
import styles from "./customer-booking-cancel-dialog.module.css";

type CustomerBookingCancelDialogProps = {
	booking: BookingSummary | null;
	isCancelling: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason?: string) => void;
};

export function CustomerBookingCancelDialog({
	booking,
	isCancelling,
	onOpenChange,
	onConfirm,
}: CustomerBookingCancelDialogProps) {
	const [reason, setReason] = useState("");

	useEffect(() => {
		setReason("");
	}, [booking?.id]);

	return (
		<Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
			<DialogContent className={styles.dialog} showCloseButton={!isCancelling}>
				<DialogHeader className={styles.dialogHeader}>
					<span className={styles.dialogIcon}>
						<ShieldAlert aria-hidden="true" />
					</span>
					<DialogTitle>Cancel this booking?</DialogTitle>
					<DialogDescription>
						This will release your selected dates for other customers.
					</DialogDescription>
				</DialogHeader>

				{booking ? (
					<div className={styles.bookingSummary}>
						<span>{booking.bookingNo}</span>
						<strong>{booking.product.title}</strong>
						<small>
							{formatBookingDate(booking.startDate)} -{" "}
							{formatBookingDate(booking.endDate)}
						</small>
					</div>
				) : null}

				<label className={styles.dialogField}>
					<span>Cancellation reason</span>
					<Textarea
						className={styles.reasonTextarea}
						value={reason}
						placeholder="Optional. Add a short reason."
						disabled={isCancelling}
						maxLength={300}
						onChange={(event) => setReason(event.target.value)}
					/>
					<small>{reason.length}/300 characters</small>
				</label>

				<DialogFooter className={styles.dialogFooter}>
					<Button
						type="button"
						variant="outline"
						className={styles.keepButton}
						disabled={isCancelling}
						onClick={() => onOpenChange(false)}
					>
						Keep booking
					</Button>
					<Button
						type="button"
						variant="destructive"
						className={styles.cancelButton}
						disabled={isCancelling}
						onClick={() => onConfirm(reason.trim() || undefined)}
					>
						{isCancelling ? (
							<LoaderCircle className={styles.spinner} aria-hidden="true" />
						) : (
							<CalendarX2 aria-hidden="true" />
						)}
						Cancel booking
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
