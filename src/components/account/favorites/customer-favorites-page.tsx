"use client";

import { FormEvent, useMemo, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	RefreshCcw,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CustomerPortalLoading } from "@/components/account/customer-portal-loading";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import { ApiRequestError } from "@/services/api/errors";
import {
	listFavoriteListings,
	removeFavoriteListing,
	type FavoriteListingSummary,
	type FavoriteListingsOrderBy,
	type FavoriteListingsSortOrder,
} from "@/services/api/favorites";
import { FAVORITE_LISTING_IDS_QUERY_KEY } from "@/components/listings/use-listing-favorite";
import {
	FavoriteListingCard,
	FavoriteListingEmptyCard,
} from "./favorite-listing-card";
import { FavoriteRemoveDialog } from "./favorite-remove-dialog";
import styles from "./customer-favorites-page.module.css";

const FAVORITES_LIMIT = 9;
const FAVORITES_QUERY_KEY = ["customer-favorite-listings"] as const;

const sortOptions: Array<{
	label: string;
	value: FavoriteListingsOrderBy;
}> = [
	{ label: "Saved date", value: "createdAt" },
	{ label: "Listing title", value: "title" },
	{ label: "Price", value: "basePrice" },
];

const orderOptions: Array<{
	label: string;
	value: FavoriteListingsSortOrder;
}> = [
	{ label: "Descending", value: "desc" },
	{ label: "Ascending", value: "asc" },
];

export function CustomerFavoritesPage() {
	return (
		<PortalAccessBoundary
			allowedRole="CUSTOMER"
			loadingFallback={
				<CustomerPortalLoading
					title="Opening favorites"
					description="Checking your customer session before loading saved listings."
				/>
			}
		>
			{(user) => (
				<CustomerPortalShell user={user}>
					<CustomerFavoritesContent />
				</CustomerPortalShell>
			)}
		</PortalAccessBoundary>
	);
}

function CustomerFavoritesContent() {
	const queryClient = useQueryClient();
	const [draftSearch, setDraftSearch] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [orderBy, setOrderBy] = useState<FavoriteListingsOrderBy>("createdAt");
	const [order, setOrder] = useState<FavoriteListingsSortOrder>("desc");
	const [selectedFavorite, setSelectedFavorite] =
		useState<FavoriteListingSummary | null>(null);
	const favoritesQuery = useQuery({
		queryKey: [
			...FAVORITES_QUERY_KEY,
			{ page, search, orderBy, order, limit: FAVORITES_LIMIT },
		],
		queryFn: () =>
			listFavoriteListings({
				page,
				limit: FAVORITES_LIMIT,
				search: search || undefined,
				sortBy: orderBy,
				sortOrder: order,
			}),
		staleTime: 30_000,
	});
	const removeMutation = useMutation({
		mutationFn: (productId: string) => removeFavoriteListing(productId),
		onSuccess: (response) => {
			toast.success(response.message, {
				description: "Your favorites list has been updated.",
			});
			setSelectedFavorite(null);
			void queryClient.invalidateQueries({
				queryKey: FAVORITES_QUERY_KEY,
			});
			void queryClient.invalidateQueries({
				queryKey: FAVORITE_LISTING_IDS_QUERY_KEY,
			});

			if ((favoritesQuery.data?.items.length ?? 0) <= 1 && page > 1) {
				setPage((currentPage) => Math.max(1, currentPage - 1));
			}
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: "Favorite could not be removed. Please try again.";

			toast.error("Favorite was not removed", {
				description: message,
			});
		},
	});
	const favorites = favoritesQuery.data?.items ?? [];
	const meta = favoritesQuery.data?.meta;
	const totalPages = meta?.totalPages ?? 1;
	const pageNumbers = useMemo(
		() => getPaginationItems(page, totalPages),
		[page, totalPages],
	);

	function handleSearch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSearch(draftSearch.trim());
		setPage(1);
	}

	function resetFilters() {
		setDraftSearch("");
		setSearch("");
		setOrderBy("createdAt");
		setOrder("desc");
		setPage(1);
	}

	function confirmRemoveFavorite() {
		if (!selectedFavorite || removeMutation.isPending) {
			return;
		}

		removeMutation.mutate(selectedFavorite.productId);
	}

	return (
		<>
			<section className={styles.page} aria-labelledby="customer-favorites">
				<header className={styles.header}>
					<div>
						<span>
							<SlidersHorizontal aria-hidden="true" />
							Saved inventory
						</span>
						<h1 id="customer-favorites">Favorite listings</h1>
						<p>
							Compare saved places and rentals before booking. Removing a
							favorite only clears it from your personal list.
						</p>
					</div>
					<strong>{meta?.total ?? 0} saved</strong>
				</header>

				<form className={styles.toolbar} onSubmit={handleSearch}>
					<Input
						type="search"
						value={draftSearch}
						icon={<Search aria-hidden="true" />}
						placeholder="Search by title, city, country..."
						shellClassName={styles.searchInput}
						onChange={(event) => setDraftSearch(event.target.value)}
					/>

					<div className={styles.controls}>
						<label>
							<span>Sort</span>
							<Select
								value={orderBy}
								onValueChange={(value) => {
									setOrderBy(value as FavoriteListingsOrderBy);
									setPage(1);
								}}
							>
								<SelectTrigger className={styles.selectTrigger}>
									<SelectValue>
										{sortOptions.find((option) => option.value === orderBy)
											?.label ?? "Sort"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent align="start" alignItemWithTrigger={false}>
									<SelectGroup>
										{sortOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</label>
						<label>
							<span>Order</span>
							<Select
								value={order}
								onValueChange={(value) => {
									setOrder(value as FavoriteListingsSortOrder);
									setPage(1);
								}}
							>
								<SelectTrigger className={styles.selectTrigger}>
									<SelectValue>
										{orderOptions.find((option) => option.value === order)
											?.label ?? "Order"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent align="start" alignItemWithTrigger={false}>
									<SelectGroup>
										{orderOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</label>
						<Button type="submit" className={styles.filterButton}>
							<Search aria-hidden="true" />
							Search
						</Button>
						<Button
							type="button"
							variant="outline"
							className={styles.resetButton}
							onClick={resetFilters}
						>
							<RefreshCcw aria-hidden="true" />
							Reset
						</Button>
					</div>
				</form>

				{favoritesQuery.isPending ? (
					<CustomerPortalLoading
						variant="panel"
						title="Loading favorites"
						description="Fetching the listings you saved for later comparison."
					/>
				) : favoritesQuery.isError ? (
					<section className={styles.state}>
						<RefreshCcw aria-hidden="true" />
						<h2>Favorites could not load</h2>
						<p>
							Refresh this page section to retrieve your latest saved listings.
						</p>
						<Button
							type="button"
							className={styles.filterButton}
							onClick={() => void favoritesQuery.refetch()}
						>
							<RefreshCcw aria-hidden="true" />
							Retry
						</Button>
					</section>
				) : favorites.length ? (
					<>
						<div className={styles.grid}>
							{favorites.map((favorite) => (
								<FavoriteListingCard
									key={favorite.id}
									favorite={favorite}
									onRemove={setSelectedFavorite}
								/>
							))}
						</div>

						{totalPages > 1 ? (
							<nav
								className={styles.pagination}
								aria-label="Favorite listings pages"
							>
								<Button
									type="button"
									variant="outline"
									className={styles.paginationArrow}
									disabled={!meta?.hasPreviousPage}
									onClick={() =>
										setPage((currentPage) => Math.max(1, currentPage - 1))
									}
								>
									<ArrowLeft aria-hidden="true" />
									Previous
								</Button>
								<div className={styles.pageNumbers}>
									{pageNumbers.map((pageNumber, index) =>
										pageNumber === "ellipsis" ? (
											<span key={`ellipsis-${index}`}>...</span>
										) : (
											<button
												key={pageNumber}
												type="button"
												data-active={pageNumber === page}
												onClick={() => setPage(pageNumber)}
											>
												{pageNumber}
											</button>
										),
									)}
								</div>
								<Button
									type="button"
									variant="outline"
									className={styles.paginationArrow}
									disabled={!meta?.hasNextPage}
									onClick={() =>
										setPage((currentPage) =>
											Math.min(totalPages, currentPage + 1),
										)
									}
								>
									Next
									<ArrowRight aria-hidden="true" />
								</Button>
							</nav>
						) : null}
					</>
				) : (
					<FavoriteListingEmptyCard />
				)}
			</section>

			<FavoriteRemoveDialog
				open={Boolean(selectedFavorite)}
				favorite={selectedFavorite}
				isRemoving={removeMutation.isPending}
				onOpenChange={(isOpen) => {
					if (!isOpen && !removeMutation.isPending) {
						setSelectedFavorite(null);
					}
				}}
				onConfirm={confirmRemoveFavorite}
			/>
		</>
	);
}

function getPaginationItems(currentPage: number, totalPages: number) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages: Array<number | "ellipsis"> = [1];
	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);

	if (start > 2) {
		pages.push("ellipsis");
	}

	for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
		pages.push(pageNumber);
	}

	if (end < totalPages - 1) {
		pages.push("ellipsis");
	}

	pages.push(totalPages);
	return pages;
}
