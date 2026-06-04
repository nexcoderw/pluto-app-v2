export type ProductReviewOrderBy = "createdAt" | "overallRating";
export type ProductReviewSortOrder = "asc" | "desc";

export type ListingReviewsRequest = {
	page?: number;
	limit?: number;
	orderBy?: ProductReviewOrderBy;
	order?: ProductReviewSortOrder;
};

export type ListingReviewAuthor = {
	id: string;
	fullName: string;
	imageKey: string | null;
};

export type ListingReview = {
	id: string;
	productId: string;
	authorId: string;
	rating: number;
	overallRating: number;
	cleanlinessRating: number;
	accuracyRating: number;
	checkInRating: number;
	communicationRating: number;
	locationRating: number;
	valueRating: number;
	message: string | null;
	status: "PENDING" | "APPROVED" | "REJECTED";
	createdAt: string;
	updatedAt: string;
	author: ListingReviewAuthor;
};

export type ListingReviewsResponse = {
	items: ListingReview[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		orderBy: ProductReviewOrderBy;
		order: ProductReviewSortOrder;
	};
};

export type ListingReviewSummary = {
	total: number;
	overallRating: number | null;
	cleanlinessRating: number | null;
	accuracyRating: number | null;
	checkInRating: number | null;
	communicationRating: number | null;
	locationRating: number | null;
	valueRating: number | null;
};

export type ListingReviewPayload = {
	cleanlinessRating: number;
	accuracyRating: number;
	checkInRating: number;
	communicationRating: number;
	locationRating: number;
	valueRating: number;
	message?: string;
};
