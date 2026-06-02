"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
	ArrowLeft,
	BadgeCheck,
	CalendarClock,
	Building2,
	CarFront,
	CircleDollarSign,
	Clock3,
	Eye,
	Hotel,
	House,
	ImageIcon,
	Info,
	MapPin,
	Pencil,
	RefreshCcw,
	ShieldCheck,
	Store,
	Trash2,
	XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/portal-shell";
import { partnerPortalNavigation } from "@/constants/partner-portal-navigation";
import type { Product } from "@/services/api/products";
import type { UserAuthProfile } from "@/services/api/auth";
import { getPartnerProfile } from "@/services/api/partner-profile";
import { getPartnerProduct } from "@/services/api/partner-products";
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from "../partner-access-boundary";
import { PartnerStatusGate } from "../partner-dashboard";
import { ListingDeleteDialog } from "./listing-delete-dialog";
import styles from "./listing-detail-page.module.css";

export function ListingDetailPage({ productId }: { productId: string }) {
	return (
		<PartnerAccessBoundary>
			{(user) => <ListingDetailWorkspace productId={productId} user={user} />}
		</PartnerAccessBoundary>
	);
}

function ListingDetailWorkspace({
	productId,
	user,
}: {
	productId: string;
	user: UserAuthProfile;
}) {
	const router = useRouter();
	const profileQuery = useQuery({
		queryKey: ["partner-profile"],
		queryFn: getPartnerProfile,
	});
	const productQuery = useQuery({
		queryKey: ["partner-product", productId],
		queryFn: () => getPartnerProduct(productId),
	});
	const profile = profileQuery.data?.profile;
	const product = productQuery.data?.product;
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	useEffect(() => {
		if (profile && profile.status !== "APPROVED") {
			router.replace("/partner-onboarding");
		}
	}, [profile, router]);

	if (profileQuery.isPending || productQuery.isPending) {
		return (
			<PartnerWorkspaceLoading
				title="Opening listing"
				description="Loading secure listing details for your partner account."
			/>
		);
	}

	if (profile && profile.status !== "APPROVED") {
		return (
			<PartnerWorkspaceLoading
				title="Redirecting to onboarding"
				description="Complete approval before viewing listing details."
			/>
		);
	}

	if (profileQuery.isError || productQuery.isError || !profile || !product) {
		return (
			<PartnerStatusGate
				title="Listing unavailable"
				description="We could not load this listing. Refresh before trying another action."
				action={
					<Button type="button" onClick={() => productQuery.refetch()}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
				}
			/>
		);
	}

	return (
		<>
			<PortalShell
				variant="partner"
				user={user}
				eyebrow="Listing detail"
				title={product.title}
				description="Review customer-facing details, admin review status, media, and category specifications."
				homeHref="/partner/listings"
				homeLabel="Back to listings"
				navigation={partnerPortalNavigation}
				hideHero
			>
				<ListingDetail
					product={product}
					onRequestDelete={() => setIsDeleteDialogOpen(true)}
				/>
			</PortalShell>

			<ListingDeleteDialog
				open={isDeleteDialogOpen}
				product={product}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</>
	);
}

function ListingDetail({
	product,
	onRequestDelete,
}: {
	product: Product;
	onRequestDelete: () => void;
}) {
	const [selectedImageId, setSelectedImageId] = useState(
		() =>
			(product.images.find((image) => image.isCover) ?? product.images[0])?.id,
	);
	const coverImage =
		product.images.find((image) => image.id === selectedImageId) ??
		product.images.find((image) => image.isCover) ??
		product.images[0];
	const coverUrl = coverImage?.file.publicUrl;
	const timeline = useMemo(() => buildStatusTimeline(product), [product]);

	return (
		<>
			<section className={styles.detailHero}>
				<div className={styles.heroCopy}>
					<Link href="/partner/listings" className={styles.backLink}>
						<ArrowLeft aria-hidden="true" />
						Back to listings
					</Link>
					<span className={styles.categoryPill}>
						{formatLabel(product.category)}
					</span>
					<h1>{product.title}</h1>
					<p>
						{product.shortDescription ??
							"Review the complete customer-facing listing before making changes."}
					</p>
				</div>
				<div className={styles.heroActions}>
					<Link
						href={`/partner/listings/${product.id}/edit`}
						className={styles.editLink}
					>
						<Pencil aria-hidden="true" />
						Edit listing
					</Link>
					<Button
						type="button"
						variant="destructive"
						className={styles.deleteTrigger}
						onClick={onRequestDelete}
					>
						<Trash2 aria-hidden="true" />
						Delete
					</Button>
				</div>
				<div className={styles.heroFacts} aria-label="Listing overview">
					<HeroFact
						icon={<ShieldCheck aria-hidden="true" />}
						label="Status"
						value={formatLabel(product.status ?? "DRAFT")}
					/>
					<HeroFact
						icon={<CircleDollarSign aria-hidden="true" />}
						label="Price"
						value={`${formatMoney(product.basePrice, product.currency)}/${product.pricingUnit.toLowerCase()}`}
					/>
					<HeroFact
						icon={<MapPin aria-hidden="true" />}
						label="Location"
						value={`${product.city}, ${product.country}`}
					/>
					<HeroFact
						icon={<ImageIcon aria-hidden="true" />}
						label="Media"
						value={`${product.images.length} image${product.images.length === 1 ? "" : "s"}`}
					/>
				</div>
			</section>

			<section className={styles.detailGrid}>
				<div className={styles.primaryColumn}>
					<div className={styles.mediaPanel}>
						<div className={styles.cover}>
							{coverUrl ? (
								<Image
									src={coverUrl}
									alt={coverImage.altText ?? product.title}
									fill
									sizes="(max-width: 980px) 100vw, 54vw"
									priority
								/>
							) : (
								<span>
									<ImageIcon aria-hidden="true" />
								</span>
							)}
						</div>
						<ImageGallery
							product={product}
							selectedImageId={coverImage?.id}
							onSelectImage={setSelectedImageId}
						/>
					</div>

					<section className={styles.descriptionPanel}>
						<div className={styles.sectionHeader}>
							<span>
								<Info aria-hidden="true" />
								Customer description
							</span>
							<h2>Marketplace copy</h2>
							<p>
								{product.description ?? "No full description provided yet."}
							</p>
						</div>
					</section>

					<CategorySpecifications product={product} />
				</div>

				<aside className={styles.sideColumn}>
					<section className={styles.infoPanel}>
						<div className={styles.sectionHeader}>
							<span>
								<Store aria-hidden="true" />
								Listing facts
							</span>
							<h2>Operational details</h2>
						</div>
						<div className={styles.factGrid}>
							<Fact label="Product no" value={product.productNo} />
							<Fact
								label="Visibility"
								value={formatLabel(product.visibility ?? "PRIVATE")}
							/>
							<Fact
								label="Available"
								value={product.isAvailable ? "Yes" : "No"}
							/>
							<Fact
								label="Last updated"
								value={formatDate(product.updatedAt)}
							/>
						</div>
					</section>

					<section className={styles.timelinePanel}>
						<div className={styles.sectionHeader}>
							<span>
								<CalendarClock aria-hidden="true" />
								Status timeline
							</span>
							<h2>Review progress</h2>
						</div>
						<ol className={styles.timeline}>
							{timeline.map((item) => {
								const Icon = item.icon;

								return (
									<li key={item.label} data-state={item.state}>
										<span>
											<Icon aria-hidden="true" />
										</span>
										<div>
											<strong>{item.label}</strong>
											<small>{item.description}</small>
										</div>
									</li>
								);
							})}
						</ol>
					</section>

					{product.rejectionReason || product.adminNotes ? (
						<section className={styles.reviewPanel}>
							<div className={styles.sectionHeader}>
								<span>
									<ShieldCheck aria-hidden="true" />
									Admin review
								</span>
								<h2>Reviewer notes</h2>
							</div>
							{product.rejectionReason ? (
								<div className={styles.reviewNote} data-tone="danger">
									<strong>Rejection reason</strong>
									<p>{product.rejectionReason}</p>
								</div>
							) : null}
							{product.adminNotes ? (
								<div className={styles.reviewNote}>
									<strong>Admin notes</strong>
									<p>{product.adminNotes}</p>
								</div>
							) : null}
						</section>
					) : null}
				</aside>
			</section>
		</>
	);
}

function HeroFact({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className={styles.heroFact}>
			<span>{icon}</span>
			<div>
				<small>{label}</small>
				<strong>{value}</strong>
			</div>
		</div>
	);
}

function ImageGallery({
	product,
	selectedImageId,
	onSelectImage,
}: {
	product: Product;
	selectedImageId?: string;
	onSelectImage: (imageId: string) => void;
}) {
	if (!product.images.length) {
		return (
			<div className={styles.emptyGallery}>
				<ImageIcon aria-hidden="true" />
				<p>No images uploaded yet. Add images from the edit workflow.</p>
			</div>
		);
	}

	return (
		<div className={styles.gallery} aria-label="Listing image gallery">
			{product.images.map((image) => (
				<button
					key={image.id}
					type="button"
					data-active={image.id === selectedImageId}
					onClick={() => onSelectImage(image.id)}
					aria-label={`Preview ${image.altText ?? product.title}`}
				>
					{image.file.publicUrl ? (
						<Image
							src={image.file.publicUrl}
							alt={image.altText ?? product.title}
							fill
							sizes="8rem"
						/>
					) : (
						<ImageIcon aria-hidden="true" />
					)}
					{image.isCover ? <small>Cover</small> : null}
				</button>
			))}
		</div>
	);
}

function CategorySpecifications({ product }: { product: Product }) {
	if (product.apartmentDetails) {
		const details = product.apartmentDetails;

		return (
			<section className={styles.specPanel}>
				<div className={styles.sectionHeader}>
					<span>
						<Building2 aria-hidden="true" />
						Apartment specifications
					</span>
					<h2>Apartment details</h2>
				</div>
				<div className={styles.factGrid}>
					<Fact label="Bedrooms" value={String(details.bedrooms)} />
					<Fact label="Bathrooms" value={String(details.bathrooms)} />
					<Fact label="Kitchens" value={String(details.kitchens)} />
					<Fact label="Living rooms" value={String(details.livingRooms)} />
					<Fact label="Max guests" value={String(details.maxGuests)} />
					<Fact
						label="Floor"
						value={
							details.floorNumber !== null
								? String(details.floorNumber)
								: "Not specified"
						}
					/>
				</div>
				<div className={styles.featureGrid}>
					<Feature enabled={details.furnished} label="Furnished" />
					<Feature enabled={details.wifi} label="Wi-Fi" />
					<Feature enabled={details.parking} label="Parking" />
					<Feature enabled={details.hasBalcony} label="Balcony" />
					<Feature enabled={details.hasSecurity} label="Security" />
				</div>
			</section>
		);
	}

	if (product.hotelRoomDetails) {
		const details = product.hotelRoomDetails;

		return (
			<section className={styles.specPanel}>
				<div className={styles.sectionHeader}>
					<span>
						<Hotel aria-hidden="true" />
						Hotel room specifications
					</span>
					<h2>{details.hotelName}</h2>
				</div>
				<div className={styles.factGrid}>
					<Fact label="Room type" value={details.roomType} />
					<Fact label="Bed type" value={details.bedType} />
					<Fact label="Max guests" value={String(details.maxGuests)} />
					<Fact label="Check-in" value={details.checkInTime} />
					<Fact label="Check-out" value={details.checkOutTime} />
					<Fact
						label="Room size"
						value={
							details.roomSizeSqm
								? `${details.roomSizeSqm} sqm`
								: "Not specified"
						}
					/>
					<Fact
						label="Room number"
						value={details.roomNumber ?? "Not provided"}
					/>
				</div>
				<div className={styles.featureGrid}>
					<Feature
						enabled={details.breakfastIncluded}
						label="Breakfast included"
					/>
					<Feature
						enabled={details.hasAirConditioning}
						label="Air conditioning"
					/>
					<Feature
						enabled={details.hasPrivateBathroom}
						label="Private bathroom"
					/>
				</div>
			</section>
		);
	}

	if (product.airbnbDetails) {
		const details = product.airbnbDetails;

		return (
			<section className={styles.specPanel}>
				<div className={styles.sectionHeader}>
					<span>
						<House aria-hidden="true" />
						Airbnb house specifications
					</span>
					<h2>{details.houseType}</h2>
					{details.houseRules ? <p>{details.houseRules}</p> : null}
				</div>
				<div className={styles.factGrid}>
					<Fact label="Bedrooms" value={String(details.bedrooms)} />
					<Fact label="Bathrooms" value={String(details.bathrooms)} />
					<Fact label="Max guests" value={String(details.maxGuests)} />
					<Fact
						label="Cleaning fee"
						value={
							details.cleaningFee
								? formatMoney(details.cleaningFee, product.currency)
								: "Not charged"
						}
					/>
				</div>
				<div className={styles.featureGrid}>
					<Feature enabled={details.entirePlace} label="Entire place" />
					<Feature enabled={details.selfCheckIn} label="Self check-in" />
					<Feature enabled={details.allowPets} label="Pets allowed" />
					<Feature enabled={details.allowSmoking} label="Smoking allowed" />
					<Feature enabled={details.allowParties} label="Parties allowed" />
				</div>
			</section>
		);
	}

	if (!product.carDetails) {
		return null;
	}

	return (
		<section className={styles.specPanel}>
			<div className={styles.sectionHeader}>
				<span>
					<CarFront aria-hidden="true" />
					Car specifications
				</span>
				<h2>Vehicle details</h2>
			</div>
			<div className={styles.factGrid}>
				<Fact label="Brand" value={product.carDetails.brand} />
				<Fact label="Model" value={product.carDetails.model} />
				<Fact label="Year" value={String(product.carDetails.year)} />
				<Fact label="Transmission" value={product.carDetails.transmission} />
				<Fact label="Fuel" value={product.carDetails.fuelType} />
				<Fact label="Seats" value={String(product.carDetails.seats)} />
				<Fact label="Doors" value={String(product.carDetails.doors)} />
				<Fact
					label="Plate"
					value={product.carDetails.plateNumber ?? "Not provided"}
				/>
				<Fact
					label="Luggage"
					value={
						product.carDetails.luggageCapacity
							? `${product.carDetails.luggageCapacity} bags`
							: "Not specified"
					}
				/>
				<Fact
					label="Driver age"
					value={
						product.carDetails.minimumDriverAge
							? `${product.carDetails.minimumDriverAge}+`
							: "Not specified"
					}
				/>
			</div>
			<div className={styles.featureGrid}>
				<Feature
					enabled={product.carDetails.airConditioning}
					label="Air conditioning"
				/>
				<Feature
					enabled={product.carDetails.driverIncluded}
					label="Driver included"
				/>
				<Feature
					enabled={product.carDetails.insuranceIncluded}
					label="Insurance included"
				/>
				<Feature
					enabled={product.carDetails.requiresDeposit}
					label="Deposit required"
				/>
			</div>
		</section>
	);
}

function Fact({ label, value }: { label: string; value: string }) {
	return (
		<div className={styles.fact}>
			<span>{label}</span>
			<strong>{value}</strong>
		</div>
	);
}

function Feature({ enabled, label }: { enabled: boolean; label: string }) {
	return (
		<span className={styles.feature} data-enabled={enabled}>
			{enabled ? (
				<BadgeCheck aria-hidden="true" />
			) : (
				<XCircle aria-hidden="true" />
			)}
			{label}
		</span>
	);
}

function buildStatusTimeline(product: Product) {
	const status = product.status ?? "DRAFT";
	const createdAt = formatDate(product.createdAt);
	const reviewedAt = formatDate(product.reviewedAt);
	const publishedAt = formatDate(product.publishedAt);
	const isApproved = status === "APPROVED";
	const isRejected = status === "REJECTED";
	const isArchived = status === "ARCHIVED";
	const isPending = status === "PENDING_REVIEW";

	return [
		{
			label: "Listing created",
			description: createdAt,
			state: "complete",
			icon: Store,
		},
		{
			label: "Submitted for review",
			description:
				isPending || isApproved || isRejected
					? "Admin review queue"
					: "Submit changes to start review",
			state: isPending
				? "current"
				: isApproved || isRejected
					? "complete"
					: "upcoming",
			icon: Clock3,
		},
		{
			label: isRejected ? "Review rejected" : "Admin decision",
			description: isApproved
				? `Approved ${reviewedAt}`
				: isRejected
					? `Rejected ${reviewedAt}`
					: isArchived
						? "Archived listing"
						: "Waiting for review decision",
			state: isApproved || isRejected || isArchived ? "complete" : "upcoming",
			icon: isRejected ? XCircle : ShieldCheck,
		},
		{
			label: "Marketplace visibility",
			description: isApproved
				? `Published ${publishedAt}`
				: "Hidden until approved",
			state: isApproved ? "complete" : "upcoming",
			icon: Eye,
		},
	] as const;
}

function formatMoney(value: string, currency: string) {
	const numericValue = Number(value);

	if (!Number.isFinite(numericValue)) {
		return `${currency} ${value}`;
	}

	return new Intl.NumberFormat("en-RW", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(numericValue);
}

function formatDate(value?: string | null) {
	if (!value) {
		return "Not available";
	}

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}

function formatLabel(value: string) {
	return value
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
