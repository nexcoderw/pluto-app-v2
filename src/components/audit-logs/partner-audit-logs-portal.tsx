"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/portal-shell";
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from "@/components/partner/partner-access-boundary";
import { PartnerStatusGate } from "@/components/partner/partner-dashboard";
import { partnerPortalNavigation } from "@/constants/partner-portal-navigation";
import { getPartnerProfile } from "@/services/api/partner-profile";
import type { UserAuthProfile } from "@/services/api/auth";
import { UserAuditLogsPage } from "./user-audit-logs-page";

export function PartnerAuditLogsPortal() {
	return (
		<PartnerAccessBoundary
			title="Opening partner audit logs"
			description="Checking your secure partner session before loading account activity."
		>
			{(user) => <PartnerAuditLogsContent user={user} />}
		</PartnerAccessBoundary>
	);
}

function PartnerAuditLogsContent({ user }: { user: UserAuthProfile }) {
	const router = useRouter();
	const profileQuery = useQuery({
		queryKey: ["partner-profile"],
		queryFn: getPartnerProfile,
	});
	const profile = profileQuery.data?.profile;

	useEffect(() => {
		if (profile && profile.status !== "APPROVED") {
			router.replace("/partner-onboarding");
		}
	}, [profile, router]);

	if (profileQuery.isPending || (profile && profile.status !== "APPROVED")) {
		return (
			<PartnerWorkspaceLoading
				title="Checking partner approval"
				description="Only approved partners can open secure partner audit logs."
			/>
		);
	}

	if (profileQuery.isError || !profile) {
		return (
			<PartnerStatusGate
				title="Partner status unavailable"
				description="We could not confirm your approval status. Refresh before opening audit logs."
				action={
					<Button
						type="button"
						className="rounded-full"
						onClick={() => profileQuery.refetch()}
					>
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
			eyebrow="Partner security trail"
			title="Audit logs"
			description="Review the read-only activity trail connected to your partner account, including listing actions, profile activity, uploads, and security decisions."
			homeHref="/partner/dashboard"
			homeLabel="Back to dashboard"
			navigation={partnerPortalNavigation}
			hideHero
		>
			<UserAuditLogsPage
				eyebrow="Partner security trail"
				title="Audit logs"
				description="Review the read-only activity trail connected to your partner account, including listing actions, profile activity, uploads, and security decisions."
			/>
		</PortalShell>
	);
}
