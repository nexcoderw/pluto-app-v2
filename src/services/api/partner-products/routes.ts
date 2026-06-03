export const PARTNER_PRODUCT_ROUTES = {
	list: '/partner/products',
	create: '/partner/products',
	detail: (productId: string) => `/partner/products/${productId}`,
	update: (productId: string) => `/partner/products/${productId}`,
	delete: (productId: string) => `/partner/products/${productId}`,
	createCar: '/partner/products/cars',
	imageUploadSignature: (productId: string) =>
		`/partner/products/${productId}/images/signature`,
	completeImageUpload: (productId: string) =>
		`/partner/products/${productId}/images/complete`,
	images: (productId: string) => `/partner/products/${productId}/images`,
	image: (productId: string, imageId: string) =>
		`/partner/products/${productId}/images/${imageId}`,
} as const;
