import type { Metadata } from "next";
import { CustomerAuditLogsPortal } from "@/components/audit-logs/customer-audit-logs-portal";

export const metadata: Metadata = {
	title: "Customer Audit Logs",
	description: "Review your Pluto Booking customer account activity.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function CustomerAuditLogsPage() {
	return <CustomerAuditLogsPortal />;
}
