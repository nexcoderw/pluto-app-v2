import { ApiRequestError } from "../errors";
import type { UserAuthProfile } from "./types";

export function isPublicUserRole(role: UserAuthProfile["role"]) {
	return role === "CUSTOMER" || role === "PARTNER";
}

export function createPublicUserRoleError() {
	return new ApiRequestError({
		message:
			"Admin accounts must use the Pluto Booking admin portal. This public app only supports customer and partner accounts.",
		statusCode: 403,
		code: "PUBLIC_APP_ROLE_NOT_ALLOWED",
	});
}
