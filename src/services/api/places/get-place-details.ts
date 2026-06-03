import { PLACE_ROUTES } from "./routes";
import type { GetPlaceDetailsResponse } from "./types";

// Request: retrieves one selected place and its coordinates through the local route.
export async function getPlaceDetails(
	placeId: string,
): Promise<GetPlaceDetailsResponse> {
	const url = new URL(PLACE_ROUTES.details, window.location.origin);
	url.searchParams.set("placeId", placeId);

	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(await readPlaceError(response));
	}

	return (await response.json()) as GetPlaceDetailsResponse;
}

async function readPlaceError(response: Response) {
	try {
		const payload = (await response.json()) as { message?: string };

		return payload.message ?? "Place details could not be retrieved.";
	} catch {
		return "Place details could not be retrieved.";
	}
}
