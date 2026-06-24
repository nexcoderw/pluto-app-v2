export type AirportSuggestion = {
  id: string;
  ident: string;
  name: string;
  airportCode: string;
  iataCode: string | null;
  icaoCode: string | null;
  type: string;
  city: string | null;
  countryCode: string;
  regionCode: string | null;
  scheduledService: boolean;
  latitude: number | null;
  longitude: number | null;
  label: string;
};

export type SearchAirportsRequest = {
  search?: string;
  countryCode?: string;
  limit?: number;
};

export type SearchAirportsResponse = {
  items: AirportSuggestion[];
  meta: {
    search: string | null;
    countryCode: string | null;
    limit: number;
    count: number;
  };
};
