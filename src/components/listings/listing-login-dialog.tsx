"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { UserLoginResponse } from "@/services/api/auth";
import styles from "./listing-login-dialog.module.css";

type ListingLoginDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listingTitle: string;
};

export function ListingLoginDialog({
	open,
	onOpenChange,
	listingTitle,
}: ListingLoginDialogProps) {
	const router = useRouter();

	function handleLoginSuccess(response: UserLoginResponse) {
		onOpenChange(false);

		if (response.user.requiresPhoneNumber) {
			router.push("/complete-phone");
			return;
		}

		router.refresh();
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.dialog}>
				<DialogHeader className={styles.header}>
					<span className={styles.iconWrap} aria-hidden="true">
						<CheckCircle2 />
					</span>
					<DialogTitle>Reserve with your account</DialogTitle>
					<DialogDescription>
						Sign in securely and continue reserving {listingTitle} without
						leaving this page.
					</DialogDescription>
				</DialogHeader>
				<LoginForm
					title="Welcome back"
					description="Use your Pluto Booking account to unlock reservations, saved details, and faster checkout."
					successDescription="You can now reserve this apartment from the current page."
					onSuccess={handleLoginSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}
