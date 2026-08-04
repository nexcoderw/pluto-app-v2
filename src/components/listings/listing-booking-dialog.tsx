"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	AlertCircle,
	CalendarCheck,
	CheckCircle2,
	Clock3,
	Loader2,
	Phone,
	ReceiptText,
	RefreshCcw,
	ShieldCheck,
	Smartphone,
	WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	PaymentIntent,
	PaymentNetwork,
	PriceQuote,
} from "@/services/api/payments";
import { formatMoney } from "./listing-formatters";
import styles from "./listing-booking-dialog.module.css";

export type ListingBookingDialogMode =
	| "quote-loading"
	| "quote"
	| "payment-submitting"
	| "processing"
	| "unknown"
	| "success"
	| "failed"
	| "expired"
	| "error";

type ListingBookingDialogProps = {
	open: boolean;
	mode: ListingBookingDialogMode;
	listingTitle: string;
	formattedRange: string;
	durationCount: number;
	durationLabel: string;
	estimatedTotal: number;
	quote?: PriceQuote;
	rateChangedFrom?: string;
	payment?: PaymentIntent;
	defaultPhone: string;
	errorMessage?: string;
	supportReference?: string;
	isCheckingStatus: boolean;
	onOpenChange: (open: boolean) => void;
	onPay: (input: {
		network: PaymentNetwork;
		phoneNumber: string;
	}) => void;
	onCheckStatus: () => void;
	onRetryPayment: () => void;
	onRefreshQuote: () => void;
	onAcknowledgeRateChange: () => void;
	onRetryDates: () => void;
};

export function ListingBookingDialog({
	open,
	mode,
	listingTitle,
	formattedRange,
	durationCount,
	durationLabel,
	estimatedTotal,
	quote,
	rateChangedFrom,
	payment,
	defaultPhone,
	errorMessage,
	supportReference,
	isCheckingStatus,
	onOpenChange,
	onPay,
	onCheckStatus,
	onRetryPayment,
	onRefreshQuote,
	onAcknowledgeRateChange,
	onRetryDates,
}: ListingBookingDialogProps) {
	const [network, setNetwork] = useState<PaymentNetwork>("MTN_MOMO");
	const [phoneNumber, setPhoneNumber] = useState(
		() => toLocalRwandanPhone(defaultPhone) ?? defaultPhone,
	);
	const [phoneError, setPhoneError] = useState<string>();
	const localPhonePreview = toLocalRwandanPhone(phoneNumber);
	const [acceptedTermsQuoteId, setAcceptedTermsQuoteId] = useState<string>();
	const [termsErrorQuoteId, setTermsErrorQuoteId] = useState<string>();
	const [now, setNow] = useState(() => Date.now());
	const isBlockingProgress =
		mode === "quote-loading" || mode === "payment-submitting";
	const quoteExpired = Boolean(
		quote && new Date(quote.expiresAt).getTime() <= now,
	);
	const termsAccepted = Boolean(
		quote?.id && acceptedTermsQuoteId === quote.id,
	);
	const termsError =
		quote?.id && termsErrorQuoteId === quote.id
			? "Confirm that you reviewed the booking conditions and exact amount."
			: undefined;
	const secondsRemaining = quote
		? Math.max(0, Math.ceil((new Date(quote.expiresAt).getTime() - now) / 1_000))
		: 0;

	useEffect(() => {
		if (!open || !quote || mode !== "quote") return;
		const timer = window.setInterval(() => setNow(Date.now()), 1_000);
		return () => window.clearInterval(timer);
	}, [mode, open, quote]);

	useEffect(() => {
		const normalizedProfilePhone = toLocalRwandanPhone(defaultPhone);
		if (normalizedProfilePhone) setPhoneNumber(normalizedProfilePhone);
	}, [defaultPhone]);

	function submitPayment() {
		const normalizedPhone = toLocalRwandanPhone(phoneNumber);
		if (!normalizedPhone) {
			setPhoneError("Enter exactly 10 digits, for example 0780371519.");
			return;
		}
		if (!termsAccepted) {
			setTermsErrorQuoteId(quote?.id);
			return;
		}
		setPhoneError(undefined);
		setTermsErrorQuoteId(undefined);
		setPhoneNumber(normalizedPhone);
		onPay({ network, phoneNumber: normalizedPhone });
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isBlockingProgress) onOpenChange(nextOpen);
			}}
		>
			<DialogContent
				className={styles.dialog}
				showCloseButton={!isBlockingProgress}
				aria-busy={isBlockingProgress}
			>
				<div className={styles.liveRegion} aria-live="polite" aria-atomic="true">
					{statusAnnouncement(mode)}
				</div>

				{mode === "quote-loading" ? (
					<ProgressState
						title="Securing your dates"
						description="We are checking availability and calculating the exact server-owned price. No payment is being taken yet."
					/>
				) : null}

				{mode === "quote" && quote ? (
					<>
						<DialogHeader className={styles.header}>
							<span className={styles.iconWrap} data-tone="confirm">
								<ShieldCheck aria-hidden="true" />
							</span>
							<DialogTitle>
								{rateChangedFrom
									? "Exchange rate changed—review required"
									: "Review your secure quote"}
							</DialogTitle>
							<DialogDescription>
								Pluto Booking reserved these dates temporarily. Confirm the exact
								amount below before starting mobile-money payment.
							</DialogDescription>
						</DialogHeader>
						<QuoteSummary
							listingTitle={listingTitle}
							formattedRange={formattedRange}
							durationCount={durationCount}
							durationLabel={durationLabel}
							estimatedTotal={estimatedTotal}
							quote={quote}
						/>
						{rateChangedFrom && quote.exchangeRateValue ? (
							<section className={styles.rateChangeWarning} role="alert">
								<AlertCircle aria-hidden="true" />
								<div>
									<strong>A fresh quote uses a different exchange rate</strong>
									<p>
										Previous: 1 USD = {formatRate(rateChangedFrom)} RWF. New: 1
										USD = {formatRate(quote.exchangeRateValue)} RWF. Review the
										converted amount before payment.
									</p>
								</div>
							</section>
						) : null}
						<div className={styles.expiry} data-expiring={secondsRemaining < 120}>
							<Clock3 aria-hidden="true" />
							<span>
								{quoteExpired
									? "This quote has expired. Request a fresh quote."
									: `Reserved for ${formatCountdown(secondsRemaining)}`}
							</span>
						</div>
						{rateChangedFrom ? (
							<DialogFooter className={styles.footerSingle}>
								<Button
									type="button"
									className={styles.primaryButton}
									onClick={onAcknowledgeRateChange}
								>
									<ShieldCheck aria-hidden="true" />
									I reviewed the new rate
								</Button>
							</DialogFooter>
						) : quoteExpired ? (
							<DialogFooter className={styles.footerSingle}>
								<Button
									type="button"
									className={styles.primaryButton}
									onClick={onRefreshQuote}
								>
									<RefreshCcw aria-hidden="true" />
									Request fresh quote
								</Button>
							</DialogFooter>
						) : (
							<>
								<div className={styles.paymentFields}>
									<label>
										<span>Mobile-money network</span>
										<Select
											value={network}
											onValueChange={(value) =>
												setNetwork(value as PaymentNetwork)
											}
										>
											<SelectTrigger className={styles.selectTrigger}>
												<WalletCards aria-hidden="true" />
												<SelectValue />
											</SelectTrigger>
											<SelectContent align="start" alignItemWithTrigger={false}>
												<SelectGroup>
													<SelectItem value="MTN_MOMO">MTN MoMo</SelectItem>
													<SelectItem value="AIRTEL_MONEY">
														Airtel Money
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</label>
									<label>
										<span>Payment phone number</span>
										<Input
											type="tel"
											inputMode="tel"
											autoComplete="tel"
											icon={<Phone aria-hidden="true" />}
											value={phoneNumber}
											placeholder="0780371519"
											aria-invalid={Boolean(phoneError)}
											aria-describedby={
												phoneError ? "payment-phone-error" : "payment-phone-format"
											}
											onChange={(event) => {
												setPhoneNumber(event.target.value);
												setPhoneError(undefined);
											}}
										/>
										{phoneError ? (
											<small id="payment-phone-error" className={styles.fieldError}>
												{phoneError}
											</small>
										) : localPhonePreview ? (
											<small id="payment-phone-format" className={styles.fieldHint}>
												Sending as {localPhonePreview} and 250
												{localPhonePreview.slice(1)}.
											</small>
										) : null}
									</label>
								</div>
								<div
									className={styles.termsAcceptance}
									data-invalid={Boolean(termsError)}
								>
									<Checkbox
										id="listing-payment-terms"
										checked={termsAccepted}
										aria-invalid={Boolean(termsError)}
										onCheckedChange={(checked) => {
											setAcceptedTermsQuoteId(
												checked ? quote.id : undefined,
											);
											setTermsErrorQuoteId(undefined);
										}}
									/>
									<label htmlFor="listing-payment-terms">
										I reviewed the dates, booking and cancellation conditions,
										and the exact amount shown above.
									</label>
								</div>
								{termsError ? (
									<small className={styles.termsError} role="alert">
										{termsError}
									</small>
								) : null}
								<p className={styles.paymentNotice}>
									<Smartphone aria-hidden="true" />
									The displayed amount is the exact Pluto collection amount. Your
									provider may add its transaction fee. Approve the prompt on your
									phone, and never share your PIN with Pluto Booking or support.
								</p>
								<DialogFooter className={styles.footer}>
									<Button
										type="button"
										variant="outline"
										className={styles.secondaryButton}
										onClick={() => onOpenChange(false)}
									>
										<CalendarCheck aria-hidden="true" />
										Review dates
									</Button>
									<Button
										type="button"
										className={styles.primaryButton}
										onClick={submitPayment}
									>
										<ShieldCheck aria-hidden="true" />
									Continue to MoMo
									</Button>
								</DialogFooter>
							</>
						)}
					</>
				) : null}

				{mode === "payment-submitting" ? (
					<ProgressState
						title="Starting secure payment"
						description="We are creating one protected payment attempt for the exact quote. Keep this window open and watch your phone."
						quote={quote}
					/>
				) : null}

				{mode === "processing" || mode === "unknown" ? (
					<PaymentPendingState
						unknown={mode === "unknown"}
						payment={payment}
						isCheckingStatus={isCheckingStatus}
						onCheckStatus={onCheckStatus}
					/>
				) : null}

				{mode === "success" ? (
					<>
						<DialogHeader className={styles.header}>
							<span className={styles.iconWrap} data-tone="success">
								<CheckCircle2 aria-hidden="true" />
							</span>
							<DialogTitle>Payment and booking confirmed</DialogTitle>
							<DialogDescription>
								Your payment was verified by Pluto Booking and your reservation is
								now confirmed. A receipt email is being delivered separately.
							</DialogDescription>
						</DialogHeader>
						<ReferenceBox payment={payment} tone="success" />
						<DialogFooter className={styles.footer}>
							<Button
								type="button"
								variant="outline"
								className={styles.secondaryButton}
								onClick={() => onOpenChange(false)}
							>
								<CheckCircle2 aria-hidden="true" />
								Done
							</Button>
							<Button className={styles.primaryButton} render={<Link href="/account/bookings" />}>
								<ReceiptText aria-hidden="true" />
								View booking
							</Button>
						</DialogFooter>
					</>
				) : null}

				{mode === "failed" ? (
					<>
						<StateHeader
							tone="error"
							title="Payment was not completed"
							description="No booking was confirmed. Review the mobile-money number before starting one new attempt. If funds appear to have moved, check status instead of paying again."
						/>
						<ReferenceBox payment={payment} tone="error" />
						<DialogFooter className={styles.footer}>
							<Button
								type="button"
								variant="outline"
								className={styles.secondaryButton}
								onClick={onCheckStatus}
								disabled={isCheckingStatus}
							>
								{isCheckingStatus ? (
									<Loader2 className={styles.spin} aria-hidden="true" />
								) : (
									<RefreshCcw aria-hidden="true" />
								)}
								<span className={isCheckingStatus ? styles.srOnly : undefined}>
									Check status
								</span>
							</Button>
							<Button
								type="button"
								className={styles.primaryButton}
								onClick={onRetryPayment}
							>
								<Smartphone aria-hidden="true" />
								Review and retry
							</Button>
						</DialogFooter>
					</>
				) : null}

				{mode === "expired" || mode === "error" ? (
					<>
						<StateHeader
							tone="error"
							title={mode === "expired" ? "Reservation hold expired" : "Checkout needs attention"}
							description={
								errorMessage ??
								"We could not continue checkout safely. Review the dates and try again."
							}
						/>
						{supportReference ? (
							<p className={styles.supportReference}>
								Support reference: <strong>{supportReference}</strong>
							</p>
						) : null}
						<DialogFooter className={styles.footer}>
							<Button
								type="button"
								variant="outline"
								className={styles.secondaryButton}
								onClick={onRetryDates}
							>
								<CalendarCheck aria-hidden="true" />
								Choose dates
							</Button>
							<Button
								type="button"
								className={styles.primaryButton}
								onClick={onRefreshQuote}
							>
								<RefreshCcw aria-hidden="true" />
								Try fresh quote
							</Button>
						</DialogFooter>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

function toLocalRwandanPhone(value: string): string | null {
	const compact = value.trim().replace(/[\s()-]/g, "").replace(/^\+/, "");
	const local = compact.startsWith("250") ? `0${compact.slice(3)}` : compact;
	return /^07\d{8}$/.test(local) ? local : null;
}

function ProgressState({
	title,
	description,
	quote,
}: {
	title: string;
	description: string;
	quote?: PriceQuote;
}) {
	return (
		<>
			<DialogHeader className={styles.header}>
				<span className={styles.iconWrap} data-tone="progress">
					<Loader2 aria-hidden="true" />
				</span>
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<div className={styles.progressTrack} aria-hidden="true">
				<span />
			</div>
			{quote ? (
				<p className={styles.progressAmount}>
					Exact amount: <strong>{formatMoney(quote.totalMinor, quote.currency)}</strong>
				</p>
			) : null}
		</>
	);
}

function PaymentPendingState({
	unknown,
	payment,
	isCheckingStatus,
	onCheckStatus,
}: {
	unknown: boolean;
	payment?: PaymentIntent;
	isCheckingStatus: boolean;
	onCheckStatus: () => void;
}) {
	return (
		<>
			<StateHeader
				tone={unknown ? "warning" : "progress"}
				title={unknown ? "Still confirming your payment" : "Approve payment on your phone"}
				description={
					unknown
						? "The provider has not returned a final result. Do not pay again. We will keep checking safely and email you when the status changes."
						: "Complete the mobile-money prompt. This screen updates from Pluto Booking's verified payment status, not from the browser."
				}
			/>
			<ReferenceBox payment={payment} tone={unknown ? "warning" : "pending"} />
			<DialogFooter className={styles.footer}>
				<Button
					variant="outline"
					className={styles.secondaryButton}
					render={<Link href="/account/payments" />}
				>
					<ReceiptText aria-hidden="true" />
					View payments
				</Button>
				<Button
					type="button"
					className={styles.primaryButton}
					onClick={onCheckStatus}
					disabled={isCheckingStatus}
				>
					{isCheckingStatus ? (
						<Loader2 className={styles.spin} aria-hidden="true" />
					) : (
						<RefreshCcw aria-hidden="true" />
					)}
					<span className={isCheckingStatus ? styles.srOnly : undefined}>
						Refresh status
					</span>
				</Button>
			</DialogFooter>
		</>
	);
}

function StateHeader({
	tone,
	title,
	description,
}: {
	tone: "error" | "warning" | "progress";
	title: string;
	description: string;
}) {
	const Icon = tone === "warning" ? Clock3 : tone === "progress" ? Smartphone : AlertCircle;
	return (
		<DialogHeader className={styles.header}>
			<span className={styles.iconWrap} data-tone={tone}>
				<Icon aria-hidden="true" />
			</span>
			<DialogTitle>{title}</DialogTitle>
			<DialogDescription>{description}</DialogDescription>
		</DialogHeader>
	);
}

function QuoteSummary({
	listingTitle,
	formattedRange,
	durationCount,
	durationLabel,
	estimatedTotal,
	quote,
}: {
	listingTitle: string;
	formattedRange: string;
	durationCount: number;
	durationLabel: string;
	estimatedTotal: number;
	quote: PriceQuote;
}) {
	const sourceCurrency = quote.sourceCurrency ?? quote.currency;
	const rateLabel = quote.exchangeRateValue
		? `1 USD = ${formatRate(quote.exchangeRateValue)} RWF`
		: null;
	const lineItems = useMemo(
		() => [
			["Listing", listingTitle],
			["Dates", formattedRange],
			["Duration", `${durationCount} ${durationLabel}`],
			["Browser estimate", formatMoney(String(estimatedTotal), sourceCurrency)],
			...(quote.sourceSubtotalMinor
				? [["Listing price", formatMinorMoney(quote.sourceSubtotalMinor, sourceCurrency)]]
				: []),
			...(rateLabel ? [["Locked exchange rate", rateLabel]] : []),
			["Converted subtotal", formatMoney(quote.subtotalMinor, quote.currency)],
			["Pluto service fee", formatMoney(quote.serviceFeeMinor, quote.currency)],
			["Tax", formatMoney(quote.taxMinor, quote.currency)],
			[
				`Estimated provider fee (${formatBasisPoints(quote.providerFeeEstimateBps)})`,
				formatMoney(quote.providerFeeEstimateMinor, quote.currency),
			],
		],
		[
			durationCount,
			durationLabel,
			estimatedTotal,
			formattedRange,
			listingTitle,
			quote,
			rateLabel,
			sourceCurrency,
		],
	);

	return (
		<section className={styles.summary}>
			{lineItems.map(([label, value]) => (
				<div key={label}>
					<span>{label}</span>
					<strong>{value}</strong>
				</div>
			))}
			<div className={styles.totalRow}>
				<span>Estimated phone debit</span>
				<strong>
					{formatMoney(quote.estimatedCustomerDebitMinor, quote.currency)}
				</strong>
			</div>
			<p className={styles.estimateNote}>
				Pluto sends {formatMoney(quote.totalMinor, quote.currency)} for collection.
				The provider fee is a configurable estimate because XentriPay does not
				publish its collection fee formula in the supplied contract. Your phone
				prompt is authoritative. This quote is locked until {formatExpiryTime(quote.expiresAt)}.
				Quote {quote.quoteNo}.
			</p>
		</section>
	);
}

function formatExpiryTime(value: string) {
	return new Intl.DateTimeFormat("en-RW", {
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value));
}

function formatMinorMoney(value: string, currency: string) {
	const minor = Number(value);
	if (!Number.isSafeInteger(minor)) return `${currency} ${value}`;
	const fractionDigits = currency === "USD" ? 2 : 0;
	return new Intl.NumberFormat("en-RW", {
		style: "currency",
		currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(minor / 10 ** fractionDigits);
}

function formatRate(value: string) {
	const rate = Number(value);
	if (!Number.isFinite(rate)) return value;
	return new Intl.NumberFormat("en-RW", {
		minimumFractionDigits: 3,
		maximumFractionDigits: 8,
	}).format(rate);
}

function formatBasisPoints(value: number): string {
	return `${(value / 100).toFixed(value % 100 === 0 ? 0 : 2)}%`;
}

function ReferenceBox({
	payment,
	tone,
}: {
	payment?: PaymentIntent;
	tone: "success" | "pending" | "warning" | "error";
}) {
	return (
		<div className={styles.referenceBox} data-tone={tone}>
			<span>Pluto payment reference</span>
			<strong>{payment?.intentNo ?? "Preparing reference"}</strong>
			{payment ? (
				<small>
					{formatMoney(payment.amountMinor, payment.currency)} · {formatStatus(payment.status)}
				</small>
			) : null}
		</div>
	);
}

function formatCountdown(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatStatus(status: PaymentIntent["status"]): string {
	return status.toLowerCase().replaceAll("_", " ");
}

function statusAnnouncement(mode: ListingBookingDialogMode): string {
	const messages: Record<ListingBookingDialogMode, string> = {
		"quote-loading": "Checking availability and preparing your secure quote.",
		quote: "Your secure quote is ready for review.",
		"payment-submitting": "Starting your secure mobile-money payment.",
		processing: "Payment is processing. Approve the prompt on your phone.",
		unknown: "Payment is still being confirmed. Do not pay again.",
		success: "Payment verified and booking confirmed.",
		failed: "Payment was not completed.",
		expired: "The reservation hold has expired.",
		error: "Checkout needs your attention.",
	};
	return messages[mode];
}
