import type { ReactNode } from 'react';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicNavbar } from '@/components/shared/public-navbar';

export default function PublicLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<PublicNavbar />
			{children}
			<PublicFooter />
		</>
	);
}
