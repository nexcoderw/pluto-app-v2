import type { Metadata } from 'next';
import { AccountReadyPanel } from './account-ready-panel';
import styles from './portal-placeholder.module.css';

export const metadata: Metadata = {
	title: 'Account',
	description: 'Your Pluto Booking customer account.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function AccountPage() {
	return (
		<main className={styles.page}>
			<AccountReadyPanel />
		</main>
	);
}
