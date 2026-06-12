"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	CalendarCheck2,
	RefreshCcw,
	Search,
	ShieldCheck,
} from "lucide-react";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { PortalShell } from "@/components/portal/portal-shell";
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from "@/components/partner/partner-access-boundary";
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
import { partnerPortalNavigation } from "@/constants/partner-portal-navigation";
import {
	getPartnerProfile,
	type PartnerProfile,
} from "@/services/api/partner-profile";
import {
	bookingQueryKeys,
	listPartnerBookings,
	updatePartnerBookingStatus,
	type BookingOrderBy,
	type BookingSortOrder,
	type BookingStatus,
	type BookingSummary,
	type ListBookingsResponse,
	type UpdatePartnerBookingStatusPayload,
} from "@/services/api/bookings";
import {
	BOOKING_QUERY_GC_TIME_MS,
	BOOKING_QUERY_STALE_TIME_MS,
	shouldRetryBookingQuery,
} from "@/services/api/bookings/query-options";
import { ApiRequestError } from "@/services/api/errors";
import {
	formatBookingCategory,
	formatBookingDate,
	formatBookingMoney,
	formatBookingStatus,
	formatPaymentStatus,
	getBookingStatusTone,
} from "@/components/account/bookings/booking-display";
import { PartnerStatusGate } from "@/components/partner/partner-dashboard";
import { PartnerBookingStatusDialog } from "./partner-booking-status-dialog";
import styles from "./partner-bookings-page.module.css";

const PARTNER_BOOKINGS_LIMIT = 12;

export function PartnerBookingsPage() {
	return (
		<PartnerAccessBoundary>
			{(user) => <PartnerBookingsGate user={user} />}
		</PartnerAccessBoundary>
	);
}

function PartnerBookingsGate({
	user,
}: {
	user: Parameters<Parameters<typeof PartnerAccessBoundary>[0]["children"]>[0];
}) {
	const profileQuery = useQuery({
		queryKey: ["partner-profile"],
		queryFn: getPartnerProfile,
	});
	const profile = profileQuery.data?.profile;

	if (profileQuery.isPending || (profile && profile.status !== "APPROVED")) {
		return (
			<PartnerWorkspaceLoading
				title="Checking booking access"
				description="Only approved partners can open booking operations."
			/>
		);
	}

	if (profileQuery.isError || !profile) {
		return (
			<PartnerStatusGate
				title="Partner status unavailable"
				description="We could not confirm your booking workspace access. Refresh and try again."
				action={
					<Button type="button" onClick={() => profileQuery.refetch()}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
				}
			/>
		);
	}

	return <PartnerBookingsContent user={user} profile={profile} />;
}

function PartnerBookingsContent({
	user,
	profile,
}: {
	user: Parameters<Parameters<typeof PartnerAccessBoundary>[0]["children"]>[0];
	profile: PartnerProfile;
}) {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [draftSearch, setDraftSearch] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
	const [orderBy, setOrderBy] = useState<BookingOrderBy>("createdAt");
	const [order, setOrder] = useState<BookingSortOrder>("desc");
	const [selectedBooking, setSelectedBooking] = useState<BookingSummary | null>(
		null,
	);
	const bookingListParams = useMemo(
		() => ({
			page,
			limit: PARTNER_BOOKINGS_LIMIT,
			search: search || undefined,
			status: status === "ALL" ? undefined : status,
			orderBy,
			order,
		}),
		[order, orderBy, page, search, status],
	);
	const bookingsQuery = useQuery({
		queryKey: bookingQueryKeys.partnerList(bookingListParams),
		queryFn: () => listPartnerBookings(bookingListParams),
		staleTime: BOOKING_QUERY_STALE_TIME_MS,
		gcTime: BOOKING_QUERY_GC_TIME_MS,
		retry: shouldRetryBookingQuery,
		placeholderData: keepPreviousData,
	});
	const updateMutation = useMutation({
		mutationFn: (payload: UpdatePartnerBookingStatusPayload) =>
			updatePartnerBookingStatus({
				bookingId: selectedBooking?.id ?? "",
				payload,
			}),
		onMutate: async (payload) => {
			const target = selectedBooking;

			if (!target) {
				return { previousLists: [] };
			}

			await queryClient.cancelQueries({
				queryKey: bookingQueryKeys.partnerLists(),
			});

			const previousLists =
				queryClient.getQueriesData<ListBookingsResponse>({
					queryKey: bookingQueryKeys.partnerLists(),
				});

			queryClient.setQueriesData<ListBookingsResponse>(
				{ queryKey: bookingQueryKeys.partnerLists() },
				(existing) =>
					existing
						? {
								...existing,
								items: existing.items.map((booking) =>
									booking.id === target.id
										? {
												...booking,
												status: payload.status,
												cancellationReason: payload.reason ?? null,
												cancelledAt: payload.status.startsWith("CANCELLED")
													? new Date().toISOString()
													: booking.cancelledAt,
												completedAt:
													payload.status === "COMPLETED"
														? new Date().toISOString()
														: booking.completedAt,
											}
										: booking,
								),
							}
						: existing,
			);

			return { previousLists };
		},
		onSuccess: (response) => {
			toast.success(response.message, {
				description: "The booking timeline has been updated.",
			});
			setSelectedBooking(null);
			queryClient.setQueriesData<ListBookingsResponse>(
				{ queryKey: bookingQueryKeys.partnerLists() },
				(existing) =>
					existing
						? {
								...existing,
								items: existing.items.map((booking) =>
									booking.id === response.booking.id
										? response.booking
										: booking,
								),
							}
						: existing,
			);
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
				predicate: (query) =>
					query.queryKey.includes(response.booking.productId),
			});
		},
		onError: (error, _payload, context) => {
			context?.previousLists.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data);
			});

			const message =
				error instanceof ApiRequestError
					? error.message
					: "Booking status could not be updated.";

			toast.error("Status update failed", { description: message });
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.partnerLists(),
				refetchType: "inactive",
			});
		},
	});
	const bookings = bookingsQuery.data?.items ?? [];
	const meta = bookingsQuery.data?.meta;
	const totalPages = meta?.totalPages ?? 1;
	const pageNumbers = useMemo(
		() => getPaginationItems(page, totalPages),
		[page, totalPages],
	);

	useEffect(() => {
		if (!bookingsQuery.data?.meta.hasNextPage) {
			return;
		}

		const nextParams = { ...bookingListParams, page: page + 1 };

		void queryClient.prefetchQuery({
			queryKey: bookingQueryKeys.partnerList(nextParams),
			queryFn: () => listPartnerBookings(nextParams),
			staleTime: BOOKING_QUERY_STALE_TIME_MS,
		});
	}, [
		bookingListParams,
		bookingsQuery.data?.meta.hasNextPage,
		page,
		queryClient,
	]);

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
		<PortalShell
			variant="partner"
			user={user}
			eyebrow="Booking operations"
			title="Bookings"
			description="Review booking visibility for your listings and keep operational statuses current."
			homeHref="/partner/dashboard"
			homeLabel="Dashboard"
			navigation={partnerPortalNavigation}
			metrics={[
				{
					label: "Bookings in view",
					value: String(meta?.total ?? 0),
					description: "Filtered customer booking requests.",
					icon: CalendarCheck2,
				},
				{
					label: "Partner type",
					value: profile.partnerType,
					description: "Approved booking operations profile.",
					icon: ShieldCheck,
				},
			]}
		>
			<section className={styles.page}>
				<form className={styles.toolbar} onSubmit={handleSearch}>
					<Input
						type="search"
						value={draftSearch}
						icon={<Search aria-hidden="true" />}
						placeholder="Search booking, customer, listing, city..."
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
									<SelectItem value="ALL">All statuses</SelectItem>
									<SelectItem value="PENDING">Pending</SelectItem>
									<SelectItem value="CONFIRMED">Confirmed</SelectItem>
									<SelectItem value="COMPLETED">Completed</SelectItem>
									<SelectItem value="REJECTED">Rejected</SelectItem>
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
									<SelectItem value="createdAt">Newest</SelectItem>
									<SelectItem value="startDate">Start date</SelectItem>
									<SelectItem value="totalAmount">Total</SelectItem>
									<SelectItem value="status">Status</SelectItem>
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
					<PartnerBookingsSkeleton />
				) : bookingsQuery.isError ? (
					<BookingState
						title="Bookings could not load"
						message="Refresh the booking workspace to retrieve customer activity."
						onAction={() => void bookingsQuery.refetch()}
					/>
				) : bookings.length ? (
					<>
						<div className={styles.tablePanel}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>Booking</th>
										<th>Customer</th>
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
													{booking.customer?.fullName ?? "Customer"}
												</strong>
												<span>{booking.customer?.email ?? "Hidden"}</span>
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
													onClick={() => setSelectedBooking(booking)}
												>
													<ShieldCheck aria-hidden="true" />
													Manage
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
						title="No bookings found"
						message="Customer requests for your listings will appear here."
						onAction={resetFilters}
					/>
				)}
			</section>

			<PartnerBookingStatusDialog
				booking={selectedBooking}
				isSubmitting={updateMutation.isPending}
				onOpenChange={(isOpen) => {
					if (!isOpen && !updateMutation.isPending) {
						setSelectedBooking(null);
					}
				}}
				onConfirm={(payload) => updateMutation.mutate(payload)}
			/>
		</PortalShell>
	);
}

function PartnerBookingsSkeleton() {
	return (
		<div className={styles.tablePanel}>
			<div className={styles.skeletonTable}>
				<Skeleton className={styles.skeletonHeader} />
				{Array.from({ length: 7 }).map((_, index) => (
					<Skeleton key={index} className={styles.skeletonRow} />
				))}
			</div>
		</div>
	);
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
			<CalendarCheck2 aria-hidden="true" />
			<h2>{title}</h2>
			<p>{message}</p>
			<Button type="button" className={styles.primaryButton} onClick={onAction}>
				<RefreshCcw aria-hidden="true" />
				Refresh
			</Button>
		</section>
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
		<nav className={styles.pagination} aria-label="Partner booking pages">
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

	if (start > 2) pages.push("ellipsis");
	for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
		pages.push(pageNumber);
	}
	if (end < totalPages - 1) pages.push("ellipsis");
	pages.push(totalPages);

	return pages;
}
