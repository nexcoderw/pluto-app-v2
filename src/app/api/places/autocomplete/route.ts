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
	const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

	if (!apiKey) {
		return NextResponse.json(
			{ message: "Location search is temporarily unavailable." },
			{ status: 503 },
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

	let response: Response;

	try {
		response = await fetch(googleUrl, {
			cache: "no-store",
			signal: AbortSignal.timeout(8_000),
		});
	} catch {
		return NextResponse.json(
			{ message: "Location search could not reach Google Places." },
			{ status: 502 },
		);
	}

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
