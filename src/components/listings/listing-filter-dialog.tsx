"use client";

import { ChevronsUpDown, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	ListingOrderBy,
	ListingSortOrder,
} from "@/services/api/listings";
import styles from "./category-listings-page.module.css";

type ListingFilterDialogProps = {
	categoryLabel: string;
	children: ReactNode;
	open: boolean;
	search: string;
	sortBy: ListingOrderBy;
	sortOrder: ListingSortOrder;
	onOpenChange: (open: boolean) => void;
	onSearchChange: (value: string) => void;
	onSortByChange: (value: ListingOrderBy) => void;
	onSortOrderToggle: () => void;
};

const sortOptions: Array<{ label: string; value: ListingOrderBy }> = [
	{ label: "Newest first", value: "createdAt" },
	{ label: "Price", value: "basePrice" },
	{ label: "Title", value: "title" },
];

export function ListingFilterDialog({
	categoryLabel,
	children,
	open,
	search,
	sortBy,
	sortOrder,
	onOpenChange,
	onSearchChange,
	onSortByChange,
	onSortOrderToggle,
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
				<div className={styles.filterDialogBody}>
					<div
						className={styles.filterDialogMobileControls}
						role="group"
						aria-label="Search and sort listings"
					>
						<Input
							type="search"
							value={search}
							icon={<Search aria-hidden="true" />}
							placeholder={`Search ${categoryLabel.toLowerCase()}`}
							onChange={(event) => onSearchChange(event.target.value)}
						/>
						<div className={styles.filterDialogSortControls}>
							<Select
								value={sortBy}
								onValueChange={(value) =>
									onSortByChange(value as ListingOrderBy)
								}
							>
								<SelectTrigger className={styles.filterDialogSelectTrigger}>
									<SelectValue>
										<ChevronsUpDown aria-hidden="true" />
										{
											sortOptions.find((option) => option.value === sortBy)
												?.label
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent align="start" alignItemWithTrigger={false}>
									{sortOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								type="button"
								variant="outline"
								className={styles.filterDialogSortButton}
								onClick={onSortOrderToggle}
							>
								<ChevronsUpDown aria-hidden="true" />
								{sortOrder === "asc" ? "Ascending" : "Descending"}
							</Button>
						</div>
					</div>
					{children}
				</div>
			</DialogContent>
		</Dialog>
	);
}
