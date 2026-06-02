import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Bath,
	BedDouble,
	BriefcaseBusiness,
	CarFront,
	CheckCircle2,
	CircleDollarSign,
	DoorOpen,
	Fuel,
	Hotel,
	House,
	MapPin,
	ShieldCheck,
	Snowflake,
	Users,
	Utensils,
	Wifi,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import {
	formatMoney,
	formatPricingUnit,
	getListingCoverImage,
} from "./listing-formatters";
import styles from "./category-listing-cards.module.css";

type ListingCardProps = {
	listing: PublicListing;
	detailHref: string;
};

export function CarListingCard({ listing, detailHref }: ListingCardProps) {
	const details = listing.carDetails;

	return (
		<ListingCardFrame
			listing={listing}
			detailHref={detailHref}
			kind="car"
			label="Car rental"
			icon={<CarFront aria-hidden="true" />}
			specs={[
				{
					icon: <BriefcaseBusiness aria-hidden="true" />,
					label: details ? `${details.brand} ${details.model}` : "Vehicle",
				},
				{
					icon: <Users aria-hidden="true" />,
					label: details ? `${details.seats} seats` : "Seats listed",
				},
				{
					icon: <Fuel aria-hidden="true" />,
					label: details?.fuelType ?? "Fuel listed",
				},
			]}
			highlights={[
				details ? `${details.year}` : "Approved",
				details?.transmission ?? "Transmission ready",
				details?.driverIncluded ? "Driver included" : "Self-drive ready",
			]}
		/>
	);
}

export function ApartmentListingCard({
	listing,
	detailHref,
}: ListingCardProps) {
	const details = listing.apartmentDetails;

	return (
		<ListingCardFrame
			listing={listing}
			detailHref={detailHref}
			kind="apartment"
			label="Apartment"
			icon={<House aria-hidden="true" />}
			specs={[
				{
					icon: <BedDouble aria-hidden="true" />,
					label: details ? `${details.bedrooms} bedrooms` : "Bedrooms",
				},
				{
					icon: <Bath aria-hidden="true" />,
					label: details ? `${details.bathrooms} bathrooms` : "Bathrooms",
				},
				{
					icon: <Users aria-hidden="true" />,
					label: details ? `${details.maxGuests} guests` : "Guests",
				},
			]}
			highlights={[
				details?.furnished ? "Furnished" : "Unfurnished",
				details?.wifi ? "WiFi ready" : "WiFi not listed",
				details?.parking ? "Parking" : "Parking not listed",
			]}
		/>
	);
}

export function HotelRoomListingCard({
	listing,
	detailHref,
}: ListingCardProps) {
	const details = listing.hotelRoomDetails;

	return (
		<ListingCardFrame
			listing={listing}
			detailHref={detailHref}
			kind="hotel"
			label="Hotel room"
			icon={<Hotel aria-hidden="true" />}
			specs={[
				{
					icon: <DoorOpen aria-hidden="true" />,
					label: details?.roomType ?? "Room type",
				},
				{
					icon: <BedDouble aria-hidden="true" />,
					label: details?.bedType ?? "Bed type",
				},
				{
					icon: <Users aria-hidden="true" />,
					label: details ? `${details.maxGuests} guests` : "Guests",
				},
			]}
			highlights={[
				details?.hotelName ?? "Verified hotel",
				details?.breakfastIncluded
					? "Breakfast included"
					: "Breakfast optional",
				details?.hasAirConditioning ? "Air conditioned" : "Cooling not listed",
			]}
		/>
	);
}

export function AirbnbListingCard({ listing, detailHref }: ListingCardProps) {
	const details = listing.airbnbDetails;

	return (
		<ListingCardFrame
			listing={listing}
			detailHref={detailHref}
			kind="airbnb"
			label="AirBnB home"
			icon={<House aria-hidden="true" />}
			specs={[
				{
					icon: <BedDouble aria-hidden="true" />,
					label: details ? `${details.bedrooms} bedrooms` : "Bedrooms",
				},
				{
					icon: <Bath aria-hidden="true" />,
					label: details ? `${details.bathrooms} bathrooms` : "Bathrooms",
				},
				{
					icon: <Users aria-hidden="true" />,
					label: details ? `${details.maxGuests} guests` : "Guests",
				},
			]}
			highlights={[
				details?.houseType ?? "Private home",
				details?.entirePlace ? "Entire place" : "Shared access",
				details?.selfCheckIn ? "Self check-in" : "Hosted check-in",
			]}
		/>
	);
}

function ListingCardFrame({
	listing,
	detailHref,
	kind,
	label,
	icon,
	specs,
	highlights,
}: ListingCardProps & {
	kind: "car" | "apartment" | "hotel" | "airbnb";
	label: string;
	icon: ReactNode;
	specs: Array<{ icon: ReactNode; label: string }>;
	highlights: string[];
}) {
	const coverImage = getListingCoverImage(listing);
	const coverUrl = coverImage?.file.publicUrl;

	return (
		<article className={styles.card} data-kind={kind}>
			<Link href={detailHref} className={styles.media}>
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={coverImage.altText ?? listing.title}
						fill
						sizes="(max-width: 860px) 100vw, 28vw"
					/>
				) : (
					<span>
						{icon}
						Image coming soon
					</span>
				)}
				<div className={styles.categoryBadge}>
					{icon}
					{label}
				</div>
			</Link>

			<div className={styles.body}>
				<div className={styles.titleRow}>
					<div>
						<h2>{listing.title}</h2>
						<p>
							<MapPin aria-hidden="true" />
							{listing.city}, {listing.country}
						</p>
					</div>
					<span className={styles.price}>
						<CircleDollarSign aria-hidden="true" />
						<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
						<small>/{formatPricingUnit(listing.pricingUnit)}</small>
					</span>
				</div>

				<ul className={styles.specGrid}>
					{specs.map((spec) => (
						<li key={spec.label}>
							{spec.icon}
							<span>{spec.label}</span>
						</li>
					))}
				</ul>

				<div className={styles.highlights}>
					{highlights.map((highlight) => (
						<span key={highlight}>
							<CheckCircle2 aria-hidden="true" />
							{highlight}
						</span>
					))}
				</div>

				<div className={styles.footer}>
					<span>
						<ShieldCheck aria-hidden="true" />
						Reviewed partner
					</span>
					<Link href={detailHref}>
						Details
						<ArrowRight aria-hidden="true" />
					</Link>
				</div>
			</div>
		</article>
	);
}

export const listingCardFilterHints = {
	car: [
		{ icon: CarFront, label: "Verified cars" },
		{ icon: Snowflake, label: "Comfort filters" },
	],
	apartment: [
		{ icon: Wifi, label: "Living essentials" },
		{ icon: Users, label: "Guest capacity" },
	],
	hotel: [
		{ icon: Utensils, label: "Breakfast filters" },
		{ icon: DoorOpen, label: "Room types" },
	],
	airbnb: [
		{ icon: House, label: "House rules" },
		{ icon: Users, label: "Group-ready homes" },
	],
};
