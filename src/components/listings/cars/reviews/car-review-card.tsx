import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";
import type { CSSProperties } from "react";
import type { ListingReview } from "@/services/api/listing-reviews";
import styles from "./car-review-section.module.css";

export function CarReviewCard({ review }: { review: ListingReview }) {
	const authorInitials = getInitials(review.author.fullName);
	const avatarStyle =
		review.author.imageKey && review.author.imageKey.startsWith("http")
			? ({
					"--reviewer-avatar-image": `url("${review.author.imageKey}")`,
				} as CSSProperties)
			: undefined;

	return (
		<article className={styles.reviewCard}>
			<header className={styles.reviewCardHeader}>
				<span
					className={styles.reviewerAvatar}
					data-has-image={Boolean(avatarStyle)}
					style={avatarStyle}
					aria-hidden="true"
				>
					{avatarStyle ? null : authorInitials}
				</span>
				<div>
					<strong>{review.author.fullName}</strong>
					<span>
						{formatDistanceToNow(new Date(review.createdAt), {
							addSuffix: true,
						})}
					</span>
				</div>
			</header>
			<div
				className={styles.reviewStars}
				aria-label={`${review.overallRating} out of 5`}
			>
				{Array.from({ length: 5 }, (_, index) => (
					<Star
						key={index}
						aria-hidden="true"
						data-filled={index < Math.round(review.overallRating)}
					/>
				))}
				<span>{review.overallRating.toFixed(1)}</span>
			</div>
			<p>
				{review.message?.trim() ||
					"This customer submitted category ratings without a written message."}
			</p>
		</article>
	);
}

function getInitials(value: string) {
	const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
