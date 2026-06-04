"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	ArrowRight,
	ChevronsUpDown,
	CircleDollarSign,
	Filter,
	ImageIcon,
	RefreshCcw,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type {
	ListingCategorySlug,
	ListingListRequest,
	ListingListResponse,
	ListingOrderBy,
	ListingSortOrder,
	PublicListing,
} from "@/services/api/listings";
import { ApartmentListingsMap } from "./apartments/apartment-listings-map";
import styles from "./category-listings-page.module.css";
import { ListingFilterDialog } from "./listing-filter-dialog";

export type ListingSidebarFilter = {
	key: keyof ListingListRequest;
	label: string;
	kind: "text" | "number" | "boolean";
	placeholder?: string;
};

export type ListingSidebarRenderProps = {
	categoryLabel: string;
	draftFilters: ListingListRequest;
	variant: "sidebar" | "dialog";
	setDraftFilter: <Key extends keyof ListingListRequest>(
		key: Key,
		value: ListingListRequest[Key] | undefined,
	) => void;
	applyFilters: () => void;
	resetFilters: () => void;
};

type CategoryListingsPageProps = {
	categorySlug: ListingCategorySlug;
	categoryLabel: string;
	title: string;
	detailBaseHref: string;
	filters: ListingSidebarFilter[];
	listListings: (params: ListingListRequest) => Promise<ListingListResponse>;
	renderCard?: (
		listing: PublicListing,
		detailHref: string,
		index: number,
	) => ReactNode;
	renderSkeletonCard?: (index: number) => ReactNode;
	renderSidebar?: (props: ListingSidebarRenderProps) => ReactNode;
	filterPresentation?: "sidebar" | "dialog" | "responsive";
};

const sortOptions: Array<{ label: string; value: ListingOrderBy }> = [
	{ label: "Newest first", value: "createdAt" },
	{ label: "Price", value: "basePrice" },
	{ label: "Title", value: "title" },
];

export function CategoryListingsPage({
	categorySlug,
	categoryLabel,
	title,
	detailBaseHref,
	filters,
	listListings,
	renderCard,
	renderSkeletonCard,
	renderSidebar,
	filterPresentation = "sidebar",
}: CategoryListingsPageProps) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState<ListingOrderBy>("createdAt");
	const [sortOrder, setSortOrder] = useState<ListingSortOrder>("desc");
	const [draftFilters, setDraftFilters] = useState<ListingListRequest>({});
	const [appliedFilters, setAppliedFilters] = useState<ListingListRequest>({});
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const usesFilterDialog = filterPresentation === "dialog";
	const usesResponsiveFilterDialog = filterPresentation === "responsive";
	const showsFilterButton = usesFilterDialog || usesResponsiveFilterDialog;
	const request = useMemo(
		() =>
			cleanRequest({
				...appliedFilters,
				page,
				limit: 12,
				search: search.trim(),
				sortBy,
				sortOrder,
			}),
		[appliedFilters, page, search, sortBy, sortOrder],
	);
	const listingsQuery = useQuery({
		queryKey: ["public-category-listings", categorySlug, request],
		queryFn: () => listListings(request),
	});
	const listings = listingsQuery.data?.items ?? [];
	const meta = listingsQuery.data?.meta;
	const usesStayMapLayout =
		categorySlug === "apartments" ||
		categorySlug === "hotel-rooms" ||
		categorySlug === "airbnb";
	const mapListingSingular = getMapListingLabel(categoryLabel, "singular");
	const mapListingPlural = getMapListingLabel(categoryLabel, "plural");

	function applyFilters() {
		setAppliedFilters(cleanRequest(draftFilters));
		setPage(1);
	}

	function applyDialogFilters() {
		applyFilters();
		setIsFilterDialogOpen(false);
	}

	function resetFilters() {
		setSearch("");
		setSortBy("createdAt");
		setSortOrder("desc");
		setDraftFilters({});
		setAppliedFilters({});
		setPage(1);
	}

	function setDraftFilter<Key extends keyof ListingListRequest>(
		key: Key,
		value: ListingListRequest[Key] | undefined,
	): void {
		setDraftFilters((current) => ({
			...current,
			[key]: value,
		}));
	}

	function updateDraftFilter(
		filter: ListingSidebarFilter,
		value: string,
	): void {
		setDraftFilter(filter.key, parseFilterValue(filter, value));
	}

	function renderListingResults() {
		if (listingsQuery.isPending) {
			return <CategoryListingsSkeleton renderCard={renderSkeletonCard} />;
		}

		if (listingsQuery.isError) {
			return (
				<CategoryListingsState
					title={`${categoryLabel} unavailable`}
					message="Refresh this listing category before changing filters."
					actionLabel="Retry"
					onAction={() => listingsQuery.refetch()}
				/>
			);
		}

		if (listings.length === 0) {
			return (
				<CategoryListingsState
					title={`No ${categoryLabel.toLowerCase()} found`}
					message="Reset filters or search a wider location to see more options."
					actionLabel="Clear filters"
					onAction={resetFilters}
				/>
			);
		}

		return (
			<>
				<section className={styles.grid}>
					{listings.map((listing, index) => {
						const detailHref = `${detailBaseHref}/${listing.id}`;

						return renderCard ? (
							renderCard(listing, detailHref, index)
						) : (
							<DefaultListingCard
								key={listing.id}
								listing={listing}
								detailHref={detailHref}
							/>
						);
					})}
				</section>
				{meta ? (
					<CategoryPagination
						page={meta.page}
						limit={meta.limit}
						total={meta.total}
						totalPages={meta.totalPages}
						hasNextPage={meta.hasNextPage}
						hasPreviousPage={meta.hasPreviousPage}
						onPageChange={setPage}
					/>
				) : null}
			</>
		);
	}

	return (
		<main className={styles.page} data-category={categorySlug}>
			<section className={styles.hero}>
				<h1>{title}</h1>
			</section>

			<section
				className={styles.workspace}
				data-filter-presentation={filterPresentation}
			>
				{usesFilterDialog ? null : renderSidebar ? (
					renderSidebar({
						categoryLabel,
						draftFilters,
						variant: "sidebar",
						setDraftFilter,
						applyFilters,
						resetFilters,
					})
				) : (
					<aside
						className={styles.sidebar}
						aria-label={`${categoryLabel} filters`}
					>
						<div className={styles.sidebarHeader}>
							<span>
								<SlidersHorizontal aria-hidden="true" />
								Filters
							</span>
							<p>Refine by location, price, and category-specific details.</p>
						</div>

						<div className={styles.filterGrid}>
							<Input
								type="text"
								value={draftFilters.city ?? ""}
								placeholder="City"
								onChange={(event) =>
									updateDraftFilter(
										{ key: "city", label: "City", kind: "text" },
										event.target.value,
									)
								}
							/>
							<Input
								type="text"
								value={draftFilters.country ?? ""}
								placeholder="Country"
								onChange={(event) =>
									updateDraftFilter(
										{ key: "country", label: "Country", kind: "text" },
										event.target.value,
									)
								}
							/>
							<Input
								type="number"
								min={0}
								value={draftFilters.minPrice ?? ""}
								placeholder="Min price"
								onChange={(event) =>
									updateDraftFilter(
										{
											key: "minPrice",
											label: "Min price",
											kind: "number",
										},
										event.target.value,
									)
								}
							/>
							<Input
								type="number"
								min={0}
								value={draftFilters.maxPrice ?? ""}
								placeholder="Max price"
								onChange={(event) =>
									updateDraftFilter(
										{
											key: "maxPrice",
											label: "Max price",
											kind: "number",
										},
										event.target.value,
									)
								}
							/>

							{filters.map((filter) => (
								<ListingFilterControl
									key={filter.key}
									filter={filter}
									value={draftFilters[filter.key]}
									onChange={updateDraftFilter}
								/>
							))}
						</div>

						<div className={styles.filterActions}>
							<Button type="button" onClick={applyFilters}>
								<Filter aria-hidden="true" />
								Apply filters
							</Button>
							<Button type="button" variant="outline" onClick={resetFilters}>
								<RefreshCcw aria-hidden="true" />
								Reset
							</Button>
						</div>
					</aside>
				)}

				<section
					className={styles.results}
					aria-label={`${categoryLabel} results`}
				>
					<div
						className={styles.toolbar}
						data-filter-presentation={filterPresentation}
					>
						<Input
							type="search"
							value={search}
							icon={<Search aria-hidden="true" />}
							shellClassName={styles.searchInput}
							placeholder={`Search ${categoryLabel.toLowerCase()}`}
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
						/>
						{showsFilterButton ? (
							<Button
								type="button"
								variant="outline"
								className={styles.filterButton}
								onClick={() => setIsFilterDialogOpen(true)}
							>
								<Filter aria-hidden="true" />
								Filters
							</Button>
						) : null}
						<Select
							value={sortBy}
							onValueChange={(value) => {
								setSortBy(value as ListingOrderBy);
								setPage(1);
							}}
						>
							<SelectTrigger className={styles.selectTrigger}>
								<SelectValue>
									<ChevronsUpDown aria-hidden="true" />
									{sortOptions.find((option) => option.value === sortBy)?.label}
								</SelectValue>
							</SelectTrigger>
							<SelectContent align="start" alignItemWithTrigger={false}>
								{sortOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							type="button"
							variant="outline"
							className={styles.sortButton}
							onClick={() => {
								setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
								setPage(1);
							}}
						>
							<ChevronsUpDown aria-hidden="true" />
							{sortOrder === "asc" ? "Ascending" : "Descending"}
						</Button>
					</div>

					{usesStayMapLayout ? (
						<div className={styles.apartmentMapLayout}>
							<div className={styles.apartmentCardsColumn}>
								{renderListingResults()}
							</div>
							<ApartmentListingsMap
								listings={listings}
								detailBaseHref={detailBaseHref}
								isLoading={listingsQuery.isFetching}
								ariaLabel={`${categoryLabel} map`}
								emptyTitle={`No mapped ${mapListingPlural}`}
								emptyDescription={`${sentenceCase(mapListingPlural)} with saved coordinates will appear here.`}
								summarySingular={`mapped ${mapListingSingular}`}
								summaryPlural={`mapped ${mapListingPlural}`}
							/>
						</div>
					) : (
						renderListingResults()
					)}
				</section>
			</section>
			{showsFilterButton && renderSidebar ? (
				<ListingFilterDialog
					categoryLabel={categoryLabel}
					open={isFilterDialogOpen}
					onOpenChange={setIsFilterDialogOpen}
				>
					{renderSidebar({
						categoryLabel,
						draftFilters,
						variant: "dialog",
						setDraftFilter,
						applyFilters: applyDialogFilters,
						resetFilters,
					})}
				</ListingFilterDialog>
			) : null}
		</main>
	);
}

function ListingFilterControl({
	filter,
	value,
	onChange,
}: {
	filter: ListingSidebarFilter;
	value: ListingListRequest[keyof ListingListRequest];
	onChange: (filter: ListingSidebarFilter, value: string) => void;
}) {
	if (filter.kind === "boolean") {
		return (
			<Select
				value={value === undefined ? "ANY" : String(value)}
				onValueChange={(nextValue) => onChange(filter, nextValue ?? "ANY")}
			>
				<SelectTrigger className={styles.selectTrigger}>
					<SelectValue>{filter.label}</SelectValue>
				</SelectTrigger>
				<SelectContent align="start" alignItemWithTrigger={false}>
					<SelectItem value="ANY">Any {filter.label.toLowerCase()}</SelectItem>
					<SelectItem value="true">Yes</SelectItem>
					<SelectItem value="false">No</SelectItem>
				</SelectContent>
			</Select>
		);
	}

	return (
		<Input
			type={filter.kind}
			min={filter.kind === "number" ? 0 : undefined}
			value={formatFilterInputValue(value)}
			placeholder={filter.placeholder ?? filter.label}
			onChange={(event) => onChange(filter, event.target.value)}
		/>
	);
}

function DefaultListingCard({
	listing,
	detailHref,
}: {
	listing: PublicListing;
	detailHref: string;
}) {
	const coverImage =
		listing.images.find((image) => image.isCover) ?? listing.images[0];
	const coverUrl = coverImage?.file.publicUrl;

	return (
		<article className={styles.card}>
			<Link href={detailHref} className={styles.cover}>
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={coverImage.altText ?? listing.title}
						fill
						sizes="(max-width: 860px) 100vw, 28vw"
					/>
				) : (
					<span>
						<ImageIcon aria-hidden="true" />
					</span>
				)}
			</Link>
			<div className={styles.cardBody}>
				<div>
					<strong>{listing.title}</strong>
					<small>
						{listing.city}, {listing.country}
					</small>
				</div>
				<p>
					{listing.shortDescription ??
						listing.description ??
						"Approved Pluto Booking listing."}
				</p>
				<div className={styles.cardMeta}>
					<span>
						<CircleDollarSign aria-hidden="true" />
						{formatMoney(listing.basePrice, listing.currency)}/
						{listing.pricingUnit.toLowerCase()}
					</span>
					<Link href={detailHref}>
						View details
						<ArrowRight aria-hidden="true" />
					</Link>
				</div>
			</div>
		</article>
	);
}

function CategoryListingsSkeleton({
	renderCard,
}: {
	renderCard?: (index: number) => ReactNode;
}) {
	return (
		<>
			<section className={styles.grid} aria-label="Loading listings">
				{Array.from({ length: 12 }).map((_, index) =>
					renderCard ? (
						renderCard(index)
					) : (
						<article key={index} className={styles.skeletonCard}>
							<Skeleton className={styles.skeletonCover} />
							<Skeleton className={styles.skeletonLine} />
							<Skeleton className={styles.skeletonText} />
							<Skeleton className={styles.skeletonText} />
						</article>
					),
				)}
			</section>
		</>
	);
}

function CategoryListingsState({
	title,
	message,
	actionLabel,
	onAction,
}: {
	title: string;
	message: string;
	actionLabel: string;
	onAction: () => void;
}) {
	return (
		<section className={styles.statePanel}>
			<RefreshCcw aria-hidden="true" />
			<h2>{title}</h2>
			<p>{message}</p>
			<Button type="button" onClick={onAction}>
				<RefreshCcw aria-hidden="true" />
				{actionLabel}
			</Button>
		</section>
	);
}

function CategoryPagination({
	page,
	limit,
	total,
	totalPages,
	hasNextPage,
	hasPreviousPage,
	onPageChange,
}: {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (page: number) => void;
}) {
	const normalizedTotalPages = Math.max(totalPages, 1);
	const pages = getPaginationItems(page, normalizedTotalPages);

	if (total <= limit || normalizedTotalPages <= 1) {
		return null;
	}

	return (
		<nav className={styles.pagination} aria-label="Listings pagination">
			<Button
				type="button"
				variant="outline"
				disabled={!hasPreviousPage}
				onClick={() => onPageChange(page - 1)}
			>
				<ArrowLeft aria-hidden="true" />
				Previous
			</Button>
			<ol className={styles.paginationList}>
				{pages.map((item, index) => (
					<li key={`${item}-${index}`}>
						{item === "ellipsis" ? (
							<span className={styles.paginationEllipsis} aria-hidden="true">
								...
							</span>
						) : (
							<button
								type="button"
								className={styles.paginationPage}
								data-active={item === page}
								aria-current={item === page ? "page" : undefined}
								aria-label={`Go to page ${item}`}
								onClick={() => onPageChange(item)}
							>
								{item}
							</button>
						)}
					</li>
				))}
			</ol>
			<Button
				type="button"
				variant="outline"
				disabled={!hasNextPage}
				onClick={() => onPageChange(page + 1)}
			>
				Next
				<ArrowRight aria-hidden="true" />
			</Button>
		</nav>
	);
}

function getPaginationItems(currentPage: number, totalPages: number) {
	const pages = new Set<number>([
		1,
		totalPages,
		currentPage - 1,
		currentPage,
		currentPage + 1,
	]);
	const visiblePages = Array.from(pages)
		.filter((item) => item >= 1 && item <= totalPages)
		.sort((first, second) => first - second);

	return visiblePages.flatMap((item, index) => {
		const previous = visiblePages[index - 1];

		if (previous && item - previous > 1) {
			return ["ellipsis" as const, item];
		}

		return [item];
	});
}

function cleanRequest(input: ListingListRequest): ListingListRequest {
	return Object.fromEntries(
		Object.entries(input).filter(
			([, value]) => value !== "" && value !== undefined,
		),
	) as ListingListRequest;
}

function parseFilterValue(filter: ListingSidebarFilter, value: string) {
	if (value === "" || value === "ANY") {
		return undefined;
	}

	if (filter.kind === "number") {
		const numberValue = Number(value);
		return Number.isFinite(numberValue) ? numberValue : undefined;
	}

	if (filter.kind === "boolean") {
		return value === "true";
	}

	return value;
}

function formatFilterInputValue(
	value: ListingListRequest[keyof ListingListRequest],
) {
	return typeof value === "boolean" ? String(value) : (value ?? "");
}

function getMapListingLabel(
	categoryLabel: string,
	count: "singular" | "plural",
) {
	const normalizedLabel = categoryLabel.toLowerCase();

	if (normalizedLabel === "hotel rooms") {
		return count === "singular" ? "hotel room" : "hotel rooms";
	}

	if (normalizedLabel === "airbnb") {
		return count === "singular" ? "AirBnB stay" : "AirBnB stays";
	}

	if (count === "singular" && normalizedLabel.endsWith("s")) {
		return normalizedLabel.slice(0, -1);
	}

	return normalizedLabel;
}

function sentenceCase(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMoney(value: string, currency: string) {
	const amount = Number(value);

	if (!Number.isFinite(amount)) {
		return `${currency} ${value}`;
	}

	return new Intl.NumberFormat("en-RW", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}
