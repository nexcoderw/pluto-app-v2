import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { USER_AUTH_ROUTES } from "./routes";

export type ChangeUserPasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangeUserPasswordResponse = {
  message: string;
};

export async function changeUserPassword(
  payload: ChangeUserPasswordRequest,
): Promise<ChangeUserPasswordResponse> {
  try {
    const response = await apiClient.patch<ChangeUserPasswordResponse>(
      USER_AUTH_ROUTES.changePassword,
      payload,
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
