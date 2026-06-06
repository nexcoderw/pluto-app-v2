"use client";

import { HeartOff, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { FavoriteListingSummary } from "@/services/api/favorites";
import styles from "./customer-favorites-page.module.css";

type FavoriteRemoveDialogProps = {
	favorite: FavoriteListingSummary | null;
	open: boolean;
	isRemoving: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
};

export function FavoriteRemoveDialog({
	favorite,
	open,
	isRemoving,
	onOpenChange,
	onConfirm,
}: FavoriteRemoveDialogProps) {
	const listingTitle = favorite?.product.title ?? "this listing";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.removeDialog}>
				<DialogHeader className={styles.removeDialogHeader}>
					<span aria-hidden="true">
						<HeartOff />
					</span>
					<DialogTitle>Remove saved listing?</DialogTitle>
					<DialogDescription>
						{listingTitle} will leave your favorites, but the listing will stay
						available on Pluto Booking if it is still public. You can save it
						again later.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className={styles.removeDialogFooter}>
					<Button
						type="button"
						variant="outline"
						className={styles.dialogCancelButton}
						disabled={isRemoving}
						onClick={() => onOpenChange(false)}
					>
						<HeartOff aria-hidden="true" />
						Keep saved
					</Button>
					<Button
						type="button"
						variant="destructive"
						className={styles.dialogRemoveButton}
						disabled={isRemoving}
						onClick={onConfirm}
					>
						{isRemoving ? (
							<LoaderCircle aria-hidden="true" className={styles.spinIcon} />
						) : (
							<Trash2 aria-hidden="true" />
						)}
						Remove favorite
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
