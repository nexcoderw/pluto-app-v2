"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	RefreshCcw,
	SlidersHorizontal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getListingReviews,
	type ListingReview,
	type ListingReviewSummary,
	type ProductReviewOrderBy,
	type ProductReviewSortOrder,
} from "@/services/api/listing-reviews";
import { CarReviewCard } from "./car-review-card";
import { CarReviewOverview } from "./car-review-overview";
import styles from "./car-review-section.module.css";

type ReviewSortValue = "newest" | "oldest" | "highest-rated" | "lowest-rated";

type ReviewSortOption = {
	value: ReviewSortValue;
	label: string;
	orderBy: ProductReviewOrderBy;
	order: ProductReviewSortOrder;
};

const REVIEW_DIALOG_LIMIT = 8;

const reviewSortOptions: ReviewSortOption[] = [
	{
		value: "newest",
		label: "Most recent",
		orderBy: "createdAt",
		order: "desc",
	},
	{
		value: "oldest",
		label: "Oldest first",
		orderBy: "createdAt",
		order: "asc",
	},
	{
		value: "highest-rated",
		label: "Highest stars",
		orderBy: "overallRating",
		order: "desc",
	},
	{
		value: "lowest-rated",
		label: "Lowest stars",
		orderBy: "overallRating",
		order: "asc",
	},
];

export function CarReviewsDialog({
	listingId,
	focusedReviewId,
	summary,
	isSummaryLoading,
	fallbackRating,
	fallbackCount,
	open,
	onOpenChange,
}: {
	listingId: string;
	focusedReviewId?: string;
	summary?: ListingReviewSummary;
	isSummaryLoading: boolean;
	fallbackRating?: number | null;
	fallbackCount?: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [page, setPage] = useState(1);
	const [sortValue, setSortValue] = useState<ReviewSortValue>("newest");
	const reviewRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const selectedSort = useMemo(
		() =>
			reviewSortOptions.find((option) => option.value === sortValue) ??
			reviewSortOptions[0],
		[sortValue],
	);
	const reviewsQuery = useQuery({
		queryKey: [
			"listing-reviews-dialog",
			listingId,
			page,
			selectedSort.orderBy,
			selectedSort.order,
		],
		queryFn: () =>
			getListingReviews(listingId, {
				page,
				limit: REVIEW_DIALOG_LIMIT,
				orderBy: selectedSort.orderBy,
				order: selectedSort.order,
			}),
		enabled: open,
	});
	const reviews = useMemo(
		() => reviewsQuery.data?.items ?? [],
		[reviewsQuery.data?.items],
	);
	const meta = reviewsQuery.data?.meta;

	useEffect(() => {
		if (!open || reviewsQuery.isPending || !focusedReviewId) {
			return;
		}

		const focusedReview = reviewRefs.current[focusedReviewId];

		if (!focusedReview) {
			return;
		}

		focusedReview.scrollIntoView({ block: "center", behavior: "smooth" });
		focusedReview.focus({ preventScroll: true });
	}, [focusedReviewId, open, reviewsQuery.isPending, reviews]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.reviewsDialog}>
				<CarReviewOverview
					summary={summary}
					isLoading={isSummaryLoading}
					fallbackRating={fallbackRating}
					fallbackCount={fallbackCount}
					titleId="car-reviews-dialog-overview"
				/>

				<DialogHeader className={styles.reviewsDialogHeader}>
					<div>
						<DialogTitle>Browse full reviews</DialogTitle>
						<DialogDescription>
							Read full customer messages and sort reviews by recency or star
							rating.
						</DialogDescription>
					</div>
					<Select
						value={sortValue}
						onValueChange={(value) => {
							setSortValue(value as ReviewSortValue);
							setPage(1);
						}}
					>
						<SelectTrigger className={styles.reviewSortTrigger}>
							<SelectValue>
								{
									reviewSortOptions.find((option) => option.value === sortValue)
										?.label
								}
							</SelectValue>
						</SelectTrigger>
						<SelectContent align="end" alignItemWithTrigger={false}>
							{reviewSortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</DialogHeader>

				{reviewsQuery.isPending ? (
					<div className={styles.dialogReviewList}>
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className={styles.dialogReviewSkeleton}>
								<Skeleton className={styles.skeletonAvatar} />
								<Skeleton className={styles.skeletonLine} />
								<Skeleton className={styles.skeletonText} />
								<Skeleton className={styles.skeletonText} />
							</div>
						))}
					</div>
				) : reviewsQuery.isError ? (
					<div className={styles.dialogState}>
						<RefreshCcw aria-hidden="true" />
						<h3>Reviews could not load</h3>
						<p>Refresh this dialog before changing the review filters.</p>
						<Button
							type="button"
							variant="outline"
							onClick={() => reviewsQuery.refetch()}
						>
							<RefreshCcw aria-hidden="true" />
							Retry
						</Button>
					</div>
				) : (
					<>
						<div className={styles.dialogReviewList}>
							{reviews.map((review: ListingReview) => (
								<div
									key={review.id}
									ref={(node) => {
										reviewRefs.current[review.id] = node;
									}}
									tabIndex={-1}
									className={styles.dialogReviewItem}
									data-focused={review.id === focusedReviewId}
								>
									<CarReviewCard review={review} fullMessage />
								</div>
							))}
						</div>
						{meta && meta.total > meta.limit ? (
							<div className={styles.reviewPagination}>
								<Button
									type="button"
									variant="outline"
									disabled={!meta.hasPreviousPage}
									onClick={() => setPage((current) => Math.max(1, current - 1))}
								>
									<ArrowLeft aria-hidden="true" />
									Previous
								</Button>
								<span>
									Page {meta.page} of {meta.totalPages}
								</span>
								<Button
									type="button"
									variant="outline"
									disabled={!meta.hasNextPage}
									onClick={() =>
										setPage((current) => Math.min(meta.totalPages, current + 1))
									}
								>
									Next
									<ArrowRight aria-hidden="true" />
								</Button>
							</div>
						) : null}
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
