import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./listing-detail-error-state.module.css";

type ListingDetailErrorStateProps = {
	title: string;
	description: string;
	backHref: string;
	backLabel: string;
	onRetry: () => void;
};

export function ListingDetailErrorState({
	title,
	description,
	backHref,
	backLabel,
	onRetry,
}: ListingDetailErrorStateProps) {
	return (
		<main className={styles.page}>
			<section className={styles.panel}>
				<RefreshCcw aria-hidden="true" />
				<h1>{title}</h1>
				<p>{description}</p>
				<div>
					<Button type="button" onClick={onRetry} className="rounded-full">
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href={backHref}>
						<ArrowLeft aria-hidden="true" />
						{backLabel}
					</Link>
				</div>
			</section>
		</main>
	);
}
