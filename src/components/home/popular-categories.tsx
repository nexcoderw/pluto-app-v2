import Image from "next/image";
import Link from "next/link";
import {
	ArrowUpRight,
	Building2,
	CarFront,
	Clock3,
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
	occasion: string;
	href?: string;
	action: string;
	icon: LucideIcon;
	imagePosition: string;
	isComingSoon?: boolean;
};

const categories: PopularCategory[] = [
	{
		id: "cars",
		title: "Car rentals",
		image: "/services/car-rent.png",
		description: "Find a car for your plans, from getting around the city to heading out for the weekend.",
		occasion: "City trips and weekend escapes",
		href: "/listings/cars",
		action: "Explore cars",
		icon: CarFront,
		imagePosition: "center 58%",
	},
	{
		id: "apartments",
		title: "Apartments",
		image: "/services/apartment.png",
		description: "Settle into your own space, whether you’re visiting for a few days or staying a little longer.",
		occasion: "Work trips and longer visits",
		href: "/listings/apartments",
		action: "Explore apartments",
		icon: Building2,
		imagePosition: "center 42%",
	},
	{
		id: "hotels",
		title: "Hotel rooms",
		image: "/services/hotel.png",
		description: "Find a comfortable base for a quick stopover, a business trip, or a well-earned break.",
		occasion: "Short stays and stopovers",
		href: "/listings/hotel-rooms",
		action: "Explore hotel rooms",
		icon: Hotel,
		imagePosition: "72% center",
	},
	{
		id: "airbnb",
		title: "Airbnb stays",
		image: "/services/airbnb.png",
		description: "Make yourself at home. Explore places with room to unwind and share the trip with your favourite people.",
		occasion: "Family time and trips together",
		href: "/listings/airbnb",
		action: "Explore Airbnb stays",
		icon: House,
		imagePosition: "31% center",
	},
	{
		id: "flights",
		title: "Flight booking",
		image: "/services/flight.png",
		description: "Another way to plan your journey is on its way. Explore cars and stays while flight booking gets ready.",
		occasion: "Your next destination",
		action: "Coming soon",
		icon: Plane,
		imagePosition: "center 50%",
		isComingSoon: true,
	},
];

export function PopularCategories() {
	return (
		<section className={styles.section} aria-labelledby="popular-categories">
			<div className={styles.header}>
				<div className={styles.introduction}>
					<h2 id="popular-categories">Popular categories</h2>
					<p>
						Get around, settle in, or make yourself at home. Find the right
						fit for the way you travel.
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
					sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw"
					style={{ objectPosition: category.imagePosition }}
				/>
			</div>
			<div className={styles.copy}>
				<div className={styles.titleRow}>
					<Icon aria-hidden="true" />
					<h3>{category.title}</h3>
				</div>
				<p className={styles.description}>{category.description}</p>
				<p className={styles.occasion}>{category.occasion}</p>
				<span className={styles.action}>
					{category.action}
					{category.isComingSoon ? (
						<Clock3 aria-hidden="true" />
					) : (
						<ArrowUpRight aria-hidden="true" />
					)}
				</span>
			</div>
		</>
	);

	if (category.isComingSoon || !category.href) {
		return (
			<article
				className={styles.card}
				data-category={category.id}
				data-disabled="true"
				aria-label={`${category.title} is coming soon`}
			>
				{content}
			</article>
		);
	}

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
