export const FAVORITE_ROUTES = {
	list: "/favorites",
	ids: "/favorites/ids",
	item: (productId: string) => `/favorites/${productId}`,
} as const;
