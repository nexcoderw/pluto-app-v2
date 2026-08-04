import { NextResponse } from "next/server";

type GoogleAddressComponent = {
	long_name?: string;
	short_name?: string;
	types: string[];
};

type GooglePlaceDetailsResponse = {
	status: string;
	error_message?: string;
	result?: {
		name?: string;
		formatted_address?: string;
		geometry?: {
			location?: {
				lat?: number;
				lng?: number;
			};
		};
		address_components?: GoogleAddressComponent[];
	};
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const placeId = searchParams.get("placeId")?.trim() ?? "";
	const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

	if (!apiKey) {
		return NextResponse.json(
			{ message: "Location search is temporarily unavailable." },
			{ status: 503 },
		);
	}

	if (!placeId) {
		return NextResponse.json(
			{ message: "Select a valid place before retrieving details." },
			{ status: 400 },
		);
	}

	const googleUrl = new URL(
		"https://maps.googleapis.com/maps/api/place/details/json",
	);
	googleUrl.searchParams.set("place_id", placeId);
	googleUrl.searchParams.set("key", apiKey);
	googleUrl.searchParams.set(
		"fields",
		"name,formatted_address,geometry,address_component",
	);

	let response: Response;

	try {
		response = await fetch(googleUrl, {
			cache: "no-store",
			signal: AbortSignal.timeout(8_000),
		});
	} catch {
		return NextResponse.json(
			{ message: "Place details could not reach Google Places." },
			{ status: 502 },
		);
	}

	if (!response.ok) {
		return NextResponse.json(
			{ message: "Google Places details could not be reached." },
			{ status: 502 },
		);
	}

	const payload = (await response.json()) as GooglePlaceDetailsResponse;

	if (payload.status !== "OK" || !payload.result) {
		return NextResponse.json(
			{
				message:
					payload.error_message ??
					`Google Places details failed with status ${payload.status}.`,
			},
			{ status: 502 },
		);
	}

	const latitude = payload.result.geometry?.location?.lat;
	const longitude = payload.result.geometry?.location?.lng;

	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		return NextResponse.json(
			{ message: "Selected place does not include valid coordinates." },
			{ status: 422 },
		);
	}

	return NextResponse.json({
		place: {
			name: payload.result.name ?? "",
			address: payload.result.formatted_address ?? payload.result.name ?? "",
			latitude: String(latitude),
			longitude: String(longitude),
			city: findAddressComponent(payload.result.address_components, [
				"locality",
				"administrative_area_level_2",
				"sublocality",
			]),
			country:
				findAddressComponent(payload.result.address_components, ["country"]) ||
				"Rwanda",
		},
	});
}

function findAddressComponent(
	components: GoogleAddressComponent[] | undefined,
	types: string[],
) {
	const component = components?.find((item) =>
		types.some((type) => item.types.includes(type)),
	);

	return component?.long_name ?? component?.short_name ?? "";
}
