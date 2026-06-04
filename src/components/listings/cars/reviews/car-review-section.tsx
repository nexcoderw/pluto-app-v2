import { useMemo, useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, RefreshCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserAuthProfile } from "@/services/api/auth";
import {
	getCachedUserProfile,
	hasKnownUserSession,
	subscribeToUserSession,
} from "@/services/api/token-store";
import {
	getListingReviews,
	getListingReviewSummary,
	type ListingReview,
} from "@/services/api/listing-reviews";
import type { PublicListing } from "@/services/api/listings";
import { CarReviewCard } from "./car-review-card";
import { CarReviewForm } from "./car-review-form";
import { CarReviewSummary } from "./car-review-summary";
import { CarReviewsDialog } from "./car-reviews-dialog";
import styles from "./car-review-section.module.css";

const reviewsQueryKey = (listingId: string) =>
	["listing-reviews", listingId] as const;
const summaryQueryKey = (listingId: string) =>
	["listing-review-summary", listingId] as const;

export function CarReviewSection({ listing }: { listing: PublicListing }) {
	const queryClient = useQueryClient();
	const [focusedReviewId, setFocusedReviewId] = useState<string>();
	const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false);
	const [reviewsDialogKey, setReviewsDialogKey] = useState(0);
	const currentUser = useSyncExternalStore(
		(onStoreChange) => subscribeToUserSession(() => onStoreChange()),
		getUserSessionSnapshot,
		() => null,
	);
	const summaryQuery = useQuery({
		queryKey: summaryQueryKey(listing.id),
		queryFn: () => getListingReviewSummary(listing.id),
	});
	const reviewsQuery = useQuery({
		queryKey: reviewsQueryKey(listing.id),
		queryFn: () =>
			getListingReviews(listing.id, {
				page: 1,
				limit: 6,
				orderBy: "createdAt",
				order: "desc",
			}),
	});
	const reviews = useMemo(
		() => reviewsQuery.data?.items ?? [],
		[reviewsQuery.data?.items],
	);
	const myReview = useMemo(
		() =>
			currentUser
				? reviews.find((review) => review.authorId === currentUser.id)
				: undefined,
		[reviews, currentUser],
	);
	const canReview = currentUser?.role === "CUSTOMER";

	async function refreshReviews() {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: summaryQueryKey(listing.id) }),
			queryClient.invalidateQueries({ queryKey: reviewsQueryKey(listing.id) }),
		]);
	}

	return (
		<section className={styles.section} aria-labelledby="car-reviews-title">
			<div className={styles.sectionHeader}>
				<div>
					<span>
						<Star aria-hidden="true" />
						Customer reviews
					</span>
					<h2 id="car-reviews-title">What guests say about this car</h2>
				</div>
				{reviewsQuery.isError || summaryQuery.isError ? (
					<Button
						type="button"
						variant="outline"
						className={styles.retryButton}
						onClick={() => {
							void reviewsQuery.refetch();
							void summaryQuery.refetch();
						}}
					>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
				) : null}
			</div>

			<CarReviewSummary
				summary={summaryQuery.data}
				isLoading={summaryQuery.isPending}
				fallbackRating={listing.ratingAverage}
				fallbackCount={listing.ratingCount}
			/>

			{canReview ? (
				<CarReviewForm
					key={myReview?.id ?? "new-review"}
					listingId={listing.id}
					existingReview={myReview}
					onSaved={refreshReviews}
				/>
			) : null}

			{reviewsQuery.isPending ? (
				<CarReviewSkeleton />
			) : reviews.length > 0 ? (
				<div className={styles.reviewList}>
					{reviews.map((review: ListingReview) => (
						<CarReviewCard
							key={review.id}
							review={review}
							onShowMore={(selectedReview) => {
								setFocusedReviewId(selectedReview.id);
								setReviewsDialogKey((current) => current + 1);
								setIsReviewsDialogOpen(true);
							}}
						/>
					))}
				</div>
			) : (
				<div className={styles.emptyReviews}>
					<MessageCircle aria-hidden="true" />
					<h3>No customer reviews yet</h3>
					<p>
						Reviews from verified customers will appear here after they share
						their experience.
					</p>
				</div>
			)}

			<CarReviewsDialog
				key={reviewsDialogKey}
				listingId={listing.id}
				focusedReviewId={focusedReviewId}
				open={isReviewsDialogOpen}
				onOpenChange={setIsReviewsDialogOpen}
			/>
		</section>
	);
}

function CarReviewSkeleton() {
	return (
		<div className={styles.reviewList}>
			{Array.from({ length: 4 }, (_, index) => (
				<div key={index} className={styles.reviewSkeleton}>
					<Skeleton className={styles.skeletonAvatar} />
					<Skeleton className={styles.skeletonLine} />
					<Skeleton className={styles.skeletonText} />
					<Skeleton className={styles.skeletonText} />
				</div>
			))}
		</div>
	);
}

function getUserSessionSnapshot(): UserAuthProfile | null {
	return hasKnownUserSession() ? getCachedUserProfile() : null;
}
