import Link from "next/link";
import {
	ArrowLeft,
	FileText,
	MessageCircle,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import styles from "./legal-under-construction.module.css";

type LegalUnderConstructionProps = {
	kind: "terms" | "privacy";
};

const pageContent = {
	terms: {
		eyebrow: "Terms of service",
		title: "Our terms are taking shape.",
		description:
			"We’re preparing clear terms that explain how Pluto Booking works for travelers, customers, and partners.",
		icon: FileText,
	},
	privacy: {
		eyebrow: "Privacy policy",
		title: "Our privacy policy is in progress.",
		description:
			"We’re documenting how Pluto Booking collects, protects, and uses your information in plain language.",
		icon: ShieldCheck,
	},
} as const;

export function LegalUnderConstruction({
	kind,
}: LegalUnderConstructionProps) {
	const content = pageContent[kind];
	const Icon = content.icon;

	return (
		<main className={styles.page}>
			<section className={styles.card} aria-labelledby="legal-page-title">
				<div className={styles.glow} aria-hidden="true" />
				<div className={styles.iconWrap}>
					<Icon aria-hidden="true" />
				</div>

				<div className={styles.eyebrow}>
					<Sparkles aria-hidden="true" />
					{content.eyebrow}
				</div>
				<h1 id="legal-page-title">{content.title}</h1>
				<p>{content.description}</p>

				<div className={styles.status}>
					<span aria-hidden="true" />
					Under construction
				</div>

				<div className={styles.actions}>
					<Link href="/">
						<ArrowLeft aria-hidden="true" />
						Back to home
					</Link>
					<Link href="/contact" className={styles.secondaryAction}>
						<MessageCircle aria-hidden="true" />
						Contact us
					</Link>
				</div>
			</section>
		</main>
	);
}
