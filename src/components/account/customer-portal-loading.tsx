"use client";

import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import styles from "./customer-portal-loading.module.css";

type CustomerPortalLoadingProps = {
	title?: string;
	description?: string;
	variant?: "page" | "panel";
};

export function CustomerPortalLoading({
	title = "Opening customer portal",
	description = "Checking your secure customer session before loading your account.",
	variant = "page",
}: CustomerPortalLoadingProps) {
	const Wrapper = variant === "page" ? "main" : "section";

	return (
		<Wrapper
			className={styles.page}
			data-variant={variant}
			aria-busy="true"
			aria-live="polite"
		>
			<section className={styles.panel}>
				<span className={styles.logoMark}>
					<Image src="/logo-b.png" alt="" width={42} height={42} priority />
				</span>
				<div className={styles.copy}>
					<span>Pluto Booking</span>
					<h1>{title}</h1>
					<p>{description}</p>
				</div>
				<div className={styles.progress} aria-hidden="true">
					<span />
				</div>
				<span className={styles.status}>
					<LoaderCircle aria-hidden="true" />
					Loading account
				</span>
			</section>
		</Wrapper>
	);
}
