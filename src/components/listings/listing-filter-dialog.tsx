"use client";

import type { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import styles from "./category-listings-page.module.css";

type ListingFilterDialogProps = {
	categoryLabel: string;
	children: ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ListingFilterDialog({
	categoryLabel,
	children,
	open,
	onOpenChange,
}: ListingFilterDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.filterDialogContent}>
				<DialogHeader className={styles.filterDialogHeader}>
					<DialogTitle>{categoryLabel} filters</DialogTitle>
					<DialogDescription>
						Refine the results, then apply your filters.
					</DialogDescription>
				</DialogHeader>
				<div className={styles.filterDialogBody}>{children}</div>
			</DialogContent>
		</Dialog>
	);
}
