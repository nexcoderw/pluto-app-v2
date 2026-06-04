import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import {
  getCachedPartnerProfileStatus,
  storeUserSession,
} from "../token-store";
import { USER_AUTH_ROUTES } from "./routes";
import type { UserAuthProfile } from "./types";

export type UploadUserProfileImageRequest = {
  file: File;
};

export type UploadUserProfileImageResponse = {
  message: string;
  imageUrl: string;
  publicUrl: string | null;
  user: UserAuthProfile;
  file: {
    id: string;
    key: string;
    bucket: string;
    storageProvider: "CLOUDINARY";
    syncStatus: "SYNCED";
    publicUrl?: string;
  };
};

export async function uploadUserProfileImage({
  file,
}: UploadUserProfileImageRequest): Promise<UploadUserProfileImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<UploadUserProfileImageResponse>(
      USER_AUTH_ROUTES.uploadProfileImage,
      formData,
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
