"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
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

const partnerStatusOptions: Array<{
	label: string;
	value: UpdatePartnerBookingStatusPayload["status"];
}> = [
	{ label: "Reject request", value: "REJECTED" },
	{ label: "Cancel as partner", value: "CANCELLED_BY_PARTNER" },
	{ label: "Mark completed", value: "COMPLETED" },
];

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
	const [status, setStatus] =
		useState<UpdatePartnerBookingStatusPayload["status"]>("REJECTED");
	const [reason, setReason] = useState("");

	useEffect(() => {
		if (!booking) {
			setStatus("REJECTED");
			setReason("");
		}
	}, [booking]);

	return (
		<Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
			<DialogContent className={styles.dialog}>
				<DialogHeader className={styles.dialogHeader}>
					<span className={styles.dialogIcon}>
						<ShieldCheck aria-hidden="true" />
					</span>
					<DialogTitle>Update booking status</DialogTitle>
					<DialogDescription>
						Partners can reject, cancel, or complete bookings. Payment
						confirmation will later move successful paid bookings to confirmed.
					</DialogDescription>
				</DialogHeader>

				{booking ? (
					<div className={styles.dialogMeta}>
						<span>{booking.bookingNo}</span>
						<strong>{booking.product.title}</strong>
						<small>Current status: {formatBookingStatus(booking.status)}</small>
					</div>
				) : null}

				<label className={styles.dialogField}>
					<span>Status</span>
					<Select
						value={status}
						disabled={isSubmitting}
						onValueChange={(value) =>
							setStatus(value as UpdatePartnerBookingStatusPayload["status"])
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectGroup>
								{partnerStatusOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</label>

				<label className={styles.dialogField}>
					<span>Reason or operational note</span>
					<Textarea
						value={reason}
						placeholder="Add customer-safe context for this status update."
						disabled={isSubmitting}
						onChange={(event) => setReason(event.target.value)}
					/>
				</label>

				<DialogFooter className={styles.dialogFooter}>
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						className={styles.primaryButton}
						disabled={isSubmitting}
						onClick={() =>
							onConfirm({
								status,
								reason: reason.trim() || undefined,
							})
						}
					>
						{isSubmitting ? (
							<LoaderCircle className={styles.spinner} aria-hidden="true" />
						) : (
							<ShieldCheck aria-hidden="true" />
						)}
						Update status
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
