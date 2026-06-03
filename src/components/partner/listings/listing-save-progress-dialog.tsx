"use client";

import {
	AlertTriangle,
	BadgeCheck,
	CheckCircle2,
	CloudUpload,
	Database,
	FileImage,
	LoaderCircle,
	ShieldCheck,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import styles from "./listing-save-progress-dialog.module.css";

export type ListingSaveProgressPhase =
	| "preparing"
	| "saving"
	| "uploading"
	| "finalizing"
	| "success"
	| "error";

export type ListingSaveProgressState = {
	phase: ListingSaveProgressPhase;
	progress: number;
	mediaCompleted: number;
	mediaTotal: number;
	message?: string;
};

type ListingSaveProgressDialogProps = ListingSaveProgressState & {
	open: boolean;
	mode: "create" | "edit";
};

const phaseCopy: Record<
	ListingSaveProgressPhase,
	{ title: string; description: string }
> = {
	preparing: {
		title: "Preparing listing",
		description: "Checking the form data before opening the secure workflow.",
	},
	saving: {
		title: "Saving listing details",
		description:
			"Storing the listing story, category details, pricing, and review data.",
	},
	uploading: {
		title: "Uploading listing media",
		description:
			"Sending images directly to Cloudinary and attaching their URLs.",
	},
	finalizing: {
		title: "Finalizing review package",
		description:
			"Refreshing listing records so your workspace opens with the latest data.",
	},
	success: {
		title: "Listing saved",
		description: "Everything is stored and ready for the review workflow.",
	},
	error: {
		title: "Save did not finish",
		description:
			"The workflow stopped before all data could be safely completed.",
	},
};

const saveSteps = [
	{
		phase: "preparing",
		label: "Prepare",
		description: "Form validation",
		icon: ShieldCheck,
	},
	{
		phase: "saving",
		label: "Store",
		description: "Listing record",
		icon: Database,
	},
	{
		phase: "uploading",
		label: "Media",
		description: "Cloudinary URLs",
		icon: FileImage,
	},
	{
		phase: "finalizing",
		label: "Finish",
		description: "Workspace refresh",
		icon: BadgeCheck,
	},
] as const;

export function ListingSaveProgressDialog({
	open,
	mode,
	phase,
	progress,
	mediaCompleted,
	mediaTotal,
	message,
}: ListingSaveProgressDialogProps) {
	const copy = phaseCopy[phase];
	const normalizedProgress = Math.min(Math.max(Math.round(progress), 0), 100);
	const statusLabel =
		phase === "error"
			? "Needs attention"
			: phase === "success"
				? "Complete"
				: mode === "edit"
					? "Saving changes"
					: "Creating listing";

	return (
		<Dialog open={open}>
			<DialogContent
				className={styles.dialog}
				showCloseButton={false}
				aria-describedby="listing-save-progress-description"
			>
				<div className={styles.orbit} aria-hidden="true">
					<span />
					<span />
					<span />
				</div>

				<DialogHeader className={styles.header}>
					<div
						className={styles.statusMark}
						data-phase={phase}
						aria-hidden="true"
					>
						{phase === "error" ? (
							<AlertTriangle />
						) : phase === "success" ? (
							<CheckCircle2 />
						) : (
							<LoaderCircle />
						)}
					</div>
					<div className={styles.headerCopy}>
						<span>{statusLabel}</span>
						<DialogTitle>{copy.title}</DialogTitle>
						<DialogDescription id="listing-save-progress-description">
							{message ?? copy.description}
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className={styles.progressPanel}>
					<div className={styles.progressTop}>
						<span>Progress</span>
						<strong>{normalizedProgress}%</strong>
					</div>
					<div
						className={styles.progressTrack}
						role="progressbar"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={normalizedProgress}
						aria-label="Listing save progress"
					>
						<span style={{ width: `${normalizedProgress}%` }} />
					</div>
				</div>

				<div className={styles.stepRail} aria-label="Listing save steps">
					{saveSteps.map((step) => {
						const StepIcon = step.icon;
						const status = getStepStatus(step.phase, phase);

						return (
							<div
								key={step.phase}
								className={styles.stepItem}
								data-status={status}
							>
								<span className={styles.stepIcon} aria-hidden="true">
									{status === "complete" ? <CheckCircle2 /> : <StepIcon />}
								</span>
								<div>
									<strong>{step.label}</strong>
									<small>{step.description}</small>
								</div>
							</div>
						);
					})}
				</div>

				<div className={styles.mediaStrip} data-active={phase === "uploading"}>
					<CloudUpload aria-hidden="true" />
					<div>
						<strong>
							{mediaTotal > 0
								? `${mediaCompleted} of ${mediaTotal} images attached`
								: "No new images selected"}
						</strong>
						<small>
							Images upload directly to Cloudinary, then Pluto Booking stores
							the secure URLs.
						</small>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function getStepStatus(
	stepPhase: (typeof saveSteps)[number]["phase"],
	currentPhase: ListingSaveProgressPhase,
) {
	const stepIndex = saveSteps.findIndex((step) => step.phase === stepPhase);
	const currentIndex = saveSteps.findIndex(
		(step) => step.phase === currentPhase,
	);

	if (currentPhase === "success") {
		return "complete";
	}

	if (currentPhase === "error") {
		return stepIndex < 2 ? "complete" : "pending";
	}

	if (stepIndex < currentIndex) {
		return "complete";
	}

	if (stepIndex === currentIndex) {
		return "active";
	}

	return "pending";
}
