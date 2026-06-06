import { BadgeCheck, Headphones, LockKeyhole, ReceiptText } from "lucide-react";
import styles from "./why-pluto-booking.module.css";

const trustItems = [
	{
		title: "Verified partners",
		description:
			"Every listed partner passes Pluto Booking review before going live.",
		icon: BadgeCheck,
	},
	{
		title: "Secure booking flow",
		description:
			"Protected account sessions keep each booking step controlled.",
		icon: LockKeyhole,
	},
	{
		title: "Local support",
		description: "Support built around Rwanda-first travel and rental needs.",
		icon: Headphones,
	},
	{
		title: "Transparent pricing",
		description: "Clear rates help you compare listings before you commit.",
		icon: ReceiptText,
	},
];

export function WhyPlutoBooking() {
	return (
		<section className={styles.section} aria-labelledby="why-pluto-booking">
			<div className={styles.heading}>
				<span>Why Pluto Booking</span>
				<h2 id="why-pluto-booking">Built for trusted local bookings</h2>
			</div>

			<div className={styles.grid}>
				{trustItems.map((item) => {
					const Icon = item.icon;

					return (
						<article key={item.title} className={styles.item}>
							<span className={styles.iconWrap}>
								<Icon aria-hidden="true" />
							</span>
							<div>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
}
