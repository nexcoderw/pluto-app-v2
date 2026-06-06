"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserSession } from "@/hooks/use-user-session";
import { ApiRequestError } from "@/services/api/errors";
import {
	listFavoriteListingIds,
	removeFavoriteListing,
	saveFavoriteListing,
	type FavoriteListingIdsResponse,
} from "@/services/api/favorites";

export const FAVORITE_LISTING_IDS_QUERY_KEY = ["favorite-listing-ids"] as const;

type FavoriteAction = "save" | "remove";

export function useListingFavorite(productId: string) {
	const currentUser = useUserSession();
	const queryClient = useQueryClient();
	const favoriteIdsQuery = useQuery({
		queryKey: FAVORITE_LISTING_IDS_QUERY_KEY,
		queryFn: listFavoriteListingIds,
		enabled: Boolean(currentUser),
		staleTime: 60_000,
	});
	const favoriteIds = currentUser
		? (favoriteIdsQuery.data?.productIds ?? [])
		: [];
	const isFavorite = favoriteIds.includes(productId);
	const mutation = useMutation({
		mutationFn: (action: FavoriteAction) =>
			action === "save"
				? saveFavoriteListing(productId)
				: removeFavoriteListing(productId),
		onMutate: async (action) => {
			await queryClient.cancelQueries({
				queryKey: FAVORITE_LISTING_IDS_QUERY_KEY,
			});
			const previous = queryClient.getQueryData<FavoriteListingIdsResponse>(
				FAVORITE_LISTING_IDS_QUERY_KEY,
			);

			queryClient.setQueryData<FavoriteListingIdsResponse>(
				FAVORITE_LISTING_IDS_QUERY_KEY,
				(current) => ({
					productIds:
						action === "save"
							? addFavoriteId(current?.productIds ?? [], productId)
							: removeFavoriteId(current?.productIds ?? [], productId),
				}),
			);

			return { previous };
		},
		onError: (error, action, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					FAVORITE_LISTING_IDS_QUERY_KEY,
					context.previous,
				);
			}

			if (error instanceof ApiRequestError) {
				if (action === "save" && error.statusCode === 409) {
					queryClient.setQueryData<FavoriteListingIdsResponse>(
						FAVORITE_LISTING_IDS_QUERY_KEY,
						(current) => ({
							productIds: addFavoriteId(current?.productIds ?? [], productId),
						}),
					);
					return;
				}

				if (action === "remove" && error.statusCode === 404) {
					queryClient.setQueryData<FavoriteListingIdsResponse>(
						FAVORITE_LISTING_IDS_QUERY_KEY,
						(current) => ({
							productIds: removeFavoriteId(
								current?.productIds ?? [],
								productId,
							),
						}),
					);
					return;
				}

				toast.error("Favorite was not updated", {
					description: error.message,
				});
				return;
			}

			toast.error("Favorite was not updated", {
				description: "Please try again.",
			});
		},
		onSuccess: (response) => {
			toast.success(response.message);
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: FAVORITE_LISTING_IDS_QUERY_KEY,
			});
		},
	});

	function saveAfterLogin() {
		mutation.mutate("save");
	}

	function toggleFavorite() {
		if (!currentUser) {
			return false;
		}

		mutation.mutate(isFavorite ? "remove" : "save");
		return true;
	}

	return {
		currentUser,
		isFavorite,
		isPending: mutation.isPending || favoriteIdsQuery.isFetching,
		saveAfterLogin,
		toggleFavorite,
	};
}

function addFavoriteId(productIds: string[], productId: string) {
	return productIds.includes(productId)
		? productIds
		: [productId, ...productIds];
}

function removeFavoriteId(productIds: string[], productId: string) {
	return productIds.filter((id) => id !== productId);
}
