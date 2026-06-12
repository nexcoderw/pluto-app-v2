import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { USER_AUTH_ROUTES } from "./routes";

export type ResendEmailVerificationRequest = {
  email: string;
};

export type ResendEmailVerificationResponse = {
  message: string;
  verificationExpiresInMinutes: number;
};

export async function resendEmailVerification(
  payload: ResendEmailVerificationRequest,
): Promise<ResendEmailVerificationResponse> {
  try {
    const response = await apiClient.post<ResendEmailVerificationResponse>(
      USER_AUTH_ROUTES.resendEmailVerification,
      payload,
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
