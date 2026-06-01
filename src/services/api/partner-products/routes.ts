export const PARTNER_PRODUCT_ROUTES = {
	list: '/partner/products',
	detail: (productId: string) => `/partner/products/${productId}`,
	createCar: '/partner/products/cars',
} as const;
