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
	intent?: "reserve" | "favorite";
	onAuthenticated?: (response: UserLoginResponse) => void;
};

export function ListingLoginDialog({
	open,
	onOpenChange,
	listingTitle,
	intent = "reserve",
	onAuthenticated,
}: ListingLoginDialogProps) {
	const router = useRouter();
	const isFavoriteIntent = intent === "favorite";

	function handleLoginSuccess(response: UserLoginResponse) {
		onAuthenticated?.(response);
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
					<DialogTitle>
						{isFavoriteIntent
							? "Save with your account"
							: "Reserve with your account"}
					</DialogTitle>
					<DialogDescription>
						{isFavoriteIntent
							? `Sign in securely and Pluto Booking will save ${listingTitle} to your favorites automatically.`
							: `Sign in securely and continue reserving ${listingTitle} without leaving this page.`}
					</DialogDescription>
				</DialogHeader>
				<LoginForm
					title="Welcome back"
					description={
						isFavoriteIntent
							? "Use your Pluto Booking account to save listings and keep them ready for later."
							: "Use your Pluto Booking account to unlock reservations, saved details, and faster checkout."
					}
					successDescription={
						isFavoriteIntent
							? "You are signed in. Saving this listing now."
							: "You can now reserve this listing from the current page."
					}
					onSuccess={handleLoginSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}
