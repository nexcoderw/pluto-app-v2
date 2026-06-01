import axios from 'axios';
import { clearUserAccessToken, getUserAccessToken } from './token-store';

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	timeout: 15_000,
	headers: {
		'Content-Type': 'application/json',
	},
});

apiClient.interceptors.request.use((config) => {
	const accessToken = getUserAccessToken();

	if (isFormDataPayload(config.data) && config.headers) {
		if (typeof config.headers.delete === 'function') {
			config.headers.delete('Content-Type');
			config.headers.delete('content-type');
		} else {
			delete (config.headers as Record<string, unknown>)['Content-Type'];
			delete (config.headers as Record<string, unknown>)['content-type'];
		}
	}

	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}

	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			clearUserAccessToken();
		}

		return Promise.reject(error);
	},
);

function isFormDataPayload(payload: unknown): payload is FormData {
	return typeof FormData !== 'undefined' && payload instanceof FormData;
}
