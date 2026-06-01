'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
	ArrowLeft,
	CarFront,
	CircleDollarSign,
	ImageIcon,
	Pencil,
	RefreshCcw,
	ShieldCheck,
	Store,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
	PortalShell,
	type PortalAction,
	type PortalMetric,
} from '@/components/portal/portal-shell';
import { partnerPortalNavigation } from '@/constants/partner-portal-navigation';
import type { Product, ProductStatus } from '@/services/api/products';
import type { UserAuthProfile } from '@/services/api/auth';
import { getPartnerProfile } from '@/services/api/partner-profile';
import { getPartnerProduct } from '@/services/api/partner-products';
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from '../partner-access-boundary';
import { PartnerStatusGate } from '../partner-dashboard';
import styles from './listing-detail-page.module.css';

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
		queryKey: ['partner-profile'],
		queryFn: getPartnerProfile,
	});
	const productQuery = useQuery({
		queryKey: ['partner-product', productId],
		queryFn: () => getPartnerProduct(productId),
	});
	const profile = profileQuery.data?.profile;
	const product = productQuery.data?.product;

	useEffect(() => {
		if (profile && profile.status !== 'APPROVED') {
			router.replace('/partner-onboarding');
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

	if (profile && profile.status !== 'APPROVED') {
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
		<PortalShell
			variant="partner"
			user={user}
			eyebrow="Listing detail"
			title={product.title}
			description="Review customer-facing details, admin review status, media, and car specifications."
			homeHref="/partner/listings"
			homeLabel="Back to listings"
			navigation={partnerPortalNavigation}
			metrics={buildMetrics(product)}
			actions={buildActions(product)}
		>
			<ListingDetail product={product} />
		</PortalShell>
	);
}

function ListingDetail({ product }: { product: Product }) {
	const coverImage =
		product.images.find((image) => image.isCover) ?? product.images[0];
	const coverUrl = coverImage?.file.publicUrl;

	return (
		<section className={styles.detailGrid}>
			<div className={styles.mediaPanel}>
				<div className={styles.cover}>
					{coverUrl ? (
						<Image
							src={coverUrl}
							alt={coverImage.altText ?? product.title}
							fill
							sizes="(max-width: 980px) 100vw, 50vw"
						/>
					) : (
						<span>
							<ImageIcon aria-hidden="true" />
						</span>
					)}
					<StatusPill status={product.status ?? 'DRAFT'} />
				</div>
				<div className={styles.gallery}>
					{product.images.length ? (
						product.images.map((image) => (
							<div key={image.id}>
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
							</div>
						))
					) : (
						<p>No images uploaded yet. Add images from the edit workflow.</p>
					)}
				</div>
			</div>

			<div className={styles.infoPanel}>
				<Link href="/partner/listings" className={styles.backLink}>
					<ArrowLeft aria-hidden="true" />
					Back to listings
				</Link>
				<div className={styles.infoBlock}>
					<span>Customer description</span>
					<h2>{product.title}</h2>
					<p>{product.description}</p>
				</div>
				<div className={styles.factGrid}>
					<Fact
						label="Location"
						value={`${product.city}, ${product.country}`}
					/>
					<Fact
						label="Price"
						value={`${formatMoney(product.basePrice, product.currency)}/${product.pricingUnit.toLowerCase()}`}
					/>
					<Fact label="Visibility" value={product.visibility ?? 'PRIVATE'} />
					<Fact label="Product no" value={product.productNo} />
				</div>
				{product.carDetails ? (
					<div className={styles.specPanel}>
						<span>
							<CarFront aria-hidden="true" />
							Car specifications
						</span>
						<div className={styles.factGrid}>
							<Fact label="Brand" value={product.carDetails.brand} />
							<Fact label="Model" value={product.carDetails.model} />
							<Fact label="Year" value={String(product.carDetails.year)} />
							<Fact label="Seats" value={String(product.carDetails.seats)} />
							<Fact label="Doors" value={String(product.carDetails.doors)} />
							<Fact label="Fuel" value={product.carDetails.fuelType} />
						</div>
					</div>
				) : null}
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

function StatusPill({ status }: { status: ProductStatus }) {
	return (
		<span className={styles.statusPill} data-status={status}>
			{status.toLowerCase().replace('_', ' ')}
		</span>
	);
}

function buildMetrics(product: Product): PortalMetric[] {
	return [
		{
			label: 'Review status',
			value: product.status ?? 'DRAFT',
			description: 'Current admin review state.',
			icon: ShieldCheck,
		},
		{
			label: 'Images',
			value: String(product.images.length),
			description: 'Media attached to the listing.',
			icon: ImageIcon,
		},
		{
			label: 'Price',
			value: formatMoney(product.basePrice, product.currency),
			description: `Charged per ${product.pricingUnit.toLowerCase()}.`,
			icon: CircleDollarSign,
		},
	];
}

function buildActions(product: Product): PortalAction[] {
	return [
		{
			href: '/partner/listings',
			label: 'All listings',
			description: 'Return to listing search and filters.',
			icon: Store,
		},
		{
			href: `/partner/listings/${product.id}/edit`,
			label: 'Edit listing',
			description: 'Update details and send changes for review.',
			icon: Pencil,
		},
	];
}

function formatMoney(value: string, currency: string) {
	const numericValue = Number(value);

	if (!Number.isFinite(numericValue)) {
		return `${currency} ${value}`;
	}

	return new Intl.NumberFormat('en-RW', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(numericValue);
}
