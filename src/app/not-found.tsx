import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Home, ListFilter, SearchX } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
	return (
		<main className={styles.page}>
			<section className={styles.panel} aria-labelledby="not-found-title">
				<div className={styles.logoMark}>
					<Image
						src="/logo-b.png"
						alt="Pluto Booking"
						width={132}
						height={44}
						priority
					/>
				</div>

				<div className={styles.statusBadge}>
					<SearchX aria-hidden="true" />
					<span>404</span>
				</div>

				<div className={styles.copy}>
					<span>Page not found</span>
					<h1 id="not-found-title">This Pluto Booking page moved</h1>
					<p>
						The address may be outdated, private, or no longer available. Start
						from the homepage or continue browsing active listings.
					</p>
				</div>

				<div className={styles.actionGrid}>
					<Link href="/" className={styles.primaryAction}>
						<Home aria-hidden="true" />
						Go home
						<ArrowRight aria-hidden="true" />
					</Link>
					<Link href="/listings/cars" className={styles.secondaryAction}>
						<ListFilter aria-hidden="true" />
						Browse listings
					</Link>
				</div>

				<div className={styles.hintCard}>
					<Compass aria-hidden="true" />
					<p>
						If you followed a saved partner or booking link, open your portal
						and retry from the latest workspace navigation.
					</p>
				</div>
			</section>
		</main>
	);
}
