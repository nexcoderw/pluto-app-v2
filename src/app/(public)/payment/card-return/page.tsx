import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./card-return.module.css";

export const metadata: Metadata = {
	title: "Check Card Payment",
	description:
		"Return to Pluto Booking and check the authenticated status of your card payment.",
	robots: { index: false, follow: false },
};

export default function CardPaymentReturnPage() {
	return (
		<main className={styles.page}>
			<section className={styles.card} aria-labelledby="card-return-title">
				<span className={styles.iconWrap}>
					<ShieldCheck aria-hidden="true" />
				</span>
				<p className={styles.eyebrow}>Secure card payment</p>
				<h1 id="card-return-title">Return to Pluto Booking</h1>
				<p className={styles.description}>
					Returning from the card page does not by itself confirm payment. Open
					your payments to see the status Pluto verified directly with the
					provider.
				</p>
				<div className={styles.notice}>
					<ReceiptText aria-hidden="true" />
					<span>
						If the status is still processing, do not pay again. Pluto will keep
						checking safely.
					</span>
				</div>
				<div className={styles.actions}>
					<Button render={<Link href="/account/payments" />}>
						<ReceiptText aria-hidden="true" />
						View payments
					</Button>
					<Button variant="outline" render={<Link href="/" />}>
						Back to home
						<ArrowRight aria-hidden="true" />
					</Button>
				</div>
			</section>
		</main>
	);
}
