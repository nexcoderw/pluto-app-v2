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
				<DialogHeader>
					<DialogTitle>{categoryLabel} filters</DialogTitle>
					<DialogDescription>
						Refine the visible listings without leaving the search results.
					</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
