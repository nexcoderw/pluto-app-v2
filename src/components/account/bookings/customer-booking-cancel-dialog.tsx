"use client";

import { useEffect, useState } from "react";
import {
	CalendarDays,
	CalendarX2,
	LoaderCircle,
	MapPin,
	ReceiptText,
	ShieldAlert,
} from "lucide-react";
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
import {
	formatBookingDate,
	formatBookingMoney,
} from "@/components/account/bookings/booking-display";
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
					<div className={styles.dialogIdentity}>
						<span className={styles.dialogIcon}>
							<ShieldAlert aria-hidden="true" />
						</span>
						<span className={styles.dialogEyebrow}>Booking cancellation</span>
					</div>
					<div className={styles.dialogCopy}>
						<DialogTitle>Cancel this booking?</DialogTitle>
						<DialogDescription>
							This releases your selected dates so another customer can book
							them. Review the details before confirming.
						</DialogDescription>
					</div>
				</DialogHeader>

				{booking ? (
					<div className={styles.bookingSummary}>
						<div className={styles.bookingTitle}>
							<span>{booking.bookingNo}</span>
							<strong>{booking.product.title}</strong>
						</div>
						<div className={styles.summaryGrid}>
							<span>
								<CalendarDays aria-hidden="true" />
								<strong>
									{formatBookingDate(booking.startDate)} -{" "}
									{formatBookingDate(booking.endDate)}
								</strong>
								<small>{booking.totalDays} day booking</small>
							</span>
							<span>
								<MapPin aria-hidden="true" />
								<strong>
									{booking.product.city}, {booking.product.country}
								</strong>
								<small>Reserved listing location</small>
							</span>
							<span>
								<ReceiptText aria-hidden="true" />
								<strong>
									{formatBookingMoney(booking.totalAmount, booking.currency)}
								</strong>
								<small>Current booking total</small>
							</span>
						</div>
					</div>
				) : null}

				<label className={styles.dialogField}>
					<span>Cancellation reason</span>
					<Textarea
						className={styles.reasonTextarea}
						value={reason}
						placeholder="Optional. Add a short reason so support and the partner understand what happened."
						disabled={isCancelling}
						maxLength={300}
						onChange={(event) => setReason(event.target.value)}
					/>
					<small>{reason.length}/300 characters</small>
				</label>

				<div className={styles.warningBox} role="note">
					<strong>What happens next</strong>
					<p>
						Your booking will move to cancelled, the partner will see the
						update, and the dates will become available again if no payment
						policy blocks them.
					</p>
				</div>

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
