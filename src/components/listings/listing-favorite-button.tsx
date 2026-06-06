"use client";

import { useState, type ReactNode } from "react";
import { Heart } from "lucide-react";
import { ListingLoginDialog } from "./listing-login-dialog";
import { useListingFavorite } from "./use-listing-favorite";

type ListingFavoriteButtonProps = {
	productId: string;
	listingTitle: string;
	label: string;
	className: string;
	children?: ReactNode;
};

export function ListingFavoriteButton({
	productId,
	listingTitle,
	label,
	className,
	children,
}: ListingFavoriteButtonProps) {
	const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
	const { currentUser, isFavorite, isPending, saveAfterLogin, toggleFavorite } =
		useListingFavorite(productId);

	function handleClick() {
		if (!currentUser) {
			setIsLoginDialogOpen(true);
			return;
		}

		toggleFavorite();
	}

	return (
		<>
			<button
				type="button"
				className={className}
				aria-label={isFavorite ? `Remove ${label} from favorites` : label}
				aria-pressed={isFavorite}
				disabled={isPending}
				onClick={handleClick}
			>
				{children ?? <Heart aria-hidden="true" />}
			</button>
			<ListingLoginDialog
				open={isLoginDialogOpen}
				onOpenChange={setIsLoginDialogOpen}
				listingTitle={listingTitle}
				intent="favorite"
				onAuthenticated={saveAfterLogin}
			/>
		</>
	);
}
