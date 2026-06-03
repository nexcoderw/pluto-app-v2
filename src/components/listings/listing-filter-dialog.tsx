"use client";

import type { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
} from "@/components/ui/dialog";
import styles from "./category-listings-page.module.css";

type ListingFilterDialogProps = {
	categoryLabel: string;
	children: ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ListingFilterDialog({
	children,
	open,
	onOpenChange,
}: ListingFilterDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.filterDialogContent}>
				<DialogHeader>
					<DialogDescription>
					</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
