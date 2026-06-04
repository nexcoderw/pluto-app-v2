import { useMemo, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError } from "@/services/api/errors";
import {
	createListingReview,
	type ListingReview,
	type ListingReviewPayload,
	updateMyListingReview,
} from "@/services/api/listing-reviews";
import styles from "./car-review-section.module.css";

const ratingFields = [
	{ key: "cleanlinessRating", label: "Cleanliness" },
	{ key: "accuracyRating", label: "Accuracy" },
	{ key: "checkInRating", label: "Check-in" },
	{ key: "communicationRating", label: "Communication" },
	{ key: "locationRating", label: "Location" },
	{ key: "valueRating", label: "Value" },
] as const;

const defaultRatings: ListingReviewPayload = {
	cleanlinessRating: 5,
	accuracyRating: 5,
	checkInRating: 5,
	communicationRating: 5,
	locationRating: 5,
	valueRating: 5,
	message: "",
};

export function CarReviewForm({
	listingId,
	existingReview,
	onSaved,
	reviewPlaceholder = "Tell future guests what stood out about this car, pickup, communication, and value.",
}: {
	listingId: string;
	existingReview?: ListingReview;
	onSaved: () => Promise<void>;
	reviewPlaceholder?: string;
}) {
	const [form, setForm] = useState<ListingReviewPayload>(() =>
		initialForm(existingReview),
	);
	const [inlineError, setInlineError] = useState<string | null>(null);
	const isEditing = Boolean(existingReview);
	const overallRating = useMemo(() => calculateOverall(form), [form]);
	const mutation = useMutation({
		mutationFn: async () => {
			const payload = cleanPayload(form);

			return isEditing
				? updateMyListingReview(listingId, payload)
				: createListingReview(listingId, payload);
		},
		onSuccess: async () => {
			setInlineError(null);
			toast.success(isEditing ? "Review updated." : "Review submitted.", {
				description: "Your review is now reflected in this listing.",
			});
			await onSaved();
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: "Your review could not be saved. Please try again.";

			setInlineError(message);
			toast.error("Review was not saved", { description: message });
		},
	});

	function updateRating(
		key: Exclude<keyof ListingReviewPayload, "message">,
		value: number,
	) {
		setInlineError(null);
		setForm((current) => ({ ...current, [key]: value }));
	}

	function submitReview(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!hasValidRatings(form)) {
			setInlineError("Please rate every category before submitting.");
			return;
		}

		mutation.mutate();
	}

	return (
		<form className={styles.reviewForm} onSubmit={submitReview}>
			<div className={styles.reviewFormHeader}>
				<div>
					<h3>{isEditing ? "Update your review" : "Share your experience"}</h3>
					<p>
						Rate the important parts of the booking. Pluto Booking calculates
						the overall score from these categories.
					</p>
				</div>
				<div className={styles.liveRating}>
					<strong>{overallRating.toFixed(1)}</strong>
					<span>Overall</span>
				</div>
			</div>

			<div className={styles.ratingFields}>
				{ratingFields.map((field) => (
					<fieldset key={field.key}>
						<legend>{field.label}</legend>
						<div className={styles.ratingButtons}>
							{[1, 2, 3, 4, 5].map((value) => (
								<button
									key={value}
									type="button"
									data-active={Number(form[field.key]) >= value}
									aria-label={`${field.label} ${value} out of 5`}
									onClick={() => updateRating(field.key, value)}
								>
									<Star aria-hidden="true" />
								</button>
							))}
						</div>
					</fieldset>
				))}
			</div>

			<label className={styles.messageField}>
				<span>Review message</span>
				<Textarea
					value={form.message ?? ""}
					maxLength={1500}
					placeholder={reviewPlaceholder}
					onChange={(event) =>
						setForm((current) => ({
							...current,
							message: event.target.value,
						}))
					}
				/>
			</label>

			<div className={styles.reviewFormFooter}>
				{inlineError ? <p role="alert">{inlineError}</p> : <span />}
				<Button
					type="submit"
					className={styles.submitReviewButton}
					disabled={mutation.isPending}
				>
					{mutation.isPending ? (
						<Loader2 className={styles.spinIcon} aria-hidden="true" />
					) : (
						<Send aria-hidden="true" />
					)}
					{mutation.isPending
						? "Saving"
						: isEditing
							? "Update review"
							: "Submit review"}
				</Button>
			</div>
		</form>
	);
}

function initialForm(existingReview?: ListingReview): ListingReviewPayload {
	if (!existingReview) {
		return { ...defaultRatings };
	}

	return {
		cleanlinessRating: existingReview.cleanlinessRating,
		accuracyRating: existingReview.accuracyRating,
		checkInRating: existingReview.checkInRating,
		communicationRating: existingReview.communicationRating,
		locationRating: existingReview.locationRating,
		valueRating: existingReview.valueRating,
		message: existingReview.message ?? "",
	};
}

function calculateOverall(input: ListingReviewPayload): number {
	const scores = ratingFields.map((field) => Number(input[field.key]));

	return (
		Math.round(
			(scores.reduce((total, value) => total + value, 0) / scores.length) * 100,
		) / 100
	);
}

function hasValidRatings(input: ListingReviewPayload): boolean {
	return ratingFields.every((field) => {
		const value = Number(input[field.key]);

		return Number.isInteger(value) && value >= 1 && value <= 5;
	});
}

function cleanPayload(input: ListingReviewPayload): ListingReviewPayload {
	const message = input.message?.trim();

	return {
		...input,
		message: message || undefined,
	};
}
