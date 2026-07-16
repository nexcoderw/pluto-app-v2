export type CurrentExchangeRateResponse = {
	baseCurrency: "USD";
	quoteCurrency: "RWF";
	rate: string;
	source: "MANUAL_CONFIG" | "NATIONAL_BANK_OF_RWANDA";
	effectiveAt: string;
	expiresAt: string | null;
};
