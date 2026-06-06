import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
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
	title: string;
	subtitle: string;
	href?: string;
	action: string;
	icon: LucideIcon;
	imagePosition: string;
	code: string;
	meta: string;
	isComingSoon?: boolean;
};

const categories: PopularCategory[] = [
	{
		title: "Rent a car",
		subtitle: "City rides",
		href: "/listings/cars",
		action: "Book car",
		icon: CarFront,
		imagePosition: "center 58%",
		code: "CAR",
		meta: "Verified",
	},
	{
		title: "Find an apartment",
		subtitle: "Private stays",
		href: "/listings/apartments",
		action: "Book apartment",
		icon: Building2,
		imagePosition: "center 42%",
		code: "APT",
		meta: "Homes",
	},
	{
		title: "Book a hotel room",
		subtitle: "Easy check-ins",
		href: "/listings/hotel-rooms",
		action: "Book room",
		icon: Hotel,
		imagePosition: "72% center",
		code: "HTL",
		meta: "Rooms",
	},
	{
		title: "Stay in an Airbnb",
		subtitle: "Hosted homes",
		href: "/listings/airbnb",
		action: "Book stay",
		icon: House,
		imagePosition: "31% center",
		code: "BNB",
		meta: "Local",
	},
	{
		title: "Flight booking",
		subtitle: "Coming soon",
		action: "Coming soon",
		icon: Plane,
		imagePosition: "center 50%",
		code: "FLY",
		meta: "Soon",
		isComingSoon: true,
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
					return (
						<PopularCategoryCard key={category.title} category={category} />
					);
				})}
			</div>
		</section>
	);
}

function PopularCategoryCard({ category }: { category: PopularCategory }) {
	const Icon = category.icon;
	const content = (
		<>
			<span className={styles.media}>
				<Image
					src="/hero/hero.jpg"
					alt=""
					fill
					sizes="(max-width: 980px) 42vw, 20vw"
					style={{ objectPosition: category.imagePosition }}
				/>
				<span className={styles.tint} aria-hidden="true" />
			</span>

			<span className={styles.statusPill}>
				{category.isComingSoon ? (
					<Clock3 aria-hidden="true" />
				) : (
					<Icon aria-hidden="true" />
				)}
				{category.isComingSoon ? "Soon" : "Popular"}
			</span>

			<span className={styles.copy}>
				<span>
					<strong>{category.title}</strong>
					<small>{category.subtitle}</small>
				</span>

				<span className={styles.metaRow}>
					<span>
						<Icon aria-hidden="true" />
						{category.code}
					</span>
					<span>{category.meta}</span>
				</span>

				<span className={styles.action} data-disabled={category.isComingSoon}>
					{category.action}
					{category.isComingSoon ? null : <ArrowRight aria-hidden="true" />}
				</span>
			</span>
		</>
	);

	if (category.isComingSoon || !category.href) {
		return (
			<article
				className={styles.card}
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
			aria-label={`${category.action} on Pluto Booking`}
		>
			{content}
		</Link>
	);
}
