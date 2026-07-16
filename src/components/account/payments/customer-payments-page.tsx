"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	CalendarDays,
	CheckCircle2,
	Clock3,
	CreditCard,
	Loader2,
	ReceiptText,
	RefreshCcw,
	ShieldCheck,
	WalletCards,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ApiRequestError } from "@/services/api/errors";
import {
	listPaymentIntents,
	paymentQueryKeys,
	reconcilePaymentIntent,
	type ListPaymentIntentsResponse,
	type PaymentIntent,
	type PaymentIntentStatus,
} from "@/services/api/payments";
import { formatMoney } from "@/components/listings/listing-formatters";
import { CustomerPaymentsSkeleton } from "./customer-payments-skeleton";
import styles from "./customer-payments-page.module.css";

const PAGE_LIMIT = 8;
const statusOptions: Array<{
	label: string;
	value: PaymentIntentStatus | "ALL";
}> = [
	{ label: "All payments", value: "ALL" },
	{ label: "Processing", value: "PROCESSING" },
	{ label: "Still confirming", value: "UNKNOWN" },
	{ label: "Paid", value: "SUCCEEDED" },
	{ label: "Failed", value: "FAILED" },
	{ label: "Expired", value: "EXPIRED" },
];

export function CustomerPaymentsPage() {
	return (
		<PortalAccessBoundary allowedRole="CUSTOMER">
			{(user) => (
				<CustomerPortalShell user={user}>
					<CustomerPaymentsContent />
				</CustomerPortalShell>
			)}
		</PortalAccessBoundary>
	);
}

function CustomerPaymentsContent() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<PaymentIntentStatus | "ALL">("ALL");
	const queryClient = useQueryClient();
	const params = useMemo(
		() => ({
			page,
			limit: PAGE_LIMIT,
			status: status === "ALL" ? undefined : status,
		}),
		[page, status],
	);
	const paymentsQuery = useQuery({
		queryKey: paymentQueryKeys.list(params),
		queryFn: () => listPaymentIntents(params),
		staleTime: 15_000,
		refetchInterval: (query) =>
			query.state.data?.items.some((payment) => isPending(payment.status))
				? 10_000
				: false,
		retry: (failureCount, error) =>
			error instanceof ApiRequestError && error.statusCode
				? error.statusCode >= 500 && failureCount < 2
				: failureCount < 2,
	});
	const reconcileMutation = useMutation({
		mutationFn: reconcilePaymentIntent,
		onSuccess: (response) => {
			queryClient.setQueryData(
				paymentQueryKeys.detail(response.payment.id),
				response,
			);
			queryClient.setQueriesData<ListPaymentIntentsResponse>(
				{ queryKey: paymentQueryKeys.lists() },
				(existing) =>
					existing
						? {
								...existing,
								items: existing.items.map((payment) =>
									payment.id === response.payment.id
										? response.payment
										: payment,
								),
							}
						: existing,
			);
			toast.success("Payment status refreshed", {
				description: response.message,
			});
		},
		onError: (error) => {
			const apiError = error instanceof ApiRequestError ? error : undefined;
			toast.error("Status could not be refreshed", {
				description:
					apiError?.message ??
					"Your saved status is still available. Try again shortly.",
			});
		},
	});

	if (paymentsQuery.isPending) return <CustomerPaymentsSkeleton />;

	const payments = paymentsQuery.data?.items ?? [];
	const meta = paymentsQuery.data?.meta;

	return (
		<section className={styles.page}>
			<header className={styles.header}>
				<div>
					<span>
						<WalletCards aria-hidden="true" />
						Canonical payment history
					</span>
					<h1>Payments</h1>
					<p>
						Track verified payments, mobile-money attempts, and payments that
						are still being confirmed. This page never relies on browser or
						provider-screen claims.
					</p>
				</div>
				<strong>{meta?.total ?? 0} records</strong>
			</header>

			<div className={styles.toolbar}>
				<div>
					<ShieldCheck aria-hidden="true" />
					<span>All amounts and statuses come from Pluto Booking.</span>
				</div>
				<Select
					value={status}
					onValueChange={(value) => {
						setStatus(value as PaymentIntentStatus | "ALL");
						setPage(1);
					}}
				>
					<SelectTrigger className={styles.selectTrigger}>
						<CreditCard aria-hidden="true" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent align="end" alignItemWithTrigger={false}>
						<SelectGroup>
							{statusOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			{paymentsQuery.isError ? (
				<PaymentState
					icon={AlertCircle}
					title="Payments could not load"
					message="Your payment records remain safely stored. Refresh this page to retrieve the latest status."
					actionLabel="Refresh payments"
					onAction={() => void paymentsQuery.refetch()}
				/>
			) : payments.length ? (
				<>
					<div className={styles.grid} aria-live="polite">
						{payments.map((payment) => (
							<PaymentCard
								key={payment.id}
								payment={payment}
								isChecking={
									reconcileMutation.isPending &&
									reconcileMutation.variables === payment.id
								}
								onCheckStatus={() => reconcileMutation.mutate(payment.id)}
							/>
						))}
					</div>
					{meta && meta.totalPages > 1 ? (
						<nav className={styles.pagination} aria-label="Payment pages">
							<Button
								type="button"
								variant="outline"
								className={styles.secondaryButton}
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
								className={styles.secondaryButton}
								disabled={!meta.hasNextPage}
								onClick={() => setPage((current) => current + 1)}
							>
								Next
								<ArrowRight aria-hidden="true" />
							</Button>
						</nav>
					) : null}
				</>
			) : (
				<PaymentState
					icon={ReceiptText}
					title={status === "ALL" ? "No payment records yet" : "No payments match this status"}
					message={
						status === "ALL"
							? "When you accept a secure listing quote, its payment progress will appear here."
							: "Choose another status to review the rest of your payment history."
					}
					actionLabel={status === "ALL" ? "Browse listings" : "Show all payments"}
					actionHref={status === "ALL" ? "/listings" : undefined}
					onAction={
						status === "ALL"
							? undefined
							: () => {
									setStatus("ALL");
									setPage(1);
								}
					}
				/>
			)}
		</section>
	);
}

function PaymentCard({
	payment,
	isChecking,
	onCheckStatus,
}: {
	payment: PaymentIntent;
	isChecking: boolean;
	onCheckStatus: () => void;
}) {
	const display = paymentDisplay(payment.status);
	const Icon = display.icon;
	const product = payment.priceQuote.product;
	const latestAttempt = payment.attempts[0];

	return (
		<article className={styles.card} data-tone={display.tone}>
			<header>
				<span className={styles.statusIcon}>
					<Icon aria-hidden="true" />
				</span>
				<div>
					<span>{display.label}</span>
					<strong>{payment.intentNo}</strong>
				</div>
				<time dateTime={payment.createdAt}>{formatDate(payment.createdAt)}</time>
			</header>
			<div className={styles.amount}>
				<span>Canonical amount</span>
				<strong>{formatMoney(payment.amountMinor, payment.currency)}</strong>
				{payment.priceQuote.sourceSubtotalMinor && payment.priceQuote.sourceCurrency ? (
					<small>
						Original listing amount: {formatMinorMoney(
							payment.priceQuote.sourceSubtotalMinor,
							payment.priceQuote.sourceCurrency,
						)}
						{payment.priceQuote.exchangeRateValue
							? ` · 1 USD = ${formatRate(payment.priceQuote.exchangeRateValue)} RWF`
							: ""}
					</small>
				) : null}
			</div>
			<div className={styles.details}>
				<div>
					<span>Listing</span>
					<strong>{product?.title ?? "Listing checkout"}</strong>
				</div>
				<div>
					<span>Dates</span>
					<strong>{formatRange(payment.priceQuote.startDate, payment.priceQuote.endDate)}</strong>
				</div>
				<div>
					<span>Method</span>
					<strong>{formatNetwork(payment.network)}</strong>
				</div>
				<div>
					<span>Account</span>
					<strong>{latestAttempt?.maskedAccount ?? "Not submitted"}</strong>
				</div>
			</div>
			<p className={styles.guidance}>{display.guidance}</p>
			<footer>
				{isPending(payment.status) ? (
					<Button
						type="button"
						className={styles.primaryButton}
						disabled={isChecking}
						onClick={onCheckStatus}
					>
						{isChecking ? (
							<Loader2 className={styles.spin} aria-hidden="true" />
						) : (
							<RefreshCcw aria-hidden="true" />
						)}
						<span className={isChecking ? styles.srOnly : undefined}>
							Check status
						</span>
					</Button>
				) : payment.bookingId ? (
					<Button className={styles.primaryButton} render={<Link href="/account/bookings" />}>
						<CalendarDays aria-hidden="true" />
						View booking
					</Button>
				) : (
					<Button className={styles.secondaryButton} variant="outline" render={<Link href="/listings" />}>
						<ArrowRight aria-hidden="true" />
						Browse listings
					</Button>
				)}
			</footer>
		</article>
	);
}

function PaymentState({
	icon: Icon,
	title,
	message,
	actionLabel,
	actionHref,
	onAction,
}: {
	icon: typeof AlertCircle;
	title: string;
	message: string;
	actionLabel: string;
	actionHref?: string;
	onAction?: () => void;
}) {
	return (
		<div className={styles.state}>
			<Icon aria-hidden="true" />
			<h2>{title}</h2>
			<p>{message}</p>
			{actionHref ? (
				<Button className={styles.primaryButton} render={<Link href={actionHref} />}>
					<ArrowRight aria-hidden="true" />
					{actionLabel}
				</Button>
			) : (
				<Button type="button" className={styles.primaryButton} onClick={onAction}>
					<RefreshCcw aria-hidden="true" />
					{actionLabel}
				</Button>
			)}
		</div>
	);
}

function paymentDisplay(status: PaymentIntentStatus) {
	if (status === "SUCCEEDED") {
		return {
			label: "Paid",
			tone: "success",
			icon: CheckCircle2,
			guidance: "Payment was verified and the linked booking was confirmed.",
		};
	}
	if (status === "UNKNOWN") {
		return {
			label: "Still confirming",
			tone: "warning",
			icon: Clock3,
			guidance: "Do not pay again. Pluto Booking is reconciling this attempt safely.",
		};
	}
	if (["CREATED", "ACTION_REQUIRED", "PROCESSING"].includes(status)) {
		return {
			label: status === "ACTION_REQUIRED" ? "Action required" : "Processing",
			tone: "pending",
			icon: WalletCards,
			guidance: "Complete the mobile-money prompt and wait for verified confirmation.",
		};
	}
	if (status === "PARTIALLY_REFUNDED" || status === "REFUNDED") {
		return {
			label: status === "REFUNDED" ? "Refunded" : "Partially refunded",
			tone: "neutral",
			icon: ReceiptText,
			guidance: "The backend has recorded this refund state against the original payment.",
		};
	}
	return {
		label: status.toLowerCase().replaceAll("_", " "),
		tone: "danger",
		icon: AlertCircle,
		guidance:
			status === "FAILED"
				? "Payment was not completed. If funds appear to have moved, contact support before retrying."
				: "No booking was confirmed from this payment state.",
	};
}

function isPending(status: PaymentIntentStatus): boolean {
	return ["CREATED", "ACTION_REQUIRED", "PROCESSING", "UNKNOWN"].includes(status);
}

function formatNetwork(network: PaymentIntent["network"]): string {
	if (network === "MTN_MOMO") return "MTN MoMo";
	if (network === "AIRTEL_MONEY") return "Airtel Money";
	return "Not submitted";
}

function formatDate(value: string): string {
	return new Intl.DateTimeFormat("en-RW", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function formatMinorMoney(value: string, currency: string) {
	const amount = Number(value);
	const divisor = currency === "USD" ? 100 : 1;
	return new Intl.NumberFormat("en-RW", {
		style: "currency",
		currency,
		minimumFractionDigits: currency === "USD" ? 2 : 0,
		maximumFractionDigits: currency === "USD" ? 2 : 0,
	}).format(amount / divisor);
}

function formatRate(value: string) {
	return new Intl.NumberFormat("en-RW", {
		minimumFractionDigits: 3,
		maximumFractionDigits: 8,
	}).format(Number(value));
}

function formatRange(start: string | null, end: string | null): string {
	if (!start || !end) return "Dates unavailable";
	const formatter = new Intl.DateTimeFormat("en-RW", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
	return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
}
