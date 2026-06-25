import type { CountryCode } from "libphonenumber-js";
import type {
  FlightCabinClass,
  FlightTravelerRelationship,
  FlightTripType,
} from "@/services/api/flight-requests";
import { RWANDA_PHONE_COUNTRY } from "@/constants/phone-countries";

export type FlightWizardStep = "trip" | "traveler" | "notes";

export type FlightCompanionTraveler = {
  id: string;
  relationship: FlightTravelerRelationship | "";
  legalName: string;
  contactEmail: string;
  phoneCountry: CountryCode;
  contactPhone: string;
};

export type FlightRequestFormState = {
  tripType: FlightTripType;
  cabinClass: FlightCabinClass;
  originAirportCode: string;
  originAirportName: string;
  destinationAirportCode: string;
  destinationAirportName: string;
  departureDate: string;
  returnDate: string;
  flexibleDates: boolean;
  directFlightPreferred: boolean;
  travelerName: string;
  travelerDateOfBirth: string;
  travelerNationality: CountryCode;
  hasAdditionalTravelers: boolean;
  companions: FlightCompanionTraveler[];
  contactEmail: string;
  contactPhone: string;
  phoneCountry: CountryCode;
  currency: "RWF" | "USD";
  customerNote: string;
  baggagePreference: string;
};

export const defaultFlightRequestForm: FlightRequestFormState = {
  tripType: "ROUND_TRIP",
  cabinClass: "ECONOMY",
  originAirportCode: "KGL",
  originAirportName: "Kigali International Airport",
  destinationAirportCode: "",
  destinationAirportName: "",
  departureDate: "",
  returnDate: "",
  flexibleDates: true,
  directFlightPreferred: false,
  travelerName: "",
  travelerDateOfBirth: "",
  travelerNationality: RWANDA_PHONE_COUNTRY,
  hasAdditionalTravelers: false,
  companions: [],
  contactEmail: "",
  contactPhone: "",
  phoneCountry: RWANDA_PHONE_COUNTRY,
  currency: "RWF",
  customerNote: "",
  baggagePreference: "",
};
