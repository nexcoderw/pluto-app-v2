import Image from "next/image";
import Link from "next/link";
import {
	ArrowUpRight,
	Building2,
	CarFront,
	Hotel,
	House,
	Plane,
	type LucideIcon,
} from "lucide-react";
import styles from "./popular-categories.module.css";

type PopularCategory = {
	id: string;
	title: string;
	image: string;
	description: string;
	href: string;
	action: string;
	icon: LucideIcon;
	imagePosition: string;
};

const categories: PopularCategory[] = [
	{
		id: "cars",
		title: "Car rentals",
		image: "/services/car-rent.png",
		description: "Cars for city trips and weekend escapes.",
		href: "/listings/cars",
		action: "Explore cars",
		icon: CarFront,
		imagePosition: "center 58%",
	},
	{
		id: "apartments",
		title: "Apartments",
		image: "/services/apartment.png",
		description: "Your own space for short or longer visits.",
		href: "/listings/apartments",
		action: "Explore apartments",
		icon: Building2,
		imagePosition: "center 42%",
	},
	{
		id: "hotels",
		title: "Hotel rooms",
		image: "/services/hotel.png",
		description: "A comfortable base for work or a quick break.",
		href: "/listings/hotel-rooms",
		action: "Explore hotel rooms",
		icon: Hotel,
		imagePosition: "72% center",
	},
	{
		id: "airbnb",
		title: "Airbnb stays",
		image: "/services/airbnb.png",
		description: "Welcoming homes for time away together.",
		href: "/listings/airbnb",
		action: "Explore Airbnb stays",
		icon: House,
		imagePosition: "31% center",
	},
	{
		id: "flights",
		title: "Flight booking",
		image: "/services/flight.png",
		description: "Plan your route and request your next flight.",
		href: "/flights",
		action: "Explore flights",
		icon: Plane,
		imagePosition: "center 50%",
	},
];

export function PopularCategories() {
	return (
		<section className={styles.section} aria-labelledby="popular-categories">
			<div className={styles.header}>
				<div className={styles.introduction}>
					<h2 id="popular-categories">Popular categories</h2>
					<p>
						Find a car, a place to stay, or your next flight.
					</p>
				</div>
				<Link href="/listings" className={styles.browseLink}>
					Browse all listings
					<ArrowUpRight aria-hidden="true" />
				</Link>
			</div>

			<div className={styles.grid}>
				{categories.map((category) => (
					<PopularCategoryCard key={category.id} category={category} />
				))}
			</div>
		</section>
	);
}

function PopularCategoryCard({ category }: { category: PopularCategory }) {
	const Icon = category.icon;
	const content = (
		<>
			<div className={styles.media}>
				<Image
					src={category.image}
					alt=""
					fill
					sizes="(max-width: 540px) 88px, (max-width: 760px) 45vw, (max-width: 1100px) 30vw, 18vw"
					style={{ objectPosition: category.imagePosition }}
				/>
			</div>
			<div className={styles.copy}>
				<div className={styles.titleRow}>
					<Icon aria-hidden="true" />
					<h3>{category.title}</h3>
				</div>
				<p className={styles.description}>{category.description}</p>
				<span className={styles.action}>
					{category.action}
					<ArrowUpRight aria-hidden="true" />
				</span>
			</div>
		</>
	);

	return (
		<Link
			href={category.href}
			className={styles.card}
			data-category={category.id}
			aria-label={category.action}
		>
			{content}
		</Link>
	);
}
