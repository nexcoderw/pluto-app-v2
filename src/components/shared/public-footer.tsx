import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Building2,
	CarFront,
	Hotel,
	House,
	Mail,
	MapPin,
	ShieldCheck,
	type LucideIcon,
} from "lucide-react";
import styles from "./public-footer.module.css";

const listingLinks = [
	{ href: "/marketplace?category=CAR", label: "Cars", icon: CarFront },
	{
		href: "/marketplace?category=APARTMENT",
		label: "Apartments",
		icon: Building2,
	},
	{
		href: "/marketplace?category=HOTEL_ROOM",
		label: "Hotel rooms",
		icon: Hotel,
	},
	{
		href: "/marketplace?category=AIRBNB_HOUSE",
		label: "AirBnB homes",
		icon: House,
	},
] as const;

const companyLinks = [
	{ href: "/register", label: "Create account", icon: ArrowRight },
	{ href: "/login", label: "Sign in", icon: ShieldCheck },
	{ href: "/partner-register", label: "List with Pluto", icon: Building2 },
	{
		href: "mailto:support@plutobooking.com",
		label: "Contact support",
		icon: Mail,
	},
] as const;

export function PublicFooter() {
	return (
		<footer className={styles.footer}>
			<div className={styles.wordmark} aria-hidden="true">
				PLUTO
			</div>

			<div className={styles.inner}>
				<section className={styles.topGrid}>
					<div className={styles.brandBlock}>
						<Image
							src="/logo-b.png"
							alt="Pluto Booking"
							width={630}
							height={185}
						/>
						<p>
							A secure booking marketplace for verified partners, thoughtful
							stays, reliable cars, and customer accounts built around trust.
						</p>
						<div className={styles.location}>
							<MapPin aria-hidden="true" />
							<span>Kigali, Rwanda</span>
						</div>
					</div>

					<div className={styles.newsletter}>
						<span>Newsletter</span>
						<h2>Get new verified listings and partner updates.</h2>
						<p>
							Monthly product notes, approved listing drops, and platform
							improvements. No noise.
						</p>
						<form>
							<label className="sr-only" htmlFor="footer-newsletter-email">
								Email address
							</label>
							<input
								id="footer-newsletter-email"
								type="email"
								placeholder="Email address"
							/>
							<button type="submit">
								Subscribe
								<ArrowRight aria-hidden="true" />
							</button>
						</form>
					</div>
				</section>

				<section className={styles.linkGrid} aria-label="Footer navigation">
					<FooterColumn title="Listings" links={listingLinks} />
					<FooterColumn title="Pluto Booking" links={companyLinks} />
				</section>

				<div className={styles.bottomBar}>
					<p>
						© {new Date().getFullYear()} Pluto Booking. All rights reserved.
					</p>
					<a href="https://www.nexcode.africa" target="_blank" rel="noreferrer">
						Developed by NEXCODE Africa
					</a>
				</div>
			</div>
		</footer>
	);
}

function FooterColumn({
	title,
	links,
}: {
	title: string;
	links: ReadonlyArray<{
		href: string;
		label: string;
		icon: LucideIcon;
	}>;
}) {
	return (
		<div className={styles.linkColumn}>
			<h2>{title}</h2>
			{links.map((link) => {
				const Icon = link.icon;

				return (
					<Link key={link.href} href={link.href}>
						<Icon aria-hidden="true" />
						{link.label}
					</Link>
				);
			})}
		</div>
	);
}
