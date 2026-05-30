import type { ReactNode } from 'react';
import styles from '@/components/auth/auth-shell.module.css';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicNavbar } from '@/components/shared/public-navbar';

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<PublicNavbar />
			<main className={styles.page}>{children}</main>
			<PublicFooter />
		</>
	);
}
