"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	CarFront,
	ChevronsUpDown,
	CircleDollarSign,
	Filter,
	Hotel,
	House,
	ImageIcon,
	RefreshCcw,
	Search,
	ShieldCheck,
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
	listProducts,
	type Product,
	type ProductCategory,
} from "@/services/api/products";
import { ListingImageFrame } from "./listing-image-frame";
import styles from "./listings-page.module.css";

type ProductOrderBy = "createdAt" | "basePrice" | "title";
type SortOrder = "asc" | "desc";

const categoryOptions: Array<{
	label: string;
	value: ProductCategory | "ALL";
	icon: typeof CarFront;
}> = [
	{ label: "All categories", value: "ALL", icon: ShieldCheck },
	{ label: "Cars", value: "CAR", icon: CarFront },
	{ label: "Apartments", value: "APARTMENT", icon: Building2 },
	{ label: "Hotel rooms", value: "HOTEL_ROOM", icon: Hotel },
	{ label: "Airbnb homes", value: "AIRBNB_HOUSE", icon: House },
];

const orderOptions: Array<{ label: string; value: ProductOrderBy }> = [
	{ label: "Newest", value: "createdAt" },
	{ label: "Price", value: "basePrice" },
	{ label: "Title", value: "title" },
];

const categoryIcons: Record<ProductCategory, typeof CarFront> = {
	CAR: CarFront,
	APARTMENT: Building2,
	HOTEL_ROOM: Hotel,
	AIRBNB_HOUSE: House,
};

export function ListingsPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [category, setCategory] = useState<ProductCategory | "ALL">("ALL");
	const [orderBy, setOrderBy] = useState<ProductOrderBy>("createdAt");
	const [order, setOrder] = useState<SortOrder>("desc");
	const request = useMemo(
		() => ({
			page,
			search: search.trim() || undefined,
			category: category === "ALL" ? undefined : category,
			orderBy,
			order,
		}),
		[category, order, orderBy, page, search],
	);
	const productsQuery = useQuery({
		queryKey: ["public-listings", request],
		queryFn: () => listProducts(request),
	});
	const products = productsQuery.data?.items ?? [];
	const meta = productsQuery.data?.meta;

	function resetFilters() {
		setSearch("");
		setCategory("ALL");
		setOrderBy("createdAt");
		setOrder("desc");
		setPage(1);
	}

	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<div>
					<span className={styles.eyebrow}>
						<ShieldCheck aria-hidden="true" />
						Reviewed listings
					</span>
					<h1>Find trusted listings across every Pluto category.</h1>
					<p>
						Search approved cars, apartments, hotel rooms, and Airbnb homes from
						partners who completed verification.
					</p>
				</div>
				<div className={styles.heroMetric}>
					<strong>{meta?.total ?? 0}</strong>
					<span>Listings in this view</span>
				</div>
			</section>

			<section className={styles.filters} aria-label="Listings filters">
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
					value={category}
					onValueChange={(value) => {
						setCategory(value as ProductCategory | "ALL");
						setPage(1);
					}}
				>
					<SelectTrigger className={styles.selectTrigger}>
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
					<SelectTrigger className={styles.selectTrigger}>
						<SelectValue>
							<ChevronsUpDown aria-hidden="true" />
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
			</section>

			{productsQuery.isPending ? (
				<ListingsSkeleton />
			) : productsQuery.isError ? (
				<ListingsState
					title="Listings unavailable"
					message="Refresh the listing feed before changing filters."
					actionLabel="Retry"
					onAction={() => productsQuery.refetch()}
				/>
			) : products.length === 0 ? (
				<ListingsState
					title="No listings match this search"
					message="Clear filters or try a wider search across all categories."
					actionLabel="Clear filters"
					onAction={resetFilters}
				/>
			) : (
				<>
					<section className={styles.grid} aria-label="Listings">
						{products.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</section>
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
		</main>
	);
}

function ProductCard({ product }: { product: Product }) {
	const coverImage =
		product.images.find((image) => image.isCover) ?? product.images[0];
	const coverUrl = coverImage?.file.publicUrl;
	const CategoryIcon = categoryIcons[product.category];

	return (
		<article className={styles.card}>
			<div className={styles.cover}>
				{coverUrl ? (
					<ListingImageFrame
						src={coverUrl}
						alt={coverImage.altText ?? product.title}
						sizes="(max-width: 760px) 100vw, 33vw"
					/>
				) : (
					<span>
						<ImageIcon aria-hidden="true" />
					</span>
				)}
				<div className={styles.categoryPill}>
					<CategoryIcon aria-hidden="true" />
					{formatLabel(product.category)}
				</div>
			</div>
			<div className={styles.cardBody}>
				<div>
					<strong>{product.title}</strong>
					<small>
						{product.city}, {product.country}
					</small>
				</div>
				<p>
					{product.shortDescription ??
						product.description ??
						"Approved Pluto Booking listing."}
				</p>
				<div className={styles.cardMeta}>
					<span>
						<CircleDollarSign aria-hidden="true" />
						{formatMoney(product.basePrice, product.currency)}/
						{product.pricingUnit.toLowerCase()}
					</span>
					<Link href="/login">
						<ArrowRight aria-hidden="true" />
						Sign in to book
					</Link>
				</div>
			</div>
		</article>
	);
}

function ListingsSkeleton() {
	return (
		<section className={styles.grid} aria-label="Loading listings">
			{Array.from({ length: 6 }).map((_, index) => (
				<article key={index} className={styles.skeletonCard}>
					<Skeleton className={styles.skeletonCover} />
					<Skeleton className={styles.skeletonLine} />
					<Skeleton className={styles.skeletonText} />
					<Skeleton className={styles.skeletonText} />
				</article>
			))}
		</section>
	);
}

function ListingsState({
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
		</nav>
	);
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

function formatLabel(value: string) {
	return value
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
