export const PRODUCT_ROUTES = {
	list: '/products',
	detail: (productId: string) => `/products/${productId}`,
} as const;
