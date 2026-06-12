import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { setUserAccessToken } from "../token-store";
import { USER_AUTH_ROUTES } from "./routes";
import { storeAuthenticatedUserSession } from "./session-bootstrap";
import type { UserAuthResponse } from "./types";

export type ConfirmEmailVerificationRequest = {
  token: string;
  deviceName?: string;
};

export type ConfirmEmailVerificationResponse = UserAuthResponse;

export async function confirmEmailVerification(
  payload: ConfirmEmailVerificationRequest,
): Promise<ConfirmEmailVerificationResponse> {
  try {
    const response = await apiClient.post<ConfirmEmailVerificationResponse>(
      USER_AUTH_ROUTES.confirmEmailVerification,
      payload,
    );

    setUserAccessToken(response.data.accessToken);
    await storeAuthenticatedUserSession(response.data.user);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
