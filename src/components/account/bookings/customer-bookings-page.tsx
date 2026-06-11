"use client";

import { FormEvent, useMemo, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	CalendarDays,
	CalendarX2,
	RefreshCcw,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
	cancelBooking,
	listMyBookings,
	type BookingOrderBy,
	type BookingSortOrder,
	type BookingStatus,
	type BookingSummary,
} from "@/services/api/bookings";
import { ApiRequestError } from "@/services/api/errors";
import {
	formatBookingCategory,
	formatBookingDate,
	formatBookingDateTime,
	formatBookingMoney,
	formatBookingStatus,
	formatPaymentStatus,
	getBookingStatusTone,
} from "./booking-display";
import { CustomerBookingCancelDialog } from "./customer-booking-cancel-dialog";
import styles from "./customer-bookings-page.module.css";

const CUSTOMER_BOOKINGS_LIMIT = 10;
const CUSTOMER_BOOKINGS_QUERY_KEY = ["customer-bookings"] as const;

const statusOptions: Array<{ label: string; value: BookingStatus | "ALL" }> = [
	{ label: "All statuses", value: "ALL" },
	{ label: "Pending", value: "PENDING" },
	{ label: "Confirmed", value: "CONFIRMED" },
	{ label: "Completed", value: "COMPLETED" },
	{ label: "Cancelled", value: "CANCELLED_BY_CUSTOMER" },
];

const sortOptions: Array<{ label: string; value: BookingOrderBy }> = [
	{ label: "Newest", value: "createdAt" },
	{ label: "Start date", value: "startDate" },
	{ label: "Total", value: "totalAmount" },
	{ label: "Status", value: "status" },
];

export function CustomerBookingsPage() {
	return (
		<PortalAccessBoundary allowedRole="CUSTOMER">
			{(user) => (
				<CustomerPortalShell user={user}>
					<CustomerBookingsContent />
				</CustomerPortalShell>
			)}
		</PortalAccessBoundary>
	);
}

function CustomerBookingsContent() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [draftSearch, setDraftSearch] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
	const [orderBy, setOrderBy] = useState<BookingOrderBy>("createdAt");
	const [order, setOrder] = useState<BookingSortOrder>("desc");
	const [cancelBookingTarget, setCancelBookingTarget] =
		useState<BookingSummary | null>(null);
	const bookingsQuery = useQuery({
		queryKey: [
			...CUSTOMER_BOOKINGS_QUERY_KEY,
			{ page, search, status, orderBy, order },
		],
		queryFn: () =>
			listMyBookings({
				page,
				limit: CUSTOMER_BOOKINGS_LIMIT,
				search: search || undefined,
				status: status === "ALL" ? undefined : status,
				orderBy,
				order,
			}),
		staleTime: 20_000,
	});
	const cancelMutation = useMutation({
		mutationFn: (reason?: string) =>
			cancelBooking(cancelBookingTarget?.id ?? "", { reason }),
		onSuccess: (response) => {
			toast.success(response.message, {
				description: "Your booking timeline has been updated.",
			});
			setCancelBookingTarget(null);
			void queryClient.invalidateQueries({
				queryKey: CUSTOMER_BOOKINGS_QUERY_KEY,
			});
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: "Booking could not be cancelled. Please try again.";

			toast.error("Booking was not cancelled", { description: message });
		},
	});
	const bookings = bookingsQuery.data?.items ?? [];
	const meta = bookingsQuery.data?.meta;
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
		setStatus("ALL");
		setOrderBy("createdAt");
		setOrder("desc");
		setPage(1);
	}

	return (
		<>
			<section className={styles.page}>
				<header className={styles.header}>
					<div>
						<span>
							<CalendarDays aria-hidden="true" />
							Customer reservations
						</span>
						<h1>Bookings</h1>
						<p>
							Track pending requests, confirmed trips, cancelled bookings, and
							the future payment confirmation state.
						</p>
					</div>
					<strong>{meta?.total ?? 0} bookings</strong>
				</header>

				<form className={styles.toolbar} onSubmit={handleSearch}>
					<Input
						type="search"
						value={draftSearch}
						icon={<Search aria-hidden="true" />}
						placeholder="Search booking number, listing, city..."
						shellClassName={styles.searchInput}
						onChange={(event) => setDraftSearch(event.target.value)}
					/>
					<div className={styles.controls}>
						<Select
							value={status}
							onValueChange={(value) => {
								setStatus(value as BookingStatus | "ALL");
								setPage(1);
							}}
						>
							<SelectTrigger className={styles.selectTrigger}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent align="start" alignItemWithTrigger={false}>
								<SelectGroup>
									{statusOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							value={orderBy}
							onValueChange={(value) => setOrderBy(value as BookingOrderBy)}
						>
							<SelectTrigger className={styles.selectTrigger}>
								<SelectValue />
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
						<Select
							value={order}
							onValueChange={(value) => setOrder(value as BookingSortOrder)}
						>
							<SelectTrigger className={styles.selectTrigger}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent align="start" alignItemWithTrigger={false}>
								<SelectGroup>
									<SelectItem value="desc">Descending</SelectItem>
									<SelectItem value="asc">Ascending</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Button type="submit" className={styles.primaryButton}>
							<Search aria-hidden="true" />
							Search
						</Button>
						<Button
							type="button"
							variant="outline"
							className={styles.secondaryButton}
							onClick={resetFilters}
						>
							<RefreshCcw aria-hidden="true" />
							Reset
						</Button>
					</div>
				</form>

				{bookingsQuery.isPending ? (
					<CustomerBookingsSkeleton />
				) : bookingsQuery.isError ? (
					<BookingState
						title="Bookings could not load"
						message="Refresh this workspace to retrieve your latest booking activity."
						onAction={() => void bookingsQuery.refetch()}
					/>
				) : bookings.length ? (
					<>
						<div className={styles.tablePanel}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>Booking</th>
										<th>Dates</th>
										<th>Total</th>
										<th>Status</th>
										<th>Payment</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{bookings.map((booking) => (
										<tr key={booking.id}>
											<td>
												<strong>{booking.product.title}</strong>
												<span>
													{booking.bookingNo} ·{" "}
													{formatBookingCategory(booking.product.category)}
												</span>
											</td>
											<td>
												<strong>
													{formatBookingDate(booking.startDate)} -{" "}
													{formatBookingDate(booking.endDate)}
												</strong>
												<span>{booking.totalDays} days</span>
											</td>
											<td>
												<strong>
													{formatBookingMoney(
														booking.totalAmount,
														booking.currency,
													)}
												</strong>
												<span>
													Created {formatBookingDateTime(booking.createdAt)}
												</span>
											</td>
											<td>
												<span
													className={styles.statusBadge}
													data-tone={getBookingStatusTone(booking.status)}
												>
													{formatBookingStatus(booking.status)}
												</span>
											</td>
											<td>{formatPaymentStatus(booking.paymentStatus)}</td>
											<td>
												<Button
													type="button"
													variant="outline"
													className={styles.rowAction}
													disabled={!canCancelBooking(booking.status)}
													onClick={() => setCancelBookingTarget(booking)}
												>
													<CalendarX2 aria-hidden="true" />
													Cancel
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						{totalPages > 1 ? (
							<Pagination
								page={page}
								totalPages={totalPages}
								pageNumbers={pageNumbers}
								hasNextPage={Boolean(meta?.hasNextPage)}
								hasPreviousPage={Boolean(meta?.hasPreviousPage)}
								onPageChange={setPage}
							/>
						) : null}
					</>
				) : (
					<BookingState
						title="No bookings yet"
						message="When you reserve a listing, it will appear here with payment and status history."
						onAction={resetFilters}
					/>
				)}
			</section>

			<CustomerBookingCancelDialog
				booking={cancelBookingTarget}
				isCancelling={cancelMutation.isPending}
				onOpenChange={(isOpen) => {
					if (!isOpen && !cancelMutation.isPending) {
						setCancelBookingTarget(null);
					}
				}}
				onConfirm={(reason) => cancelMutation.mutate(reason)}
			/>
		</>
	);
}

function canCancelBooking(status: BookingStatus) {
	return status === "PENDING" || status === "CONFIRMED";
}

function BookingState({
	title,
	message,
	onAction,
}: {
	title: string;
	message: string;
	onAction: () => void;
}) {
	return (
		<section className={styles.state}>
			<SlidersHorizontal aria-hidden="true" />
			<h2>{title}</h2>
			<p>{message}</p>
			<Button type="button" className={styles.primaryButton} onClick={onAction}>
				<RefreshCcw aria-hidden="true" />
				Refresh
			</Button>
		</section>
	);
}

function CustomerBookingsSkeleton() {
	return (
		<div className={styles.tablePanel} aria-label="Loading customer bookings">
			<div className={styles.skeletonTable}>
				<Skeleton className={styles.skeletonHeader} />
				{Array.from({ length: 6 }).map((_, index) => (
					<Skeleton key={index} className={styles.skeletonRow} />
				))}
			</div>
		</div>
	);
}

function Pagination({
	page,
	totalPages,
	pageNumbers,
	hasNextPage,
	hasPreviousPage,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	pageNumbers: Array<number | "ellipsis">;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (page: number) => void;
}) {
	return (
		<nav className={styles.pagination} aria-label="Booking pages">
			<Button
				type="button"
				variant="outline"
				className={styles.paginationButton}
				disabled={!hasPreviousPage}
				onClick={() => onPageChange(Math.max(1, page - 1))}
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
							onClick={() => onPageChange(pageNumber)}
						>
							{pageNumber}
						</button>
					),
				)}
			</div>
			<Button
				type="button"
				variant="outline"
				className={styles.paginationButton}
				disabled={!hasNextPage}
				onClick={() => onPageChange(Math.min(totalPages, page + 1))}
			>
				Next
				<ArrowRight aria-hidden="true" />
			</Button>
		</nav>
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
