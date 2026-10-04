import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import styles from '@/components/auth/auth-shell.module.css';
import { PublicFooter } from '@/components/shared/public-footer';

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<main className={styles.page}>{children}</main>
			<PublicFooter />
		</>
	);
}
