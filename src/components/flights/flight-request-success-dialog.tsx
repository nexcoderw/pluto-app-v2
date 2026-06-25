"use client";

import { ArrowRight, CheckCircle2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import styles from "./flight-request-success-dialog.module.css";

type FlightRequestSuccessDialogProps = {
	open: boolean;
	message: string;
	requestNo: string | null;
	onClose: () => void;
};

export function FlightRequestSuccessDialog({
	open,
	message,
	requestNo,
	onClose,
}: FlightRequestSuccessDialogProps) {
	return (
		<Dialog open={open}>
			<DialogContent
				className={styles.dialog}
				showCloseButton={false}
				aria-describedby="flight-request-success-description"
			>
				<div className={styles.iconShell}>
					<CheckCircle2 aria-hidden="true" />
				</div>

				<DialogHeader className={styles.header}>
					<span className={styles.eyebrow}>
						<MailCheck aria-hidden="true" />
						Request received
					</span>
					<DialogTitle>Your flight request is in review.</DialogTitle>
					<DialogDescription id="flight-request-success-description">
						{message ||
							"We received your flight request and emailed you a confirmation."}
					</DialogDescription>
				</DialogHeader>

				{requestNo ? (
					<div className={styles.reference}>
						<span>Reference number</span>
						<strong>{requestNo}</strong>
					</div>
				) : null}

				<DialogFooter className={styles.footer}>
					<Button type="button" className={styles.action} onClick={onClose}>
						View my flight requests
						<ArrowRight aria-hidden="true" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
