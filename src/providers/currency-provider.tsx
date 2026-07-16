"use client";

import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import {
	currentExchangeRateQueryKey,
	getCurrentExchangeRate,
} from "@/services/api/exchange-rates";

export type DisplayCurrency = "USD" | "RWF";

type CurrencyContextValue = {
	currency: DisplayCurrency;
	setCurrency: (currency: DisplayCurrency) => void;
	formatMoney: (value: string | number, sourceCurrency: string) => string;
	isRateReady: boolean;
	rate: string | null;
};

const STORAGE_KEY = "pluto-display-currency-v1";
const CURRENCY_CHANGE_EVENT = "pluto:display-currency-change";
const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const formatters = new Map<DisplayCurrency, Intl.NumberFormat>();

export function CurrencyProvider({ children }: { children: ReactNode }) {
	const currency = useSyncExternalStore<DisplayCurrency>(
		subscribeToCurrency,
		readStoredCurrency,
		() => "USD",
	);
	const exchangeRateQuery = useQuery({
		queryKey: currentExchangeRateQueryKey,
		queryFn: getCurrentExchangeRate,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 1,
	});

	const setCurrency = useCallback((nextCurrency: DisplayCurrency) => {
		window.localStorage.setItem(STORAGE_KEY, nextCurrency);
		window.dispatchEvent(new Event(CURRENCY_CHANGE_EVENT));
	}, []);

	const formatMoney = useCallback(
		(value: string | number, sourceCurrency: string) => {
			const normalizedSource = sourceCurrency === "RWF" ? "RWF" : "USD";
			const sourceMinor = parseMajorToMinor(value, normalizedSource);
			if (sourceMinor === null) return `${sourceCurrency} ${value}`;

			let displayMinor = sourceMinor;
			if (normalizedSource !== currency) {
				const rate = exchangeRateQuery.data?.rate;
				if (!rate) return formatMinor(sourceMinor, normalizedSource);
				displayMinor = convertMinor(sourceMinor, normalizedSource, currency, rate);
			}

			return formatMinor(displayMinor, currency);
		},
		[currency, exchangeRateQuery.data?.rate],
	);

	const value = useMemo(
		() => ({
			currency,
			setCurrency,
			formatMoney,
			isRateReady: Boolean(exchangeRateQuery.data?.rate),
			rate: exchangeRateQuery.data?.rate ?? null,
		}),
		[currency, exchangeRateQuery.data?.rate, formatMoney, setCurrency],
	);

	return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

function readStoredCurrency(): DisplayCurrency {
	const value = window.localStorage.getItem(STORAGE_KEY);
	return value === "RWF" ? "RWF" : "USD";
}

function subscribeToCurrency(onStoreChange: () => void) {
	window.addEventListener("storage", onStoreChange);
	window.addEventListener(CURRENCY_CHANGE_EVENT, onStoreChange);
	return () => {
		window.removeEventListener("storage", onStoreChange);
		window.removeEventListener(CURRENCY_CHANGE_EVENT, onStoreChange);
	};
}

export function useCurrency() {
	const context = useContext(CurrencyContext);
	if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
	return context;
}

function parseMajorToMinor(
	value: string | number,
	currency: DisplayCurrency,
): bigint | null {
	const normalized = String(value).trim();
	const match = /^(\d+)(?:\.(\d+))?$/.exec(normalized);
	if (!match) return null;

	const fractionDigits = currency === "USD" ? 2 : 0;
	const fraction = match[2] ?? "";
	const paddedFraction = `${fraction}${"0".repeat(fractionDigits)}`.slice(
		0,
		fractionDigits,
	);
	let minor = BigInt(match[1]) * BigInt(10) ** BigInt(fractionDigits);
	minor += paddedFraction ? BigInt(paddedFraction) : BigInt(0);

	const nextDigit = Number(fraction[fractionDigits] ?? "0");
	return nextDigit >= 5 ? minor + BigInt(1) : minor;
}

function convertMinor(
	amount: bigint,
	from: DisplayCurrency,
	to: DisplayCurrency,
	rate: string,
) {
	const parsedRate = parsePositiveDecimal(rate);
	if (!parsedRate) return amount;

	if (from === "USD" && to === "RWF") {
		return divideRoundHalfUp(
			amount * parsedRate.numerator,
			BigInt(100) * parsedRate.scale,
		);
	}

	return divideRoundHalfUp(
		amount * BigInt(100) * parsedRate.scale,
		parsedRate.numerator,
	);
}

function parsePositiveDecimal(value: string) {
	const match = /^(\d+)(?:\.(\d+))?$/.exec(value);
	if (!match) return null;
	const fraction = match[2] ?? "";
	const scale = BigInt(10) ** BigInt(fraction.length);
	const numerator = BigInt(`${match[1]}${fraction}`);
	return numerator > BigInt(0) ? { numerator, scale } : null;
}

function divideRoundHalfUp(numerator: bigint, denominator: bigint) {
	return (
		(numerator * BigInt(2) + denominator) / (denominator * BigInt(2))
	);
}

function formatMinor(amount: bigint, currency: DisplayCurrency) {
	const fractionDigits = currency === "USD" ? 2 : 0;
	const maximumSafeMinor = BigInt(Number.MAX_SAFE_INTEGER);
	if (amount > maximumSafeMinor) return `${currency} ${amount.toString()}`;
	let formatter = formatters.get(currency);
	if (!formatter) {
		formatter = new Intl.NumberFormat("en-RW", {
			style: "currency",
			currency,
			minimumFractionDigits: fractionDigits,
			maximumFractionDigits: fractionDigits,
		});
		formatters.set(currency, formatter);
	}
	return formatter.format(Number(amount) / 10 ** fractionDigits);
}
