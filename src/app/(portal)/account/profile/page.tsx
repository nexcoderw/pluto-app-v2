import type { Metadata } from "next";
import { AccountProfilePage } from "@/components/account/profile/account-profile-page";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Profile Settings | Pluto Booking",
	description:
		"Update your Pluto Booking customer profile, contact information, and profile image.",
};

export default function CustomerProfileRoute() {
	return (
		<div className={styles.container}>
			<AccountProfilePage />
		</div>
	);
}
