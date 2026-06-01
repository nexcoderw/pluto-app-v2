'use client';

import type { ReactNode } from 'react';
import { CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { PortalAccessBoundary } from '@/components/portal/portal-access-boundary';
import type { UserAuthProfile } from '@/services/api/auth';
import styles from './partner-access-boundary.module.css';

type PartnerAccessBoundaryProps = {
	children: (user: UserAuthProfile) => ReactNode;
	title?: string;
	description?: string;
};

export function PartnerAccessBoundary({
	children,
	title = 'Opening partner workspace',
	description = 'Checking your secure partner session before loading business tools.',
}: PartnerAccessBoundaryProps) {
	return (
		<PortalAccessBoundary
			allowedRole="PARTNER"
			loadingFallback={
				<PartnerWorkspaceLoading title={title} description={description} />
			}
		>
			{children}
		</PortalAccessBoundary>
	);
}

export function PartnerWorkspaceLoading({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<main className={styles.loadingPage} aria-label={title}>
			<section className={styles.loadingPanel}>
				<div className={styles.loadingOrbit} aria-hidden="true">
					<ShieldCheck />
					<LoaderCircle />
				</div>
				<span className={styles.loadingEyebrow}>Partner access</span>
				<h1>{title}</h1>
				<p>{description}</p>
				<ul
					className={styles.loadingSteps}
					aria-label="Access checks in progress"
				>
					<li>
						<CheckCircle2 aria-hidden="true" />
						Secure session
					</li>
					<li>
						<CheckCircle2 aria-hidden="true" />
						Partner role
					</li>
					<li>
						<LoaderCircle aria-hidden="true" />
						Workspace status
					</li>
				</ul>
			</section>
		</main>
	);
}
