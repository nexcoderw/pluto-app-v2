import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import {
  getCachedPartnerProfileStatus,
  storeUserSession,
} from "../token-store";
import { USER_AUTH_ROUTES } from "./routes";
import type { UserAuthProfile } from "./types";

export type UpdateUserProfileRequest = {
  fullName?: string;
  email?: string;
  phone?: string;
};

export type UpdateUserProfileResponse = {
  message: string;
  user: UserAuthProfile;
};

export async function updateUserProfile(
  payload: UpdateUserProfileRequest,
): Promise<UpdateUserProfileResponse> {
  try {
    const response = await apiClient.patch<UpdateUserProfileResponse>(
      USER_AUTH_ROUTES.updateProfile,
      payload,
    );

    storeUpdatedUserProfile(response.data.user);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

function storeUpdatedUserProfile(user: UserAuthProfile): void {
  storeUserSession(
    user,
    user.role === "PARTNER" ? getCachedPartnerProfileStatus() : null,
  );
}
