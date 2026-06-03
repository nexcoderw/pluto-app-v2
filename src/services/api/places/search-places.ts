import { PLACE_ROUTES } from "./routes";
import type { SearchPlacesResponse } from "./types";

// Request: retrieves Google Places suggestions through the local Next route.
export async function searchPlaces(
	input: string,
): Promise<SearchPlacesResponse> {
	const url = new URL(PLACE_ROUTES.autocomplete, window.location.origin);
	url.searchParams.set("input", input);

	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(await readPlaceError(response));
	}

	return (await response.json()) as SearchPlacesResponse;
}

async function readPlaceError(response: Response) {
	try {
		const payload = (await response.json()) as { message?: string };

		return payload.message ?? "Places search could not be completed.";
	} catch {
		return "Places search could not be completed.";
	}
}
