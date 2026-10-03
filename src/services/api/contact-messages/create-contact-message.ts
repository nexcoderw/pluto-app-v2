import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { CONTACT_MESSAGE_ROUTES } from "./routes";
import type {
  CreateContactMessagePayload,
  CreateContactMessageResponse,
} from "./types";

export async function createContactMessage(
  payload: CreateContactMessagePayload,
): Promise<CreateContactMessageResponse> {
  try {
    const response = await apiClient.post<CreateContactMessageResponse>(
      CONTACT_MESSAGE_ROUTES.create,
      payload,
    );
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
