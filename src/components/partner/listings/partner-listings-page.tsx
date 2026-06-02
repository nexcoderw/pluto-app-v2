"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	CarFront,
	ChevronsUpDown,
	CircleDollarSign,
	Clock3,
	Eye,
	Filter,
	Hotel,
	House,
	ImageIcon,
	ListFilter,
	Plus,
	RefreshCcw,
	Search,
	SlidersHorizontal,
	Store,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalShell } from "@/components/portal/portal-shell";
import { partnerPortalNavigation } from "@/constants/partner-portal-navigation";
import type {
	Product,
	ProductCategory,
	ProductStatus,
} from "@/services/api/products";
import type { UserAuthProfile } from "@/services/api/auth";
import { getPartnerProfile } from "@/services/api/partner-profile";
import { listPartnerProducts } from "@/services/api/partner-products";
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from "../partner-access-boundary";
import { PartnerStatusGate } from "../partner-dashboard";
import styles from "./partner-listings-page.module.css";

type ProductOrderBy = "createdAt" | "basePrice" | "title";
type SortOrder = "asc" | "desc";

type ListingsFilterState = {
	search: string;
	status: ProductStatus | "ALL";
	category: ProductCategory | "ALL";
	orderBy: ProductOrderBy;
	order: SortOrder;
};

const defaultListingsFilters: ListingsFilterState = {
	search: "",
	status: "ALL",
	category: "ALL",
	orderBy: "createdAt",
	order: "desc",
};

const statusOptions: Array<{ label: string; value: ProductStatus | "ALL" }> = [
	{ label: "All statuses", value: "ALL" },
	{ label: "Pending review", value: "PENDING_REVIEW" },
	{ label: "Approved", value: "APPROVED" },
	{ label: "Rejected", value: "REJECTED" },
	{ label: "Draft", value: "DRAFT" },
	{ label: "Suspended", value: "SUSPENDED" },
	{ label: "Archived", value: "ARCHIVED" },
];

const categoryOptions: Array<{
	label: string;
	value: ProductCategory | "ALL";
}> = [
	{ label: "All categories", value: "ALL" },
	{ label: "Cars", value: "CAR" },
	{ label: "Apartments", value: "APARTMENT" },
	{ label: "Hotel rooms", value: "HOTEL_ROOM" },
	{ label: "Airbnb homes", value: "AIRBNB_HOUSE" },
];

const orderOptions: Array<{ label: string; value: ProductOrderBy }> = [
	{ label: "Newest activity", value: "createdAt" },
	{ label: "Price", value: "basePrice" },
	{ label: "Title", value: "title" },
];

export function PartnerListingsPage() {
	return (
		<PartnerAccessBoundary>
			{(user) => <PartnerListingsContent user={user} />}
		</PartnerAccessBoundary>
	);
}

function PartnerListingsContent({ user }: { user: UserAuthProfile }) {
	const router = useRouter();
	const profileQuery = useQuery({
		queryKey: ["partner-profile"],
		queryFn: getPartnerProfile,
	});
	const profile = profileQuery.data?.profile;

	useEffect(() => {
		if (profile && profile.status !== "APPROVED") {
			router.replace("/partner-onboarding");
		}
	}, [profile, router]);

	if (profileQuery.isPending) {
		return (
			<PartnerWorkspaceLoading
				title="Opening listings"
				description="Checking partner approval before loading listing tools."
			/>
		);
	}

	if (profile && profile.status !== "APPROVED") {
		return (
			<PartnerWorkspaceLoading
				title="Redirecting to onboarding"
				description="Complete approval before managing listings."
			/>
		);
	}

	if (profileQuery.isError || !profile) {
		return (
			<PartnerStatusGate
				title="Partner status unavailable"
				description="We could not confirm your approval status. Refresh before opening listing tools."
				action={
					<Button type="button" onClick={() => profileQuery.refetch()}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
				}
			/>
		);
	}

	return <PartnerListingsWorkspace user={user} />;
}

function PartnerListingsWorkspace({ user }: { user: UserAuthProfile }) {
	const [page, setPage] = useState(1);
	const [draftFilters, setDraftFilters] = useState<ListingsFilterState>(
		defaultListingsFilters,
	);
	const [filters, setFilters] = useState<ListingsFilterState>(
		defaultListingsFilters,
	);

	useEffect(() => {
		const searchTimer = window.setTimeout(() => {
			setPage(1);
			setFilters((current) => ({
				...current,
				search: draftFilters.search,
			}));
		}, 320);

		return () => window.clearTimeout(searchTimer);
	}, [draftFilters.search]);

	const query = useMemo(
		() => ({
			page,
			limit: 8,
			search: filters.search.trim() || undefined,
			status: filters.status === "ALL" ? undefined : filters.status,
			category: filters.category === "ALL" ? undefined : filters.category,
			orderBy: filters.orderBy,
			order: filters.order,
		}),
		[filters, page],
	);
	const listingsQuery = useQuery({
		queryKey: ["partner-products", query],
		queryFn: () => listPartnerProducts(query),
	});
	const items = listingsQuery.data?.items ?? [];
	const meta = listingsQuery.data?.meta;
	const advancedFilterCount = useMemo(
		() =>
			[
				filters.status !== "ALL",
				filters.category !== "ALL",
				filters.orderBy !== defaultListingsFilters.orderBy,
				filters.order !== defaultListingsFilters.order,
			].filter(Boolean).length,
		[filters],
	);

	function updateDraftFilter<Key extends keyof ListingsFilterState>(
		key: Key,
		value: ListingsFilterState[Key],
	) {
		setDraftFilters((current) => ({ ...current, [key]: value }));
	}

	function applyFilters() {
		setPage(1);
		setFilters(draftFilters);
	}

	function resetFilters() {
		setDraftFilters(defaultListingsFilters);
		setFilters(defaultListingsFilters);
		setPage(1);
	}

	return (
		<PortalShell
			variant="partner"
			user={user}
			eyebrow="Listings"
			title="Partner listings"
			description="Search, filter, review, and prepare listings before they reach customers."
			homeHref="/"
			homeLabel="View listings"
			navigation={partnerPortalNavigation}
			hideHero
		>
			<section className={styles.listingsPanel}>
				<div className={styles.panelHeader}>
					<span>
						<Store aria-hidden="true" />
						Inventory control
					</span>
					<div>
						<h2>Your listings</h2>
						<p>
							Keep every listing accurate, review-ready, and aligned with
							customer expectations.
						</p>
					</div>
					<Link href="/partner/listings/create" className={styles.createButton}>
						<Plus aria-hidden="true" />
						New listing
					</Link>
				</div>

				<ListingsFilters
					filters={draftFilters}
					activeFilterCount={advancedFilterCount}
					isFetching={listingsQuery.isFetching}
					onChange={updateDraftFilter}
					onApply={applyFilters}
					onReset={resetFilters}
				/>

				{listingsQuery.isPending ? (
					<ListingsSkeleton />
				) : listingsQuery.isError ? (
					<ListingsError onRetry={() => listingsQuery.refetch()} />
				) : items.length === 0 ? (
					<ListingsEmpty onReset={resetFilters} />
				) : (
					<>
						<div className={styles.listingGrid}>
							{items.map((product) => (
								<ListingCard key={product.id} product={product} />
							))}
						</div>
						{meta ? (
							<Pagination
								page={meta.page}
								totalPages={meta.totalPages}
								hasNextPage={meta.hasNextPage}
								hasPreviousPage={meta.hasPreviousPage}
								onPageChange={setPage}
							/>
						) : null}
					</>
				)}
			</section>
		</PortalShell>
	);
}

function ListingsFilters({
	filters,
	activeFilterCount,
	isFetching,
	onChange,
	onApply,
	onReset,
}: {
	filters: ListingsFilterState;
	activeFilterCount: number;
	isFetching: boolean;
	onChange: <Key extends keyof ListingsFilterState>(
		key: Key,
		value: ListingsFilterState[Key],
	) => void;
	onApply: () => void;
	onReset: () => void;
}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	function applyDialogFilters() {
		onApply();
		setIsDialogOpen(false);
	}

	function resetAllFilters() {
		onReset();
		setIsDialogOpen(false);
	}

	return (
		<>
			<form
				className={styles.filters}
				aria-label="Listing filters"
				onSubmit={(event) => {
					event.preventDefault();
					setIsDialogOpen(true);
				}}
			>
				<div className={styles.searchField}>
					<Label htmlFor="partner-listing-search">
						<Search aria-hidden="true" />
						Search
					</Label>
					<Input
						id="partner-listing-search"
						type="search"
						value={filters.search}
						onChange={(event) => onChange("search", event.target.value)}
						placeholder="Search by title, city, or description"
						icon={<Search aria-hidden="true" />}
					/>
				</div>

				<div className={styles.filterActions}>
					<Button type="button" onClick={() => setIsDialogOpen(true)}>
						<Filter aria-hidden="true" />
						Filter
						{activeFilterCount ? (
							<span className={styles.filterCount}>{activeFilterCount}</span>
						) : null}
					</Button>
					<Button type="button" variant="outline" onClick={resetAllFilters}>
						<RefreshCcw aria-hidden="true" />
						Reset
					</Button>
				</div>
			</form>

			<ListingsFiltersDialog
				open={isDialogOpen}
				filters={filters}
				isFetching={isFetching}
				onChange={onChange}
				onApply={applyDialogFilters}
				onReset={resetAllFilters}
				onOpenChange={setIsDialogOpen}
			/>
		</>
	);
}

function ListingsFiltersDialog({
	open,
	filters,
	isFetching,
	onChange,
	onApply,
	onReset,
	onOpenChange,
}: {
	open: boolean;
	filters: ListingsFilterState;
	isFetching: boolean;
	onChange: <Key extends keyof ListingsFilterState>(
		key: Key,
		value: ListingsFilterState[Key],
	) => void;
	onApply: () => void;
	onReset: () => void;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.filterDialog}>
				<DialogHeader className={styles.filterDialogHeader}>
					<span>
						<ListFilter aria-hidden="true" />
					</span>
					<div>
						<DialogTitle>Filter listings</DialogTitle>
						<DialogDescription>
							Narrow inventory by review status, listing category, and sort
							order without interrupting search.
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className={styles.filterDialogGrid}>
					<FilterSelect
						label="Status"
						icon={<ListFilter aria-hidden="true" />}
						value={filters.status}
						options={statusOptions}
						onChange={(value) =>
							onChange("status", value as ListingsFilterState["status"])
						}
					/>
					<FilterSelect
						label="Category"
						icon={<Filter aria-hidden="true" />}
						value={filters.category}
						options={categoryOptions}
						onChange={(value) =>
							onChange("category", value as ListingsFilterState["category"])
						}
					/>
					<FilterSelect
						label="Order by"
						icon={<SlidersHorizontal aria-hidden="true" />}
						value={filters.orderBy}
						options={orderOptions}
						onChange={(value) =>
							onChange("orderBy", value as ListingsFilterState["orderBy"])
						}
					/>
					<FilterSelect
						label="Direction"
						icon={<ChevronsUpDown aria-hidden="true" />}
						value={filters.order}
						options={[
							{ label: "Descending", value: "desc" },
							{ label: "Ascending", value: "asc" },
						]}
						onChange={(value) =>
							onChange("order", value as ListingsFilterState["order"])
						}
					/>
				</div>

				<DialogFooter className={styles.filterDialogFooter}>
					<Button type="button" variant="outline" onClick={onReset}>
						<RefreshCcw aria-hidden="true" />
						Reset
					</Button>
					<Button type="button" disabled={isFetching} onClick={onApply}>
						<Filter aria-hidden="true" />
						Apply filters
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function FilterSelect<Value extends string>({
	label,
	icon,
	value,
	options,
	onChange,
}: {
	label: string;
	icon: ReactNode;
	value: Value;
	options: Array<{ label: string; value: Value }>;
	onChange: (value: Value) => void;
}) {
	const selectedOption = options.find((option) => option.value === value);

	return (
		<div className={styles.field}>
			<Label>
				{icon}
				{label}
			</Label>
			<Select
				value={value}
				onValueChange={(nextValue) => onChange(nextValue as Value)}
			>
				<SelectTrigger className={styles.selectTrigger} aria-label={label}>
					<SelectValue>
						{icon}
						{selectedOption?.label ?? "All"}
					</SelectValue>
				</SelectTrigger>
				<SelectContent
					className={styles.selectMenu}
					align="start"
					alignItemWithTrigger={false}
				>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

function ListingCard({ product }: { product: Product }) {
	const coverImage =
		product.images.find((image) => image.isCover) ?? product.images[0];
	const coverUrl = coverImage?.file.publicUrl;
	const CategoryIcon = getCategoryIcon(product.category);

	return (
		<article className={styles.listingCard}>
			<div className={styles.cover}>
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={coverImage.altText ?? product.title}
						fill
						sizes="(max-width: 900px) 100vw, 33vw"
					/>
				) : (
					<span>
						<ImageIcon aria-hidden="true" />
					</span>
				)}
				<StatusPill status={product.status ?? "DRAFT"} />
			</div>
			<div className={styles.cardBody}>
				<div>
					<strong>{product.title}</strong>
					<small>
						{product.city}, {product.country}
					</small>
				</div>
				<span className={styles.categoryPill}>
					<CategoryIcon aria-hidden="true" />
					{formatLabel(product.category)}
				</span>
				<p>
					{product.shortDescription ??
						product.description ??
						"No public summary yet."}
				</p>
				<div className={styles.cardMeta}>
					<span>
						<CircleDollarSign aria-hidden="true" />
						{formatMoney(product.basePrice, product.currency)}/
						{product.pricingUnit.toLowerCase()}
					</span>
					<span>
						<Clock3 aria-hidden="true" />
						{formatDate(product.updatedAt ?? product.createdAt)}
					</span>
				</div>
				<div className={styles.cardActions}>
					<Link
						href={`/partner/listings/${product.id}`}
						className={styles.secondaryLink}
					>
						<Eye aria-hidden="true" />
						View
					</Link>
					<Link
						href={`/partner/listings/${product.id}/edit`}
						className={styles.editButton}
					>
						<ArrowRight aria-hidden="true" />
						Edit
					</Link>
				</div>
			</div>
		</article>
	);
}

function getCategoryIcon(category: ProductCategory) {
	switch (category) {
		case "APARTMENT":
			return Building2;
		case "HOTEL_ROOM":
			return Hotel;
		case "AIRBNB_HOUSE":
			return House;
		case "CAR":
		default:
			return CarFront;
	}
}

function ListingsSkeleton() {
	return (
		<div className={styles.listingGrid} aria-label="Loading listings">
			{Array.from({ length: 6 }).map((_, index) => (
				<article className={styles.skeletonCard} key={index}>
					<Skeleton className={styles.skeletonCover} />
					<Skeleton className={styles.skeletonLine} />
					<Skeleton className={styles.skeletonText} />
					<Skeleton className={styles.skeletonText} />
				</article>
			))}
		</div>
	);
}

function ListingsError({ onRetry }: { onRetry: () => void }) {
	return (
		<div className={styles.statePanel} data-tone="error">
			<RefreshCcw aria-hidden="true" />
			<h3>Listings could not be loaded</h3>
			<p>
				Refresh the list before changing filters or creating another listing.
			</p>
			<Button type="button" onClick={onRetry}>
				<RefreshCcw aria-hidden="true" className={styles.createButton} />
				Retry
			</Button>
		</div>
	);
}

function ListingsEmpty({ onReset }: { onReset: () => void }) {
	return (
		<div className={styles.statePanel}>
			<Store aria-hidden="true" />
			<h3>No listings match this view</h3>
			<p>
				Create your first listing or clear filters to review all partner
				inventory.
			</p>
			<div className={styles.stateActions}>
				<Link href="/partner/listings/create" className={styles.createButton}>
					<Plus aria-hidden="true" />
					Create listing
				</Link>
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					className={styles.resetButton}
				>
					<RefreshCcw aria-hidden="true" />
					Clear filters
				</Button>
			</div>
		</div>
	);
}

function Pagination({
	page,
	totalPages,
	hasNextPage,
	hasPreviousPage,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (page: number) => void;
}) {
	return (
		<div className={styles.pagination} aria-label="Listing pagination">
			<Button
				type="button"
				variant="outline"
				disabled={!hasPreviousPage}
				onClick={() => onPageChange(page - 1)}
			>
				<ArrowLeft aria-hidden="true" />
				Previous
			</Button>
			<span>
				Page {page} of {Math.max(totalPages, 1)}
			</span>
			<Button
				type="button"
				variant="outline"
				disabled={!hasNextPage}
				onClick={() => onPageChange(page + 1)}
			>
				Next
				<ArrowRight aria-hidden="true" />
			</Button>
		</div>
	);
}

function StatusPill({ status }: { status: ProductStatus }) {
	return (
		<span className={styles.statusPill} data-status={status}>
			{status.toLowerCase().replace("_", " ")}
		</span>
	);
}

function formatMoney(value: string, currency: string) {
	const numericValue = Number(value);

	if (!Number.isFinite(numericValue)) {
		return `${currency} ${value}`;
	}

	return new Intl.NumberFormat("en-RW", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(numericValue);
}

function formatDate(value?: string) {
	if (!value) {
		return "Not updated yet";
	}

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}

function formatLabel(value: string) {
	return value
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
