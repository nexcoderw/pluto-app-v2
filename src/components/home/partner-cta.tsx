import Link from "next/link";
import { ArrowRight, BadgeCheck, Store } from "lucide-react";
import styles from "./partner-cta.module.css";

export function PartnerCta() {
	return (
		<section className={styles.section} aria-labelledby="partner-cta">
			<div className={styles.copy}>
				<span>
					<BadgeCheck aria-hidden="true" />
					Partner with Pluto Booking
				</span>
				<h2 id="partner-cta">List your car, apartment, room, or stay</h2>
				<p>
					Join as an individual or business partner and publish verified
					listings for Pluto Booking customers.
				</p>
			</div>

			<Link href="/register" className={styles.action}>
				<Store aria-hidden="true" />
				Become a partner
				<ArrowRight aria-hidden="true" />
			</Link>
		</section>
	);
}
