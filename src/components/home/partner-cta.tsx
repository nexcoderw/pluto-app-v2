import Link from "next/link";
import {
	ArrowRight,
	BadgeCheck,
	Building2,
	CarFront,
	ClipboardCheck,
	Hotel,
	House,
	Store,
} from "lucide-react";
import styles from "./partner-cta.module.css";

const partnerCategories = [
	{ label: "Cars", icon: CarFront },
	{ label: "Apartments", icon: Building2 },
	{ label: "Hotel rooms", icon: Hotel },
	{ label: "Stays", icon: House },
] as const;

export function PartnerCta() {
	return (
		<section className={styles.section} aria-labelledby="partner-cta">
			<div className={styles.content}>
				<span className={styles.eyebrow}>
					<BadgeCheck aria-hidden="true" />
					Partner with Pluto Booking
				</span>
				<h2 id="partner-cta">List your car, apartment, room, or stay</h2>
				<p>
					Join as an individual or business partner, complete verification, and
					manage customer-ready listings from one partner workspace.
				</p>

				<div className={styles.categoryRail} aria-label="Partner categories">
					{partnerCategories.map((category) => {
						const Icon = category.icon;

						return (
							<span key={category.label}>
								<Icon aria-hidden="true" />
								{category.label}
							</span>
						);
					})}
				</div>
			</div>

			<div className={styles.partnerCard}>
				<span className={styles.cardIcon}>
					<ClipboardCheck aria-hidden="true" />
				</span>
				<div className={styles.steps}>
					<span>
						<strong>01</strong>
						Complete partner profile
					</span>
					<span>
						<strong>02</strong>
						Submit listings for review
					</span>
					<span>
						<strong>03</strong>
						Manage bookings after approval
					</span>
				</div>

				<Link href="/register" className={styles.action}>
					<Store aria-hidden="true" />
					Become a partner
					<ArrowRight aria-hidden="true" />
				</Link>
			</div>
		</section>
	);
}
