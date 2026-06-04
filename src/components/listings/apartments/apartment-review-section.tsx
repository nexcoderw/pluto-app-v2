import { useMemo, useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CarReviewCard } from "@/components/listings/cars/reviews/car-review-card";
import { CarReviewForm } from "@/components/listings/cars/reviews/car-review-form";
import { CarReviewOverview } from "@/components/listings/cars/reviews/car-review-overview";
import { CarReviewsDialog } from "@/components/listings/cars/reviews/car-reviews-dialog";
import type { UserAuthProfile } from "@/services/api/auth";
import {
	getListingReviews,
	getListingReviewSummary,
	type ListingReview,
} from "@/services/api/listing-reviews";
import type { PublicListing } from "@/services/api/listings";
import {
	getCachedUserProfile,
	hasKnownUserSession,
	subscribeToUserSession,
} from "@/services/api/token-store";
import styles from "@/components/listings/cars/reviews/car-review-section.module.css";

const reviewsQueryKey = (listingId: string) =>
	["apartment-listing-reviews", listingId] as const;
const summaryQueryKey = (listingId: string) =>
	["apartment-listing-review-summary", listingId] as const;

export function ApartmentReviewSection({
	listing,
}: {
	listing: PublicListing;
}) {
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
		<section
			className={styles.section}
			aria-labelledby="apartment-reviews-title"
		>
			{reviewsQuery.isError || summaryQuery.isError ? (
				<div className={styles.sectionHeader}>
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
				</div>
			) : null}

			<CarReviewOverview
				summary={summaryQuery.data}
				isLoading={summaryQuery.isPending}
				fallbackRating={listing.ratingAverage}
				fallbackCount={listing.ratingCount}
				title="What guests say about this apartment"
				titleId="apartment-reviews-title"
			/>

			{canReview ? (
				<CarReviewForm
					key={myReview?.id ?? "new-apartment-review"}
					listingId={listing.id}
					existingReview={myReview}
					reviewPlaceholder="Tell future guests what stood out about this apartment, check-in, communication, location, and value."
					onSaved={refreshReviews}
				/>
			) : null}

			{reviewsQuery.isPending ? (
				<ApartmentReviewSkeleton />
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
					<h3>No apartment reviews yet</h3>
					<p>
						Reviews from verified customers will appear here after they share
						their stay.
					</p>
				</div>
			)}

			<CarReviewsDialog
				key={reviewsDialogKey}
				listingId={listing.id}
				focusedReviewId={focusedReviewId}
				summary={summaryQuery.data}
				isSummaryLoading={summaryQuery.isPending}
				fallbackRating={listing.ratingAverage}
				fallbackCount={listing.ratingCount}
				overviewTitle="What guests say about this apartment"
				overviewTitleId="apartment-reviews-dialog-overview"
				open={isReviewsDialogOpen}
				onOpenChange={setIsReviewsDialogOpen}
			/>
		</section>
	);
}

function ApartmentReviewSkeleton() {
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
