const BASIS_POINTS_SCALE = 10_000;

export const publicPaymentFeePolicy = Object.freeze({
	collectionFeeBps: requiredBasisPoints(
		process.env.NEXT_PUBLIC_XENTRIPAY_COLLECTION_FEE_BPS,
		"NEXT_PUBLIC_XENTRIPAY_COLLECTION_FEE_BPS",
		2_500,
	),
	taxBps: requiredBasisPoints(
		process.env.NEXT_PUBLIC_PAYMENT_TAX_BPS,
		"NEXT_PUBLIC_PAYMENT_TAX_BPS",
		10_000,
	),
});

export function quickPayableEstimate(
	amount: number,
	currency: string,
): number {
	if (!Number.isFinite(amount) || amount <= 0) return amount;

	const currencyScale = currency === "USD" ? 100 : 1;
	const subtotalMinor = Math.round(amount * currencyScale);
	const taxMinor = percentageMinor(
		subtotalMinor,
		publicPaymentFeePolicy.taxBps,
	);
	const collectionFeeMinor = percentageMinor(
		subtotalMinor + taxMinor,
		publicPaymentFeePolicy.collectionFeeBps,
	);
	return (subtotalMinor + taxMinor + collectionFeeMinor) / currencyScale;
}

function requiredBasisPoints(
	value: string | undefined,
	name: string,
	maximum: number,
): number {
	if (!value?.trim()) throw new Error(`${name} is required.`);

	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 0 || parsed > maximum) {
		throw new Error(`${name} must be an integer basis-point value.`);
	}
	return parsed;
}

function percentageMinor(amountMinor: number, basisPoints: number): number {
	return Math.ceil((amountMinor * basisPoints) / BASIS_POINTS_SCALE);
}
