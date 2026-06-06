"use client";

import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import { UserAuditLogsPage } from "./user-audit-logs-page";

export function CustomerAuditLogsPortal() {
	return (
		<PortalAccessBoundary allowedRole="CUSTOMER">
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
