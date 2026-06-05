"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/portal-shell";
import { partnerPortalNavigation } from "@/constants/partner-portal-navigation";
import type { UserAuthProfile } from "@/services/api/auth";
import { ApiRequestError } from "@/services/api/errors";
import { getPartnerProfile } from "@/services/api/partner-profile";
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

	const product = productQuery.data?.product;
	const workspaceError = getListingWorkspaceError({
		mode,
		profile,
		profileError: profileQuery.error,
		product,
		productError: productQuery.error,
	});

	if (workspaceError) {
		return (
			<PartnerStatusGate
				title={workspaceError.title}
				description={workspaceError.description}
				action={
					workspaceError.href ? (
						<Link href={workspaceError.href}>
							<ArrowLeft aria-hidden="true" />
							{workspaceError.actionLabel}
						</Link>
					) : (
						<Button
							type="button"
							onClick={() =>
								mode === "edit"
									? productQuery.refetch()
									: profileQuery.refetch()
							}
						>
							<RefreshCcw aria-hidden="true" className="rounded-full" />
							{workspaceError.actionLabel}
						</Button>
					)
				}
			/>
		);
	}

	return (
		<PortalShell
			variant="partner"
			user={user}
			eyebrow="Listings"
			title={mode === "edit" ? "Edit listing" : "Create listing"}
			description="Use the guided workflow to keep details complete, reviewable, and easy for customers to understand."
			homeHref="/partner/listings"
			homeLabel="Back to listings"
			navigation={partnerPortalNavigation}
			hideHero
		>
			<div className={styles.formPageHeader}>
				<div className={styles.headerCopy}>
					<span>{mode === "edit" ? "Listing editor" : "New listing"}</span>
					<h1>{mode === "edit" ? "Edit listing" : "Create listing"}</h1>
					<p>
						{mode === "edit"
							? "Changes are saved as a reviewed update before becoming public."
							: "Choose the correct category first, then complete the details required for admin review."}
					</p>
				</div>
				<Link href="/partner/listings">
					<ArrowLeft aria-hidden="true" />
					Back to listings
				</Link>
			</div>
			<ListingForm mode={mode} product={product} />
		</PortalShell>
	);
}

function getListingWorkspaceError({
	mode,
	profile,
	profileError,
	product,
	productError,
}: {
	mode: "create" | "edit";
	profile: Awaited<ReturnType<typeof getPartnerProfile>>["profile"] | undefined;
	profileError: unknown;
	product: Awaited<ReturnType<typeof getPartnerProduct>>["product"] | undefined;
	productError: unknown;
}) {
	if (profileError || !profile) {
		return {
			title: "Partner status unavailable",
			description:
				getSafeErrorMessage(profileError) ??
				"We could not confirm your partner approval status. Refresh and try again.",
			actionLabel: "Retry",
		};
	}

	if (mode === "edit" && productError) {
		const statusCode =
			productError instanceof ApiRequestError
				? productError.statusCode
				: undefined;

		if (statusCode === 404) {
			return {
				title: "Listing not found",
				description:
					"This listing could not be opened. It may have been removed, archived, or it may not belong to your partner account.",
				actionLabel: "Back to listings",
				href: "/partner/listings",
			};
		}

		if (statusCode === 403) {
			return {
				title: "Listing access restricted",
				description:
					"Your partner account is not allowed to edit this listing. Open a listing owned by your account or contact support.",
				actionLabel: "Back to listings",
				href: "/partner/listings",
			};
		}

		return {
			title: "Listing editor unavailable",
			description:
				getSafeErrorMessage(productError) ??
				"We could not load this listing for editing. Refresh and try again.",
			actionLabel: "Retry",
		};
	}

	if (mode === "edit" && !product) {
		return {
			title: "Listing not ready",
			description:
				"The listing editor did not receive listing details. Refresh and try again.",
			actionLabel: "Retry",
		};
	}

	return null;
}

function getSafeErrorMessage(error: unknown) {
	if (error instanceof ApiRequestError) {
		return error.message;
	}

	return null;
}
