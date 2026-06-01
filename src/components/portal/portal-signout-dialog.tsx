'use client';

import { LogOut, ShieldAlert, X } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import styles from './portal-shell.module.css';

type PortalSignoutDialogProps = {
	open: boolean;
	isSigningOut: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
};

export function PortalSignoutDialog({
	open,
	isSigningOut,
	onOpenChange,
	onConfirm,
}: PortalSignoutDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className={styles.logoutDialog}>
				<AlertDialogHeader>
					<div className={styles.logoutDialogIcon} aria-hidden="true">
						<ShieldAlert />
					</div>
					<AlertDialogTitle>Sign out of Pluto Booking?</AlertDialogTitle>
					<AlertDialogDescription>
						Your secure session will end on this device. You will return to the
						homepage, and protected portal pages will require a new sign in.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isSigningOut}>
						<X aria-hidden="true" />
						Stay signed in
					</AlertDialogCancel>
					<AlertDialogAction
						disabled={isSigningOut}
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						<LogOut aria-hidden="true" />
						{isSigningOut ? 'Signing out...' : 'Sign out'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
