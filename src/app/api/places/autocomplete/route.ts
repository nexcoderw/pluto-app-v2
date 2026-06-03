import { NextResponse } from "next/server";

type GoogleAutocompletePrediction = {
	description?: string;
	place_id?: string;
	structured_formatting?: {
		main_text?: string;
		secondary_text?: string;
	};
};

type GoogleAutocompleteResponse = {
	status: string;
	error_message?: string;
	predictions?: GoogleAutocompletePrediction[];
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const input = searchParams.get("input")?.trim() ?? "";
	const apiKey =
		process.env.GOOGLE_MAPS_API_KEY ??
		process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

	if (!apiKey) {
		return NextResponse.json(
			{ message: "Google Places is not configured." },
			{ status: 500 },
		);
	}

	if (input.length < 2) {
		return NextResponse.json({ predictions: [] });
	}

	const googleUrl = new URL(
		"https://maps.googleapis.com/maps/api/place/autocomplete/json",
	);
	googleUrl.searchParams.set("input", input);
	googleUrl.searchParams.set("key", apiKey);
	googleUrl.searchParams.set("components", "country:rw");

	const response = await fetch(googleUrl, {
		cache: "no-store",
	});

	if (!response.ok) {
		return NextResponse.json(
			{ message: "Google Places autocomplete could not be reached." },
			{ status: 502 },
		);
	}

	const payload = (await response.json()) as GoogleAutocompleteResponse;

	if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
		return NextResponse.json(
			{
				message:
					payload.error_message ??
					`Google Places autocomplete failed with status ${payload.status}.`,
			},
			{ status: 502 },
		);
	}

	return NextResponse.json({
		predictions: (payload.predictions ?? []).map((prediction) => ({
			placeId: prediction.place_id ?? "",
			description: prediction.description ?? "",
			mainText:
				prediction.structured_formatting?.main_text ??
				prediction.description ??
				"",
			secondaryText: prediction.structured_formatting?.secondary_text ?? "",
		})),
	});
}
