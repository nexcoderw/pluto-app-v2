"use client";

import {
	AlertCircle,
	CalendarCheck,
	CheckCircle2,
	Loader2,
	ShieldCheck,
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
import type { BookingSummary } from "@/services/api/bookings";
import { formatMoney } from "./listing-formatters";
import styles from "./listing-booking-dialog.module.css";

export type ListingBookingDialogMode =
	| "confirm"
	| "progress"
	| "success"
	| "error";

type ListingBookingDialogProps = {
	open: boolean;
	mode: ListingBookingDialogMode;
	listingTitle: string;
	formattedRange: string;
	durationCount: number;
	durationLabel: string;
	totalPrice: number;
	currency: string;
	errorMessage?: string;
	booking?: BookingSummary;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	onRetryDates: () => void;
};

export function ListingBookingDialog({
	open,
	mode,
	listingTitle,
	formattedRange,
	durationCount,
	durationLabel,
	totalPrice,
	currency,
	errorMessage,
	booking,
	onOpenChange,
	onConfirm,
	onRetryDates,
}: ListingBookingDialogProps) {
	const isProgress = mode === "progress";

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (isProgress) {
					return;
				}

				onOpenChange(nextOpen);
			}}
		>
			<DialogContent
				className={styles.dialog}
				showCloseButton={!isProgress}
				aria-busy={isProgress}
			>
				{mode === "confirm" ? (
					<>
						<DialogHeader className={styles.header}>
							<span className={styles.iconWrap} data-tone="confirm">
								<CalendarCheck aria-hidden="true" />
							</span>
							<DialogTitle>Confirm booking request</DialogTitle>
							<DialogDescription>
								Review your selected dates before Pluto Booking sends this
								request to the verified partner.
							</DialogDescription>
						</DialogHeader>
						<BookingDialogSummary
							listingTitle={listingTitle}
							formattedRange={formattedRange}
							durationCount={durationCount}
							durationLabel={durationLabel}
							totalPrice={totalPrice}
							currency={currency}
						/>
						<DialogFooter className={styles.footer}>
							<Button
								type="button"
								variant="outline"
								className={styles.secondaryButton}
								onClick={() => onOpenChange(false)}
							>
								<AlertCircle aria-hidden="true" />
								Review dates
							</Button>
							<Button
								type="button"
								className={styles.primaryButton}
								onClick={onConfirm}
							>
								<ShieldCheck aria-hidden="true" />
								Send booking request
							</Button>
						</DialogFooter>
					</>
				) : null}

				{mode === "progress" ? (
					<>
						<DialogHeader className={styles.header}>
							<span className={styles.iconWrap} data-tone="progress">
								<Loader2 aria-hidden="true" />
							</span>
							<DialogTitle>Creating your booking</DialogTitle>
							<DialogDescription>
								We are checking availability again and saving your request
								securely. Keep this window open.
							</DialogDescription>
						</DialogHeader>
						<div className={styles.progressTrack} aria-hidden="true">
							<span />
						</div>
						<BookingDialogSummary
							listingTitle={listingTitle}
							formattedRange={formattedRange}
							durationCount={durationCount}
							durationLabel={durationLabel}
							totalPrice={totalPrice}
							currency={currency}
						/>
					</>
				) : null}

				{mode === "success" ? (
					<>
						<DialogHeader className={styles.header}>
							<span className={styles.iconWrap} data-tone="success">
								<CheckCircle2 aria-hidden="true" />
							</span>
							<DialogTitle>Booking request received</DialogTitle>
							<DialogDescription>
								Your request is now pending partner review. You can track it
								from your customer portal.
							</DialogDescription>
						</DialogHeader>
						<div className={styles.successBox}>
							<span>Booking number</span>
							<strong>{booking?.bookingNo ?? "Created"}</strong>
						</div>
						<DialogFooter className={styles.footer}>
							<Button
								type="button"
								variant="outline"
								className={styles.secondaryButton}
								onClick={() => onOpenChange(false)}
							>
								<AlertCircle aria-hidden="true" />
								Close
							</Button>
							<Button
								type="button"
								className={styles.primaryButton}
								onClick={() => onOpenChange(false)}
							>
								<CheckCircle2 aria-hidden="true" />
								Done
							</Button>
						</DialogFooter>
					</>
				) : null}

				{mode === "error" ? (
					<>
						<DialogHeader className={styles.header}>
							<span className={styles.iconWrap} data-tone="error">
								<AlertCircle aria-hidden="true" />
							</span>
							<DialogTitle>Booking needs attention</DialogTitle>
							<DialogDescription>
								{errorMessage ??
									"We could not create this booking. Please review the dates and try again."}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className={styles.footer}>
							<Button
								type="button"
								variant="outline"
								className={styles.secondaryButton}
								onClick={onRetryDates}
							>
								<CalendarCheck aria-hidden="true" />
								Choose another date
							</Button>
							<Button
								type="button"
								className={styles.primaryButton}
								onClick={() => onOpenChange(false)}
							>
								<ShieldCheck aria-hidden="true" />
								I understand
							</Button>
						</DialogFooter>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

function BookingDialogSummary({
	listingTitle,
	formattedRange,
	durationCount,
	durationLabel,
	totalPrice,
	currency,
}: {
	listingTitle: string;
	formattedRange: string;
	durationCount: number;
	durationLabel: string;
	totalPrice: number;
	currency: string;
}) {
	return (
		<section className={styles.summary}>
			<div>
				<span>Listing</span>
				<strong>{listingTitle}</strong>
			</div>
			<div>
				<span>Dates</span>
				<strong>{formattedRange}</strong>
			</div>
			<div>
				<span>Duration</span>
				<strong>
					{durationCount} {durationLabel}
				</strong>
			</div>
			<div>
				<span>Current estimate</span>
				<strong>{formatMoney(String(totalPrice), currency)}</strong>
			</div>
			<p className={styles.estimateNote}>
				Estimate only. Pluto Booking will return the final payable total from
				a secure server quote before any payment.
			</p>
		</section>
	);
}
