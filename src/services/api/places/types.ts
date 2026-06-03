export type PlacePrediction = {
	placeId: string;
	description: string;
	mainText: string;
	secondaryText: string;
};

export type SearchPlacesResponse = {
	predictions: PlacePrediction[];
};

export type PlaceDetails = {
	name: string;
	address: string;
	latitude: string;
	longitude: string;
	city: string;
	country: string;
};

export type GetPlaceDetailsResponse = {
	place: PlaceDetails;
};
