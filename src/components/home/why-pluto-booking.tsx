import {
	BadgeCheck,
	Headphones,
	LockKeyhole,
	MousePointer,
	ReceiptText,
	ShieldCheck,
} from "lucide-react";
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
			<div className={styles.intro}>
				<span className={styles.eyebrow}>
					<MousePointer aria-hidden="true" />
					Why Pluto Booking
				</span>
				<h2 id="why-pluto-booking">Confidence before every booking</h2>
				<p>
					Pluto Booking keeps the experience focused on verified inventory,
					clear pricing, and support that understands local travel details.
				</p>

				<div className={styles.assurancePanel}>
					<span className={styles.assuranceIcon}>
						<ShieldCheck aria-hidden="true" />
					</span>
					<div>
						<strong>Reviewed marketplace</strong>
						<small>
							Partners, listings, and sensitive account actions are handled
							through controlled approval and audit workflows.
						</small>
					</div>
				</div>
			</div>

			<div className={styles.grid}>
				{trustItems.map((item, index) => {
					const Icon = item.icon;

					return (
						<article key={item.title} className={styles.item}>
							<span className={styles.itemIndex}>
								{String(index + 1).padStart(2, "0")}
							</span>
							<div className={styles.itemCopy}>
								<span className={styles.iconWrap}>
									<Icon aria-hidden="true" />
								</span>
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
