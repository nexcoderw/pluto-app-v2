import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Building2,
	CarFront,
	Hotel,
	House,
	type LucideIcon,
} from "lucide-react";
import styles from "./popular-categories.module.css";

type PopularCategory = {
	title: string;
	description: string;
	href: string;
	action: string;
	icon: LucideIcon;
	imagePosition: string;
};

const categories: PopularCategory[] = [
	{
		title: "Rent a car",
		description:
			"Verified cars for city rides, airport trips, and longer routes.",
		href: "/listings/cars",
		action: "Browse cars",
		icon: CarFront,
		imagePosition: "center 58%",
	},
	{
		title: "Find an apartment",
		description: "Comfortable apartments for short stays and extended plans.",
		href: "/listings/apartments",
		action: "View apartments",
		icon: Building2,
		imagePosition: "center 42%",
	},
	{
		title: "Book a hotel room",
		description: "Hotel rooms reviewed for simple, reliable check-ins.",
		href: "/listings/hotel-rooms",
		action: "See hotel rooms",
		icon: Hotel,
		imagePosition: "72% center",
	},
	{
		title: "Stay in an Airbnb",
		description: "Private homes and hosted stays from approved partners.",
		href: "/listings/airbnb",
		action: "Explore stays",
		icon: House,
		imagePosition: "31% center",
	},
];

export function PopularCategories() {
	return (
		<section className={styles.section} aria-labelledby="popular-categories">
			<div className={styles.header}>
				<span>Popular categories</span>
				<h2 id="popular-categories">Start with what you need</h2>
			</div>

			<div className={styles.grid}>
				{categories.map((category) => {
					const Icon = category.icon;

					return (
						<Link
							key={category.href}
							href={category.href}
							className={styles.card}
							aria-label={`${category.action} on Pluto Booking`}
						>
							<span className={styles.media}>
								<Image
									src="/hero/hero.jpg"
									alt=""
									fill
									sizes="(max-width: 720px) 100vw, (max-width: 1180px) 50vw, 25vw"
									style={{ objectPosition: category.imagePosition }}
								/>
								<span className={styles.tint} aria-hidden="true" />
							</span>
							<span className={styles.copy}>
								<span className={styles.iconWrap}>
									<Icon aria-hidden="true" />
								</span>
								<strong>{category.title}</strong>
								<small>{category.description}</small>
								<span className={styles.action}>
									{category.action}
									<ArrowRight aria-hidden="true" />
								</span>
							</span>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
