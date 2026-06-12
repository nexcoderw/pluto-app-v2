"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
	BadgeCheck,
	CircleAlert,
	Info,
	LoaderCircle,
	ShieldAlert,
} from "lucide-react";
import styles from "./sonner.module.css";

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			className={styles.toaster}
			closeButton
			duration={4500}
			gap={14}
			offset={16}
			mobileOffset={8}
			position="top-right"
			icons={{
				success: <BadgeCheck aria-hidden="true" />,
				info: <Info aria-hidden="true" />,
				warning: <CircleAlert aria-hidden="true" />,
				error: <ShieldAlert aria-hidden="true" />,
				loading: (
					<LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
				),
			}}
			style={
				{
					"--width": "min(25rem, calc(100vw - 1.5rem))",
				} as CSSProperties
			}
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: styles.toast,
					content: styles.content,
					icon: styles.icon,
					title: styles.title,
					description: styles.description,
					actionButton: styles.actionButton,
					cancelButton: styles.cancelButton,
					closeButton: styles.closeButton,
					success: styles.success,
					error: styles.error,
					warning: styles.warning,
					info: styles.info,
					loading: styles.loading,
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
