import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRight,
	Building2,
	CarFront,
	Hotel,
	House,
	Search,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Book Trusted Stays and Rentals",
	description:
		"Discover trusted cars, apartments, hotel rooms, and stays on Pluto Booking.",
};

export default function HomePage() {
	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<div className={styles.heroCopy}>
					<span className={styles.eyebrow}>Travel listings</span>
					<h1>Book the right place, ride, or room with confidence.</h1>
					<p>
						Pluto Booking helps customers find reviewed properties and rentals
						while giving partners a clean path to list their spaces
						professionally.
					</p>
					<div className={styles.actions}>
						<Link href="/listings" className={styles.primaryAction}>
							<ArrowRight aria-hidden="true" />
							Explore listings
						</Link>
						<Link href="/register" className={styles.secondaryAction}>
							<Search aria-hidden="true" />
							Create account
						</Link>
					</div>
				</div>

				<div
					className={styles.bookingPanel}
					aria-label="Booking categories preview"
				>
					<div className={styles.panelHeader}>
						<span>Available soon</span>
						<strong>Curated listings</strong>
					</div>
					<div className={styles.categoryGrid}>
						<div>
							<CarFront aria-hidden="true" />
							<span>Cars</span>
						</div>
						<div>
							<Building2 aria-hidden="true" />
							<span>Apartments</span>
						</div>
						<div>
							<Hotel aria-hidden="true" />
							<span>Hotel rooms</span>
						</div>
						<div>
							<House aria-hidden="true" />
							<span>Airbnb homes</span>
						</div>
					</div>
					<div className={styles.trustLine}>
						<span />
						<p>Verified partner onboarding and secure customer accounts.</p>
					</div>
				</div>
			</section>
		</main>
	);
}
