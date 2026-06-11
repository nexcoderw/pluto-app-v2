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
import styles from "./customer-bookings-page.module.css";

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
		if (!booking) {
			setReason("");
		}
	}, [booking]);

	return (
		<Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
			<DialogContent className={styles.dialog}>
				<DialogHeader className={styles.dialogHeader}>
					<span className={styles.dialogIcon}>
						<ShieldAlert aria-hidden="true" />
					</span>
					<DialogTitle>Cancel this booking?</DialogTitle>
					<DialogDescription>
						This releases the selected dates for other customers. If payment is
						added later, refund rules will depend on the payment policy.
					</DialogDescription>
				</DialogHeader>

				{booking ? (
					<div className={styles.dialogMeta}>
						<span>{booking.bookingNo}</span>
						<strong>{booking.product.title}</strong>
					</div>
				) : null}

				<label className={styles.dialogField}>
					<span>Reason for cancellation</span>
					<Textarea
						value={reason}
						placeholder="Optional. Add a short reason so support and partners understand what happened."
						disabled={isCancelling}
						onChange={(event) => setReason(event.target.value)}
					/>
				</label>

				<DialogFooter className={styles.dialogFooter}>
					<Button
						type="button"
						variant="outline"
						disabled={isCancelling}
						onClick={() => onOpenChange(false)}
					>
						Keep booking
					</Button>
					<Button
						type="button"
						variant="destructive"
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
