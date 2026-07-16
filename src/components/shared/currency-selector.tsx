"use client";

import { Coins } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCurrency, type DisplayCurrency } from "@/providers/currency-provider";
import styles from "./currency-selector.module.css";

export function CurrencySelector({ inverted = false }: { inverted?: boolean }) {
	const { currency, setCurrency } = useCurrency();

	return (
		<div className={styles.wrapper} data-inverted={inverted}>
			<Coins aria-hidden="true" />
			<span className="sr-only" id={`display-currency-${inverted ? "home" : "public"}`}>
				Display currency
			</span>
			<Select
				value={currency}
				onValueChange={(value) => setCurrency(value as DisplayCurrency)}
			>
				<SelectTrigger
					size="sm"
					className={styles.trigger}
					aria-labelledby={`display-currency-${inverted ? "home" : "public"}`}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent align="end">
					<SelectItem value="USD">USD</SelectItem>
					<SelectItem value="RWF">RWF</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
