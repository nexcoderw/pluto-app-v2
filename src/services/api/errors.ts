import axios from "axios";

export type BackendErrorPayload = {
	success?: false;
	statusCode?: number;
	message?: string | string[];
	errorCode?: string;
	requestId?: string | null;
	retryable?: boolean;
	recommendedAction?:
		| "NONE"
		| "RETRY"
		| "CORRECT_INPUT"
		| "CHECK_STATUS"
		| "CONTACT_SUPPORT";
	retryAfterSeconds?: number;
	timestamp?: string;
};

export type FieldErrorMap = Record<string, string>;

export class ApiRequestError extends Error {
	readonly statusCode?: number;
	readonly code: string;
	readonly fieldErrors: FieldErrorMap;
	readonly isNetworkError: boolean;
	readonly requestId?: string;
	readonly retryable: boolean;
	readonly recommendedAction: NonNullable<
		BackendErrorPayload["recommendedAction"]
	>;
	readonly retryAfterSeconds?: number;

	constructor(input: {
		message: string;
		statusCode?: number;
		code?: string;
		fieldErrors?: FieldErrorMap;
		isNetworkError?: boolean;
		requestId?: string;
		retryable?: boolean;
		recommendedAction?: BackendErrorPayload["recommendedAction"];
		retryAfterSeconds?: number;
	}) {
		super(input.message);
		this.name = "ApiRequestError";
		this.statusCode = input.statusCode;
		this.code = input.code ?? "REQUEST_FAILED";
		this.fieldErrors = input.fieldErrors ?? {};
		this.isNetworkError = input.isNetworkError ?? false;
		this.requestId = input.requestId;
		this.retryable = input.retryable ?? false;
		this.recommendedAction = input.recommendedAction ?? "NONE";
		this.retryAfterSeconds = input.retryAfterSeconds;
	}
}

export function isApiNotFoundError(error: unknown): boolean {
	return error instanceof ApiRequestError && error.statusCode === 404;
}

export function normalizeApiError(error: unknown): ApiRequestError {
	if (!axios.isAxiosError<BackendErrorPayload>(error)) {
		return new ApiRequestError({
			message: "Something went wrong. Please try again.",
			code: "UNKNOWN_ERROR",
		});
	}

	if (!error.response) {
		return new ApiRequestError({
			message:
				"The server could not be reached. Check your connection and try again.",
			code: "NETWORK_ERROR",
			isNetworkError: true,
		});
	}

	const payload = error.response.data;

	return new ApiRequestError({
		message: normalizeMessage(payload?.message),
		statusCode: payload?.statusCode ?? error.response.status,
		code: payload?.errorCode ?? "REQUEST_FAILED",
		fieldErrors: normalizeFieldErrors(payload?.message),
		requestId: payload?.requestId ?? undefined,
		retryable: payload?.retryable,
		recommendedAction: payload?.recommendedAction,
		retryAfterSeconds: payload?.retryAfterSeconds,
	});
}

function normalizeMessage(message: BackendErrorPayload["message"]): string {
	if (Array.isArray(message)) {
		return message[0] ?? "The request could not be completed.";
	}

	return message ?? "The request could not be completed.";
}

function normalizeFieldErrors(
	message: BackendErrorPayload["message"],
): FieldErrorMap {
	if (!Array.isArray(message)) {
		return {};
	}

	return message.reduce<FieldErrorMap>((errors, item) => {
		const [field, reason] = item.split(" must ");

		if (field && reason) {
			errors[field] = `${field} must ${reason}`;
		}

		return errors;
	}, {});
}
