"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
	BookingSummary,
	UpdatePartnerBookingStatusPayload,
} from "@/services/api/bookings";
import { formatBookingStatus } from "@/components/account/bookings/booking-display";
import styles from "./partner-bookings-page.module.css";

type PartnerEditableBookingStatus = UpdatePartnerBookingStatusPayload["status"];

type PartnerBookingStatusOption = {
	label: string;
	value: PartnerEditableBookingStatus;
};

type PartnerBookingStatusDialogProps = {
	booking: BookingSummary | null;
	isSubmitting: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (payload: UpdatePartnerBookingStatusPayload) => void;
};

export function PartnerBookingStatusDialog({
	booking,
	isSubmitting,
	onOpenChange,
	onConfirm,
}: PartnerBookingStatusDialogProps) {
	const [status, setStatus] = useState<PartnerEditableBookingStatus | null>(null);
	const [reason, setReason] = useState("");
	const options = booking ? getAllowedStatusOptions(booking) : [];
	const selectedStatus =
		status && options.some((option) => option.value === status) ? status : null;
	const canSubmit = Boolean(selectedStatus && reason.trim().length >= 5);

	useEffect(() => {
		setStatus(null);
		setReason("");
	}, [booking?.id]);

	return (
		<Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
			<DialogContent className={styles.dialog} showCloseButton={!isSubmitting}>
				<DialogHeader className={styles.dialogHeader}>
					<span className={styles.dialogIcon}>
						<ShieldCheck aria-hidden="true" />
					</span>
					<DialogTitle>Update booking status</DialogTitle>
					<DialogDescription>
						Publish an allowed operational update. Payment, refund,
						confirmation, and expiry truth remain system-controlled.
					</DialogDescription>
				</DialogHeader>

				{booking ? (
					<div className={styles.dialogMeta}>
						<span>{booking.bookingNo}</span>
						<strong>{booking.product.title}</strong>
						<small>Current status: {formatBookingStatus(booking.status)}</small>
					</div>
				) : null}

				{options.length > 0 ? (
					<>
						<label className={styles.dialogField}>
							<span>Operational action</span>
							<Select
								value={selectedStatus ?? undefined}
								disabled={isSubmitting}
								onValueChange={(value) =>
									setStatus(value as PartnerEditableBookingStatus)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose an allowed action" />
								</SelectTrigger>
								<SelectContent align="start" alignItemWithTrigger={false}>
									<SelectGroup>
										{options.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</label>

						<label className={styles.dialogField}>
							<span>Required customer-safe reason</span>
							<Textarea
								value={reason}
								maxLength={1000}
								placeholder="Explain the verified operational reason without payment data or customer secrets."
								disabled={isSubmitting}
								onChange={(event) => setReason(event.target.value)}
							/>
							<small>Use at least 5 characters.</small>
						</label>
					</>
				) : (
					<p className={styles.dialogNotice}>
						No safe manual action is available yet. Completion is enabled only
						after a paid service ends; financial cancellations use the dedicated
						booking and refund workflows.
					</p>
				)}

				<DialogFooter className={styles.dialogFooter}>
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting}
						onClick={() => onOpenChange(false)}
					>
						<X aria-hidden="true" />
						Cancel
					</Button>
					{options.length > 0 ? (
						<Button
							type="button"
							className={styles.primaryButton}
							disabled={isSubmitting || !canSubmit}
							aria-label={isSubmitting ? "Updating booking status" : undefined}
							onClick={() => {
								if (!selectedStatus || !canSubmit) return;

								onConfirm({
									status: selectedStatus,
									reason: reason.trim(),
								});
							}}
						>
							{isSubmitting ? (
								<LoaderCircle className={styles.spinner} aria-hidden="true" />
							) : (
								<>
									<ShieldCheck aria-hidden="true" />
									Publish update
								</>
							)}
						</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function getAllowedStatusOptions(
	booking: BookingSummary,
): PartnerBookingStatusOption[] {
	if (
		["PROCESSING", "REFUNDED", "PARTIALLY_REFUNDED"].includes(
			booking.paymentStatus,
		)
	) {
		return [];
	}

	if (booking.status === "PENDING") {
		return booking.paymentStatus === "PAID"
			? []
			: [
					{ label: "Reject request", value: "REJECTED" },
					{ label: "Cancel as partner", value: "CANCELLED_BY_PARTNER" },
				];
	}

	if (booking.status === "CONFIRMED") {
		return booking.paymentStatus === "PAID" &&
			new Date(booking.endDate).getTime() <= Date.now()
			? [{ label: "Mark service completed", value: "COMPLETED" }]
			: booking.paymentStatus === "PAID"
				? []
				: [{ label: "Cancel as partner", value: "CANCELLED_BY_PARTNER" }];
	}

	return [];
}
