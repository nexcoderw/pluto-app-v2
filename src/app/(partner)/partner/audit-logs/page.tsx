import type { Metadata } from "next";
import { PartnerAuditLogsPortal } from "@/components/audit-logs/partner-audit-logs-portal";

export const metadata: Metadata = {
	title: "Partner Audit Logs",
	description: "Review your Pluto Booking partner account activity.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerAuditLogsPage() {
	return <PartnerAuditLogsPortal />;
}
