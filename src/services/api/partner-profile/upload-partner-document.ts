import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PROFILE_ROUTES } from './routes';
import type {
	UploadPartnerDocumentRequest,
	UploadPartnerDocumentResponse,
} from './types';

// Multipart endpoint: sends private verification files through the API upload pipeline.
export async function uploadPartnerDocument({
	title,
	description,
	file,
}: UploadPartnerDocumentRequest): Promise<UploadPartnerDocumentResponse> {
	const formData = new FormData();
	formData.append('title', title);

	if (description) {
		formData.append('description', description);
	}

	formData.append('file', file);

	try {
		const response = await apiClient.post<UploadPartnerDocumentResponse>(
			PARTNER_PROFILE_ROUTES.documents,
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } },
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
