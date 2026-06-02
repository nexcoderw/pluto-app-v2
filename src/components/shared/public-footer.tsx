import Link from "next/link";
import {
	ArrowRight,
	Building2,
	CarFront,
	Globe,
	Hotel,
	House,
	Mail,
	Phone,
	Send,
	Share2,
	type LucideIcon,
} from "lucide-react";
import styles from "./public-footer.module.css";

const navigationLinks = [
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

const socialLinks = [
	{ href: "https://www.instagram.com", label: "Instagram", icon: Share2 },
	{ href: "https://www.linkedin.com", label: "LinkedIn", icon: Globe },
] as const;

export function PublicFooter() {
	return (
		<footer className={styles.footer}>
			<div className={styles.panel}>
				<section className={styles.topGrid}>
					<div className={styles.callout}>
						<h2>Ready to plan your next booking?</h2>
						<p>
							Explore verified cars, apartments, hotel rooms, and AirBnB homes
							from trusted Pluto Booking partners.
						</p>
						<form className={styles.newsletter}>
							<label className="sr-only" htmlFor="footer-newsletter-email">
								Email address
							</label>
							<input
								id="footer-newsletter-email"
								type="email"
								placeholder="Join the newsletter"
								className={styles.newsletterInput}
								required
								autoComplete="email"
								aria-label="Email address for newsletter subscription"
							/>
							<button type="submit">
								Subscribe
								<ArrowRight aria-hidden="true" />
							</button>
						</form>
					</div>

					<FooterColumn title="Navigation" links={navigationLinks} />

					<div className={styles.contactColumn}>
						<div>
							<h2>Contact us</h2>
							<a href="tel:+250700000000">
								<Phone aria-hidden="true" />
								+250 700 000 000
							</a>
							<a href="mailto:support@plutobooking.com">
								<Mail aria-hidden="true" />
								support@plutobooking.com
							</a>
						</div>

						<div>
							<h2>Follow us</h2>
							{socialLinks.map((link) => {
								const Icon = link.icon;

								return (
									<a
										key={link.label}
										href={link.href}
										target="_blank"
										rel="noreferrer"
									>
										<Icon aria-hidden="true" />
										{link.label}
									</a>
								);
							})}
						</div>
					</div>
				</section>

				<div className={styles.bottomBar}>
					<p>
						© {new Date().getFullYear()} Pluto Booking. All rights reserved.
					</p>
					<nav aria-label="Footer legal links">
						<Link href="/terms">Terms of service</Link>
						<Link href="/privacy">Privacy policy</Link>
						<a
							href="https://www.nexcode.africa"
							target="_blank"
							rel="noreferrer"
						>
							Developed by NEXCODE Africa
						</a>
					</nav>
				</div>

				<div className={styles.wordmark} aria-hidden="true">
					PLUTO
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
			<Link href="/partner-register" className={styles.partnerLink}>
				<Send aria-hidden="true" />
				List with Pluto
			</Link>
		</div>
	);
}
