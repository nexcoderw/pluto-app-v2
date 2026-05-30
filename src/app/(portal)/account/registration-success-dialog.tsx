'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { UserAuthProfile } from '@/services/api/auth';
import styles from './portal-placeholder.module.css';

const REDIRECT_DELAY_SECONDS = 5;

type RegistrationSuccessDialogProps = {
	open: boolean;
	user: UserAuthProfile | null;
};

export function RegistrationSuccessDialog({
	open,
	user,
}: RegistrationSuccessDialogProps) {
	const router = useRouter();
	const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);

	// Redirect timer: only runs after a fresh successful customer registration.
	useEffect(() => {
		if (!open) {
			return;
		}

		const redirectTimer = window.setTimeout(() => {
			router.replace('/');
		}, REDIRECT_DELAY_SECONDS * 1000);

		const countdownTimer = window.setInterval(() => {
			setSecondsLeft((value) => Math.max(0, value - 1));
		}, 1000);

		return () => {
			window.clearTimeout(redirectTimer);
			window.clearInterval(countdownTimer);
		};
	}, [open, router]);

	return (
		<Dialog open={open}>
			<DialogContent
				className={styles.successDialog}
				showCloseButton={false}
				aria-describedby="registration-success-description"
			>
				<div className={styles.successIcon}>
					<ShieldCheck aria-hidden="true" />
				</div>
				<DialogHeader className={styles.successHeader}>
					<DialogTitle>
						{user?.fullName ? `Welcome, ${user.fullName}` : 'Your account is ready'}
					</DialogTitle>
					<DialogDescription id="registration-success-description">
						Your Pluto Booking customer account has been created. You can explore
						listings now, or we will take you to the homepage in {secondsLeft}s.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className={styles.successFooter}>
					<Link href="/" className={styles.action}>
						<Search aria-hidden="true" />
						Explore Pluto Booking
						<ArrowRight aria-hidden="true" />
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
