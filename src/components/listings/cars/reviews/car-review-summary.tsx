import {
	CheckCircle2,
	KeyRound,
	Map,
	MessageSquare,
	Sparkles,
	SprayCan,
	Tag,
} from "lucide-react";
import type { ListingReviewSummary } from "@/services/api/listing-reviews";
import styles from "./car-review-section.module.css";

const categories = [
	{
		key: "cleanlinessRating",
		label: "Cleanliness",
		icon: SprayCan,
	},
	{
		key: "accuracyRating",
		label: "Accuracy",
		icon: CheckCircle2,
	},
	{
		key: "checkInRating",
		label: "Check-in",
		icon: KeyRound,
	},
	{
		key: "communicationRating",
		label: "Communication",
		icon: MessageSquare,
	},
	{
		key: "locationRating",
		label: "Location",
		icon: Map,
	},
	{
		key: "valueRating",
		label: "Value",
		icon: Tag,
	},
] as const;

export function CarReviewSummary({
	summary,
	isLoading,
	fallbackRating,
	fallbackCount,
}: {
	summary?: ListingReviewSummary;
	isLoading: boolean;
	fallbackRating?: number | null;
	fallbackCount?: number;
}) {
	const reviewCount = summary?.total ?? fallbackCount ?? 0;
	const overallRating = summary?.overallRating ?? fallbackRating ?? null;
	const displayRating = overallRating ? overallRating.toFixed(1) : "New";

	return (
		<div className={styles.summary}>
			<div className={styles.ratingHero}>
				<span className={styles.laurel} aria-hidden="true" />
				<strong>{isLoading ? "..." : displayRating}</strong>
				<span className={styles.laurel} aria-hidden="true" />
				<p>{reviewCount > 0 ? "Guest favorite" : "Awaiting first review"}</p>
				<small>
					{reviewCount > 0
						? `Based on ${reviewCount} verified customer review${
								reviewCount === 1 ? "" : "s"
							}.`
						: "Customer review scores will appear here after the first review."}
				</small>
			</div>

			<div className={styles.ratingBreakdown}>
				<div className={styles.overallBars}>
					<span>Overall rating</span>
					{[5, 4, 3, 2, 1].map((score) => (
						<div key={score}>
							<small>{score}</small>
							<i
								data-active={Boolean(overallRating && overallRating >= score)}
							/>
						</div>
					))}
				</div>

				{categories.map((category) => {
					const Icon = category.icon;
					const value = summary?.[category.key] ?? null;

					return (
						<div key={category.key} className={styles.categoryScore}>
							<span>{category.label}</span>
							<strong>{value ? value.toFixed(1) : "New"}</strong>
							<Icon aria-hidden="true" />
						</div>
					);
				})}
			</div>

			<div className={styles.reviewTags} aria-label="Review highlights">
				<span>
					<Sparkles aria-hidden="true" />
					Experience
				</span>
				<span>
					<CheckCircle2 aria-hidden="true" />
					Accuracy
				</span>
				<span>
					<SprayCan aria-hidden="true" />
					Cleanliness
				</span>
				<span>
					<Map aria-hidden="true" />
					Location
				</span>
			</div>
		</div>
	);
}
