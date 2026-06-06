"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, SearchX } from "lucide-react";
import styles from "@/components/portal/portal-shell.module.css";

const REDIRECT_DELAY_SECONDS = 5;

type NotFoundStateProps = {
	title?: string;
	description?: string;
	redirectHref?: string;
	actionLabel?: string;
};

export function NotFoundState({
	title = "Page not found",
	description = "The page you are looking for may have moved, expired, or is no longer available on Pluto Booking.",
	redirectHref = "/",
	actionLabel = "Go home now",
}: NotFoundStateProps) {
	const router = useRouter();
	const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);

	useEffect(() => {
		const redirectTimer = window.setTimeout(() => {
			router.replace(redirectHref);
		}, REDIRECT_DELAY_SECONDS * 1000);

		const countdownTimer = window.setInterval(() => {
			setSecondsLeft((value) => Math.max(0, value - 1));
		}, 1000);

		return () => {
			window.clearTimeout(redirectTimer);
			window.clearInterval(countdownTimer);
		};
	}, [redirectHref, router]);

	return (
		<main className={styles.forbiddenPage}>
			<section className={styles.forbiddenPanel} aria-live="polite">
				<div className={styles.forbiddenCode}>404</div>
				<div className={styles.forbiddenIcon}>
					<SearchX aria-hidden="true" />
				</div>
				<h1>{title}</h1>
				<p>{description}</p>
				<div className={styles.redirectNotice}>
					<Home aria-hidden="true" />
					<span>Redirecting to homepage in {secondsLeft}s.</span>
				</div>
				<Link href={redirectHref} className={styles.primaryAction}>
					<Home aria-hidden="true" />
					{actionLabel}
					<ArrowRight aria-hidden="true" />
				</Link>
			</section>
		</main>
	);
}
