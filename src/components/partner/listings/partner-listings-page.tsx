"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	ArrowRight,
	BadgeCheck,
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
	ShieldCheck,
	SlidersHorizontal,
	Store,
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
import {
	PortalShell,
	type PortalAction,
	type PortalMetric,
} from "@/components/portal/portal-shell";
import { partnerPortalNavigation } from "@/constants/partner-portal-navigation";
import type {
	Product,
	ProductCategory,
	ProductStatus,
} from "@/services/api/products";
import type { UserAuthProfile } from "@/services/api/auth";
import {
	getPartnerProfile,
	type PartnerProfile,
} from "@/services/api/partner-profile";
import { listPartnerProducts } from "@/services/api/partner-products";
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from "../partner-access-boundary";
import { PartnerStatusGate } from "../partner-dashboard";
import styles from "./partner-listings-page.module.css";

type ProductOrderBy = "createdAt" | "basePrice" | "title";
type SortOrder = "asc" | "desc";

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

const partnerListingActions: PortalAction[] = [
	{
		href: "/partner/listings/create",
		label: "Create listing",
		description: "Add a customer-ready listing and submit it for review.",
		icon: Plus,
	},
	{
		href: "/partner/dashboard",
		label: "Partner dashboard",
		description: "Return to the operations overview.",
		icon: ArrowRight,
	},
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

	return <PartnerListingsWorkspace profile={profile} user={user} />;
}

function PartnerListingsWorkspace({
	profile,
	user,
}: {
	profile: PartnerProfile;
	user: UserAuthProfile;
}) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<ProductStatus | "ALL">("ALL");
	const [category, setCategory] = useState<ProductCategory | "ALL">("ALL");
	const [orderBy, setOrderBy] = useState<ProductOrderBy>("createdAt");
	const [order, setOrder] = useState<SortOrder>("desc");
	const query = useMemo(
		() => ({
			page,
			limit: 8,
			search: search.trim() || undefined,
			status: status === "ALL" ? undefined : status,
			category: category === "ALL" ? undefined : category,
			orderBy,
			order,
		}),
		[category, order, orderBy, page, search, status],
	);
	const listingsQuery = useQuery({
		queryKey: ["partner-products", query],
		queryFn: () => listPartnerProducts(query),
	});
	const items = listingsQuery.data?.items ?? [];
	const meta = listingsQuery.data?.meta;
	const metrics = useMemo(
		() => buildListingMetrics(items, listingsQuery.data?.meta.total ?? 0),
		[items, listingsQuery.data?.meta.total],
	);

	function resetFilters() {
		setSearch("");
		setStatus("ALL");
		setCategory("ALL");
		setOrderBy("createdAt");
		setOrder("desc");
		setPage(1);
	}

	return (
		<PortalShell
			variant="partner"
			user={user}
			eyebrow="Listing operations"
			title={getListingsTitle(profile)}
			description="Search, filter, review, and prepare listings before they reach customers."
			homeHref="/"
			homeLabel="View marketplace"
			navigation={partnerPortalNavigation}
			metrics={metrics}
			actions={partnerListingActions}
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

				<div className={styles.filters} aria-label="Listing filters">
					<Input
						type="search"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
						placeholder="Search by title, city, or description"
						icon={<Search aria-hidden="true" />}
					/>

					<Select
						value={status}
						onValueChange={(value) => {
							setStatus(value as ProductStatus | "ALL");
							setPage(1);
						}}
					>
						<SelectTrigger
							className={styles.selectTrigger}
							aria-label="Filter by status"
						>
							<SelectValue>
								<ListFilter aria-hidden="true" />
								{statusOptions.find((option) => option.value === status)?.label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							{statusOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={category}
						onValueChange={(value) => {
							setCategory(value as ProductCategory | "ALL");
							setPage(1);
						}}
					>
						<SelectTrigger
							className={styles.selectTrigger}
							aria-label="Filter by category"
						>
							<SelectValue>
								<Filter aria-hidden="true" />
								{
									categoryOptions.find((option) => option.value === category)
										?.label
								}
							</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							{categoryOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={orderBy}
						onValueChange={(value) => {
							setOrderBy(value as ProductOrderBy);
							setPage(1);
						}}
					>
						<SelectTrigger
							className={styles.selectTrigger}
							aria-label="Sort listings by"
						>
							<SelectValue>
								<SlidersHorizontal aria-hidden="true" />
								{orderOptions.find((option) => option.value === orderBy)?.label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							{orderOptions.map((option) => (
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
							setOrder((current) => (current === "asc" ? "desc" : "asc"));
							setPage(1);
						}}
					>
						<ChevronsUpDown aria-hidden="true" />
						{order === "asc" ? "Ascending" : "Descending"}
					</Button>
				</div>

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

function buildListingMetrics(items: Product[], total: number): PortalMetric[] {
	const approved = items.filter((item) => item.status === "APPROVED").length;
	const inReview = items.filter(
		(item) => item.status === "PENDING_REVIEW",
	).length;

	return [
		{
			label: "Total listings",
			value: String(total),
			description: "Inventory connected to your approved partner account.",
			icon: Store,
		},
		{
			label: "Approved",
			value: String(approved),
			description: "Listings currently eligible for customers.",
			icon: BadgeCheck,
		},
		{
			label: "In review",
			value: String(inReview),
			description: "Listings waiting for admin decision.",
			icon: ShieldCheck,
		},
	];
}

function getListingsTitle(profile: PartnerProfile) {
	const name = profile.businessName ?? profile.legalName ?? "Partner";

	return `${name} listings`;
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
