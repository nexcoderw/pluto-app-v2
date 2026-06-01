"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Eye, Plus, RefreshCcw, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	PortalShell,
	type PortalMetric,
} from "@/components/portal/portal-shell";
import { partnerPortalNavigation } from "@/constants/partner-portal-navigation";
import type { UserAuthProfile } from "@/services/api/auth";
import {
	getPartnerProfile,
	type PartnerProfile,
} from "@/services/api/partner-profile";
import { getPartnerProduct } from "@/services/api/partner-products";
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from "../partner-access-boundary";
import { PartnerStatusGate } from "../partner-dashboard";
import { ListingForm } from "./listing-form";
import styles from "./listing-form-page.module.css";

export function CreateListingPage() {
	return (
		<PartnerAccessBoundary>
			{(user) => <ListingFormWorkspace mode="create" user={user} />}
		</PartnerAccessBoundary>
	);
}

export function EditListingPage({ productId }: { productId: string }) {
	return (
		<PartnerAccessBoundary>
			{(user) => (
				<ListingFormWorkspace mode="edit" productId={productId} user={user} />
			)}
		</PartnerAccessBoundary>
	);
}

function ListingFormWorkspace({
	mode,
	productId,
	user,
}: {
	mode: "create" | "edit";
	productId?: string;
	user: UserAuthProfile;
}) {
	const router = useRouter();
	const profileQuery = useQuery({
		queryKey: ["partner-profile"],
		queryFn: getPartnerProfile,
	});
	const productQuery = useQuery({
		queryKey: ["partner-product", productId],
		queryFn: () => getPartnerProduct(productId as string),
		enabled: mode === "edit" && Boolean(productId),
	});
	const profile = profileQuery.data?.profile;
	const isLoading =
		profileQuery.isPending || (mode === "edit" && productQuery.isPending);

	useEffect(() => {
		if (profile && profile.status !== "APPROVED") {
			router.replace("/partner-onboarding");
		}
	}, [profile, router]);

	if (isLoading) {
		return (
			<PartnerWorkspaceLoading
				title={
					mode === "edit" ? "Opening listing editor" : "Opening listing form"
				}
				description="Preparing the secure partner listing workflow."
			/>
		);
	}

	if (profile && profile.status !== "APPROVED") {
		return (
			<PartnerWorkspaceLoading
				title="Redirecting to onboarding"
				description="Complete approval before managing listings."
			/>
		);
	}

	if (profileQuery.isError || !profile || productQuery.isError) {
		return (
			<PartnerStatusGate
				title="Listing workspace unavailable"
				description="We could not prepare the listing workflow. Refresh and try again."
				action={
					<Button
						type="button"
						onClick={() =>
							mode === "edit" ? productQuery.refetch() : profileQuery.refetch()
						}
					>
						<RefreshCcw aria-hidden="true" className="rounded-full" />
						Retry
					</Button>
				}
			/>
		);
	}

	const product = productQuery.data?.product;

	return (
		<PortalShell
			variant="partner"
			user={user}
			eyebrow="Listing workflow"
			title={mode === "edit" ? "Edit listing" : "Create listing"}
			description="Use the guided workflow to keep details complete, reviewable, and easy for customers to understand."
			homeHref="/partner/listings"
			homeLabel="Back to listings"
			navigation={partnerPortalNavigation}
			metrics={buildMetrics(profile)}
		>
			<div className={styles.formPageHeader}>
				<Link href="/partner/listings">
					<ArrowLeft aria-hidden="true" />
					Back to listings
				</Link>
				<p>
					{mode === "edit"
						? "Changes are saved as a reviewed update before becoming public."
						: "Choose the correct category first, then complete the details required for admin review."}
				</p>
			</div>
			<ListingForm mode={mode} product={product} />
		</PortalShell>
	);
}

function buildMetrics(profile: PartnerProfile): PortalMetric[] {
	return [
		{
			label: "Partner status",
			value: profile.status,
			description: "Only approved partners can manage listings.",
			icon: Store,
		},
		{
			label: "Review path",
			value: "Admin",
			description: "Saved listings are checked before publishing.",
			icon: Eye,
		},
		{
			label: "Listing types",
			value: "4",
			description: "Cars, apartments, hotel rooms, and Airbnb homes.",
			icon: Plus,
		},
	];
}
