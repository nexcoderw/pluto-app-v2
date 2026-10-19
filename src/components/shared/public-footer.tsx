import Link from "next/link";
import {
	Facebook01Icon,
	InstagramIcon,
	Linkedin01Icon,
	NewTwitterIcon,
	TikTokIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	ArrowRight,
	Building2,
	CarFront,
	Hotel,
	House,
	Mail,
	Phone,
	Send,
	type LucideIcon,
} from "lucide-react";
import styles from "./public-footer.module.css";

const navigationLinks = [
	{ href: "/listings/cars", label: "Cars", icon: CarFront },
	{
		href: "/listings/apartments",
		label: "Apartments",
		icon: Building2,
	},
	{
		href: "/listings/hotel-rooms",
		label: "Hotel rooms",
		icon: Hotel,
	},
	{
		href: "/listings/airbnb",
		label: "AirBnB homes",
		icon: House,
	},
] as const;

const socialLinks = [
	{
		href: "https://www.facebook.com/profile.php?id=100080010090537",
		label: "Facebook",
		icon: Facebook01Icon,
	},
	{
		href: "https://x.com/plutobooking",
		label: "X",
		icon: NewTwitterIcon,
	},
	{
		href: "https://www.instagram.com/plutobookingss/",
		label: "Instagram",
		icon: InstagramIcon,
	},
	{
		href: "https://www.linkedin.com/company/plutobooking-com",
		label: "LinkedIn",
		icon: Linkedin01Icon,
	},
	{
		href: "https://www.tiktok.com/@plutobooking",
		label: "TikTok",
		icon: TikTokIcon,
	},
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
							<a href="tel:+250788221683">
								<Phone aria-hidden="true" />
								+250 788 221 683
							</a>
							<a href="mailto:plutobooking.info@gmail.com">
								<Mail aria-hidden="true" />
								plutobooking.info@gmail.com
							</a>
						</div>

						<div>
							<h2>Follow us</h2>
							{socialLinks.map((link) => {
								return (
									<a
										key={link.label}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
									>
										<HugeiconsIcon
											icon={link.icon}
											strokeWidth={2.2}
											aria-hidden="true"
										/>
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
					</nav>
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
