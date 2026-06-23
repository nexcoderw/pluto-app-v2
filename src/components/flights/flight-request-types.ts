import type { CountryCode } from "libphonenumber-js";
import type {
  FlightCabinClass,
  FlightTripType,
} from "@/services/api/flight-requests";
import { RWANDA_PHONE_COUNTRY } from "@/constants/phone-countries";

export type FlightWizardStep = "trip" | "traveler";

export type FlightRequestFormState = {
  tripType: FlightTripType;
  cabinClass: FlightCabinClass;
  originAirportCode: string;
  destinationAirportCode: string;
  departureDate: string;
  returnDate: string;
  flexibleDates: boolean;
  directFlightPreferred: boolean;
  travelerName: string;
  travelerDateOfBirth: string;
  travelerNationality: CountryCode;
  travelersCount: string;
  contactEmail: string;
  contactPhone: string;
  phoneCountry: CountryCode;
  currency: "RWF" | "USD";
  maxBudget: string;
  customerNote: string;
  baggagePreference: string;
};

export const defaultFlightRequestForm: FlightRequestFormState = {
  tripType: "ROUND_TRIP",
  cabinClass: "ECONOMY",
  originAirportCode: "KGL",
  destinationAirportCode: "",
  departureDate: "",
  returnDate: "",
  flexibleDates: true,
  directFlightPreferred: false,
  travelerName: "",
  travelerDateOfBirth: "",
  travelerNationality: RWANDA_PHONE_COUNTRY,
  travelersCount: "1",
  contactEmail: "",
  contactPhone: "",
  phoneCountry: RWANDA_PHONE_COUNTRY,
  currency: "RWF",
  maxBudget: "",
  customerNote: "",
  baggagePreference: "",
};
