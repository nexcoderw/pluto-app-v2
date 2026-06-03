import { ApiRequestError } from '../errors';
import { completeProductImageUpload } from './complete-product-image-upload';
import { createProductImageUploadSignature } from './create-product-image-upload-signature';
import type {
	PartnerProductResponse,
	UploadProductImageRequest,
} from './types';

type CloudinaryUploadResponse = {
	public_id: string;
	secure_url?: string;
};

// Request: uploads one listing image directly to Cloudinary, then registers it on the API.
export async function uploadProductImage({
	productId,
	file,
	altText,
	isCover,
	sortOrder,
}: UploadProductImageRequest): Promise<PartnerProductResponse> {
	const signature = await createProductImageUploadSignature({ productId, file });
	const uploadResult = await uploadDirectlyToCloudinary(file, signature);

	return completeProductImageUpload({
		productId,
		publicId: uploadResult.public_id || signature.publicId,
		originalName: file.name,
		mimeType: file.type || 'application/octet-stream',
		sizeBytes: file.size,
		altText,
		isCover,
		sortOrder,
	});
}

async function uploadDirectlyToCloudinary(
	file: File,
	signature: Awaited<ReturnType<typeof createProductImageUploadSignature>>,
): Promise<CloudinaryUploadResponse> {
	const formData = new FormData();

	formData.append('file', file);
	formData.append('api_key', signature.apiKey);
	formData.append('signature', signature.signature);

	for (const [key, value] of Object.entries(signature.uploadParameters)) {
		formData.append(key, String(value));
	}

	try {
		const response = await fetch(signature.uploadUrl, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new ApiRequestError({
				message:
					'Cloudinary could not receive this image. Check the file and try again.',
				statusCode: response.status,
				code: 'CLOUDINARY_UPLOAD_FAILED',
			});
		}

		return (await response.json()) as CloudinaryUploadResponse;
	} catch (error) {
		if (error instanceof ApiRequestError) {
			throw error;
		}

		throw new ApiRequestError({
			message:
				'The image could not be uploaded to Cloudinary. Check your connection and try again.',
			code: 'CLOUDINARY_UPLOAD_NETWORK_ERROR',
			isNetworkError: true,
		});
	}
}
