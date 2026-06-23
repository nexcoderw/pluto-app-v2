export type FlightTripType = "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";

export type FlightCabinClass =
  | "ECONOMY"
  | "PREMIUM_ECONOMY"
  | "BUSINESS"
  | "FIRST";

export type FlightTravelerType = "ADULT" | "CHILD" | "INFANT";

export type FlightRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SEARCHING"
  | "NEEDS_INFORMATION"
  | "QUOTE_READY"
  | "CUSTOMER_APPROVAL_REQUIRED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "TICKETING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "EXPIRED"
  | "FAILED"
  | "REFUNDED";

export type FlightPaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type FlightRequestOrderBy = "createdAt" | "updatedAt" | "status";

export type FlightRequestSortOrder = "asc" | "desc";

export type FlightTripSegmentPayload = {
  originAirportCode: string;
  destinationAirportCode: string;
  departureDate: string;
  latestDepartureDate?: string;
};

export type FlightTravelerPayload = {
  type: FlightTravelerType;
  legalName: string;
  dateOfBirth: string;
  nationality: string;
  gender?: string;
};

export type SaveFlightRequestPayload = {
  tripType: FlightTripType;
  cabinClass: FlightCabinClass;
  segments: FlightTripSegmentPayload[];
  travelers: FlightTravelerPayload[];
  flexibleDates?: boolean;
  flexibilityDays?: number;
  directFlightPreferred?: boolean;
  preferredAirlines?: string[];
  maxBudget?: number;
  currency?: "USD" | "RWF";
  contactEmail: string;
  contactPhone?: string;
  baggagePreference?: string;
  specialAssistance?: string;
  customerNote?: string;
  idempotencyKey?: string;
};

export type ListFlightRequestsRequest = {
  page?: number;
  limit?: number;
  search?: string;
  status?: FlightRequestStatus;
  paymentStatus?: FlightPaymentStatus;
  orderBy?: FlightRequestOrderBy;
  order?: FlightRequestSortOrder;
};

export type FlightTripSegment = {
  id: string;
  sequence: number;
  originAirportCode: string;
  destinationAirportCode: string;
  departureDate: string;
  latestDepartureDate: string | null;
};

export type FlightTraveler = {
  id: string;
  sequence: number;
  type: FlightTravelerType;
  legalName: string;
  dateOfBirth: string;
  nationality: string;
  gender: string | null;
};

export type FlightRequestMessageType =
  | "CUSTOMER_MESSAGE"
  | "STAFF_MESSAGE"
  | "STATUS_UPDATE"
  | "SYSTEM";

export type FlightRequestMessage = {
  id: string;
  type: FlightRequestMessageType;
  body: string;
  isInternal: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    role: string;
    imageKey: string | null;
  } | null;
};

export type FlightRequestStatusHistory = {
  id: string;
  fromStatus: FlightRequestStatus | null;
  toStatus: FlightRequestStatus;
  customerReason: string | null;
  staffReason: string | null;
  createdAt: string;
  changedById: string | null;
};

export type FlightQuote = {
  id: string;
  status: string;
  totalAmount: string;
  currency: string;
  paymentUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type FlightRequestSummary = {
  id: string;
  requestNo: string;
  customerId: string;
  assignedStaffId: string | null;
  status: FlightRequestStatus;
  paymentStatus: FlightPaymentStatus;
  tripType: FlightTripType;
  cabinClass: FlightCabinClass;
  flexibleDates: boolean;
  flexibilityDays: number | null;
  directFlightPreferred: boolean;
  maxBudget: string | null;
  currency: string;
  contactEmail: string;
  contactPhone: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  segments: FlightTripSegment[];
  _count?: {
    travelers: number;
    messages: number;
    attachments: number;
  };
};

export type FlightRequestDetail = FlightRequestSummary & {
  travelers: FlightTraveler[];
  statusHistory: FlightRequestStatusHistory[];
  messages: FlightRequestMessage[];
  quotes?: FlightQuote[];
  baggagePreference: string | null;
  specialAssistance: string | null;
  customerNote: string | null;
};

export type ListFlightRequestsResponse = {
  items: FlightRequestSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type SubmitFlightRequestResponse = {
  message: string;
  request: FlightRequestDetail;
};

export type FlightRequestMessagePayload = {
  body: string;
};

export type FlightRequestMessageResponse = {
  message: string;
  item: FlightRequestMessage;
};
