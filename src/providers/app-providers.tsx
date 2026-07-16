'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { CurrencyProvider } from './currency-provider';

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<QueryProvider>
			<CurrencyProvider>{children}</CurrencyProvider>
		</QueryProvider>
	);
}
