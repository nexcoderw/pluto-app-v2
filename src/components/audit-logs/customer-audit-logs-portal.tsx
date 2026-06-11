"use client";

import { CustomerPortalLoading } from "@/components/account/customer-portal-loading";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import { UserAuditLogsPage } from "./user-audit-logs-page";

export function CustomerAuditLogsPortal() {
	return (
		<PortalAccessBoundary
			allowedRole="CUSTOMER"
			loadingFallback={
				<CustomerPortalLoading
					title="Opening audit logs"
					description="Checking your customer session before loading account activity."
				/>
			}
		>
			{(user) => (
				<CustomerPortalShell user={user}>
					<UserAuditLogsPage
						eyebrow="Customer security trail"
						title="Audit logs"
						description="Review the read-only activity trail connected to your customer account, including sign-ins, profile changes, favorites, and booking-related actions."
					/>
				</CustomerPortalShell>
			)}
		</PortalAccessBoundary>
	);
}
