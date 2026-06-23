"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  LoaderCircle,
  LockKeyhole,
  Mail,
  PlaneTakeoff,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListingLoginDialog } from "@/components/listings/listing-login-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserSession } from "@/hooks/use-user-session";
import { ApiRequestError } from "@/services/api/errors";
import {
  createFlightRequestDraft,
  submitFlightRequest,
  type FlightCabinClass,
  type FlightTripType,
  type SaveFlightRequestPayload,
} from "@/services/api/flight-requests";
import type { UserLoginResponse } from "@/services/api/auth";
import styles from "./flight-request-page.module.css";

type FlightRequestFormState = {
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
  travelerNationality: string;
  travelersCount: string;
  contactEmail: string;
  contactPhone: string;
  currency: "RWF" | "USD";
  maxBudget: string;
  customerNote: string;
  baggagePreference: string;
};

const defaultFormState: FlightRequestFormState = {
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
  travelerNationality: "Rwandan",
  travelersCount: "1",
  contactEmail: "",
  contactPhone: "",
  currency: "RWF",
  maxBudget: "",
  customerNote: "",
  baggagePreference: "",
};

const tripTypeOptions: Array<{ value: FlightTripType; label: string }> = [
  { value: "ROUND_TRIP", label: "Round trip" },
  { value: "ONE_WAY", label: "One way" },
];

const cabinOptions: Array<{ value: FlightCabinClass; label: string }> = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM_ECONOMY", label: "Premium economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First" },
];

export function FlightRequestPage() {
  const router = useRouter();
  const currentUser = useUserSession();
  const [form, setForm] = useState<FlightRequestFormState>(defaultFormState);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [submittedRequestNo, setSubmittedRequestNo] = useState<string | null>(
    null,
  );
  const isCustomer = currentUser?.role === "CUSTOMER";
  const submitMutation = useMutation({
    mutationFn: async (payload: SaveFlightRequestPayload) => {
      const draft = await createFlightRequestDraft(payload);

      return submitFlightRequest(draft.id);
    },
    onSuccess: (response) => {
      setSubmittedRequestNo(response.request.requestNo);
      toast.success(response.message, {
        description:
          "We emailed you a confirmation and your request is now in review.",
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : "Flight request could not be submitted. Please try again.";

      toast.error("Flight request was not submitted", {
        description: message,
      });
    },
  });
  const canSubmit = Boolean(currentUser && isCustomer);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setForm((current) => ({
      ...current,
      contactEmail: current.contactEmail || currentUser.email,
      contactPhone: current.contactPhone || currentUser.phone || "",
      travelerName: current.travelerName || currentUser.fullName || "",
    }));
  }, [currentUser]);

  function update<Key extends keyof FlightRequestFormState>(
    key: Key,
    value: FlightRequestFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      setIsLoginDialogOpen(true);
      return;
    }

    if (!isCustomer) {
      toast.error("Customer account required", {
        description:
          "Flight requests are available to customer accounts only. Use your customer account to continue.",
      });
      return;
    }

    const payload = buildPayload(form);
    const validationMessage = validatePayload(payload, form);

    if (validationMessage) {
      toast.error("Check your flight details", {
        description: validationMessage,
      });
      return;
    }

    submitMutation.mutate(payload);
  }

  function handleLoginSuccess(response: UserLoginResponse) {
    setIsLoginDialogOpen(false);

    if (response.user.requiresPhoneNumber) {
      router.push("/complete-phone");
      return;
    }

    router.refresh();
  }

  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <PlaneTakeoff aria-hidden="true" />
              Flight request
            </span>
            <h1>Tell us where you are flying.</h1>
            <p>
              Submit your preferred route and travel details. Pluto Booking will
              review options manually and update you by email and in your
              account.
            </p>
            <div className={styles.heroActions}>
              <Link href="/account/flight-requests">
                My requests
                <ArrowRight aria-hidden="true" />
              </Link>
              <span>
                <ShieldCheck aria-hidden="true" />
                Customers only
              </span>
            </div>
          </div>

          <aside className={styles.routeCard} aria-label="Route preview">
            <span className={styles.routeLabel}>Route preview</span>
            <div>
              <span>{form.originAirportCode || "KGL"}</span>
              <i aria-hidden="true">
                <PlaneTakeoff />
              </i>
              <span>{form.destinationAirportCode || "DST"}</span>
            </div>
            <p>No payment is requested until a flight option is ready.</p>
          </aside>
        </section>

        <section className={styles.requestShell}>
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <header>
              <span className={styles.eyebrow}>
                <UserRound aria-hidden="true" />
                Request details
              </span>
              <h2>Build your flight request</h2>
              <p>
                Use three-letter airport codes for now. Example: KGL, NBO, DXB.
              </p>
            </header>

            <div
              className={styles.segmented}
              role="group"
              aria-label="Trip type"
            >
              {tripTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-active={form.tripType === option.value}
                  onClick={() => update("tripType", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>
                <PlaneTakeoff aria-hidden="true" />
                Route and dates
              </span>
              <div className={styles.routeGrid}>
                <label className={styles.field}>
                  <span>From</span>
                  <Input
                    value={form.originAirportCode}
                    maxLength={3}
                    placeholder="KGL"
                    onChange={(event) =>
                      update(
                        "originAirportCode",
                        event.target.value.toUpperCase(),
                      )
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>To</span>
                  <Input
                    value={form.destinationAirportCode}
                    maxLength={3}
                    placeholder="NBO"
                    onChange={(event) =>
                      update(
                        "destinationAirportCode",
                        event.target.value.toUpperCase(),
                      )
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Departure</span>
                  <Input
                    type="date"
                    min={today}
                    value={form.departureDate}
                    onChange={(event) =>
                      update("departureDate", event.target.value)
                    }
                  />
                </label>
                <label
                  className={styles.field}
                  data-disabled={form.tripType === "ONE_WAY"}
                >
                  <span>Return</span>
                  <Input
                    type="date"
                    min={form.departureDate || today}
                    value={form.returnDate}
                    disabled={form.tripType === "ONE_WAY"}
                    onChange={(event) =>
                      update("returnDate", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>
                <CalendarDays aria-hidden="true" />
                Flight preferences
              </span>
              <div className={styles.preferenceGrid}>
                <label className={styles.field}>
                  <span>Cabin</span>
                  <select
                    value={form.cabinClass}
                    onChange={(event) =>
                      update(
                        "cabinClass",
                        event.target.value as FlightCabinClass,
                      )
                    }
                  >
                    {cabinOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Travelers</span>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={form.travelersCount}
                    onChange={(event) =>
                      update("travelersCount", event.target.value)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Currency</span>
                  <select
                    value={form.currency}
                    onChange={(event) =>
                      update("currency", event.target.value as "RWF" | "USD")
                    }
                  >
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Maximum budget</span>
                  <Input
                    type="number"
                    min={0}
                    value={form.maxBudget}
                    placeholder={form.currency === "RWF" ? "800000" : "650"}
                    onChange={(event) =>
                      update("maxBudget", event.target.value)
                    }
                  />
                </label>
              </div>
              <div className={styles.toggleGrid}>
                <label>
                  <input
                    type="checkbox"
                    checked={form.flexibleDates}
                    onChange={(event) =>
                      update("flexibleDates", event.target.checked)
                    }
                  />
                  Flexible by 3 days
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.directFlightPreferred}
                    onChange={(event) =>
                      update("directFlightPreferred", event.target.checked)
                    }
                  />
                  Prefer direct flights
                </label>
              </div>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>
                <UserRound aria-hidden="true" />
                Lead traveler
              </span>
              <div className={styles.travelerGrid}>
                <label className={styles.field}>
                  <span>Legal name</span>
                  <Input
                    value={form.travelerName}
                    placeholder="Full name as on ID"
                    onChange={(event) =>
                      update("travelerName", event.target.value)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Date of birth</span>
                  <Input
                    type="date"
                    value={form.travelerDateOfBirth}
                    onChange={(event) =>
                      update("travelerDateOfBirth", event.target.value)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Nationality</span>
                  <Input
                    value={form.travelerNationality}
                    placeholder="Rwandan"
                    onChange={(event) =>
                      update("travelerNationality", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionTitle}>
                <Mail aria-hidden="true" />
                Contact and notes
              </span>
              <div className={styles.gridTwo}>
                <label className={styles.field}>
                  <span>Email</span>
                  <Input
                    type="email"
                    value={form.contactEmail}
                    placeholder="you@example.com"
                    onChange={(event) =>
                      update("contactEmail", event.target.value)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Phone</span>
                  <Input
                    value={form.contactPhone}
                    placeholder="+250..."
                    onChange={(event) =>
                      update("contactPhone", event.target.value)
                    }
                  />
                </label>
              </div>
              <label className={styles.field}>
                <span>Baggage</span>
                <Textarea
                  value={form.baggagePreference}
                  placeholder="Example: one checked bag and one carry-on"
                  className={styles.textarea}
                  onChange={(event) =>
                    update("baggagePreference", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Notes</span>
                <Textarea
                  value={form.customerNote}
                  placeholder="Preferred airlines, visa constraints, arrival time, special assistance..."
                  className={styles.textarea}
                  onChange={(event) =>
                    update("customerNote", event.target.value)
                  }
                />
              </label>
            </div>

            <div className={styles.formFooter}>
              {!currentUser ? (
                <p>
                  <LockKeyhole aria-hidden="true" />
                  Sign in as a customer before submitting this request.
                </p>
              ) : !isCustomer ? (
                <p>
                  <LockKeyhole aria-hidden="true" />
                  Only customer accounts can request flights.
                </p>
              ) : submittedRequestNo ? (
                <p>
                  <CheckCircle2 aria-hidden="true" />
                  Submitted as {submittedRequestNo}. Track it in your account.
                </p>
              ) : (
                <p>
                  <Mail aria-hidden="true" />
                  We will email confirmation after submission.
                </p>
              )}
              <Button
                type="submit"
                className={styles.submitButton}
                disabled={
                  submitMutation.isPending || Boolean(currentUser && !canSubmit)
                }
              >
                {submitMutation.isPending ? (
                  <LoaderCircle aria-hidden="true" className={styles.spinner} />
                ) : (
                  <PlaneTakeoff aria-hidden="true" />
                )}
                {currentUser ? "Submit flight request" : "Sign in to continue"}
              </Button>
            </div>
          </form>
        </section>
      </main>

      <ListingLoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        listingTitle="your flight request"
        intent="reserve"
        onAuthenticated={handleLoginSuccess}
      />
    </>
  );
}

function buildPayload(form: FlightRequestFormState): SaveFlightRequestPayload {
  const originAirportCode = form.originAirportCode.trim().toUpperCase();
  const destinationAirportCode = form.destinationAirportCode
    .trim()
    .toUpperCase();
  const travelersCount = Math.min(
    12,
    Math.max(1, Number.parseInt(form.travelersCount, 10) || 1),
  );
  const travelers = Array.from({ length: travelersCount }, (_, index) => ({
    type: "ADULT" as const,
    legalName:
      index === 0
        ? form.travelerName.trim()
        : `${form.travelerName.trim()} traveler ${index + 1}`,
    dateOfBirth: form.travelerDateOfBirth,
    nationality: form.travelerNationality.trim(),
  }));
  const segments = [
    {
      originAirportCode,
      destinationAirportCode,
      departureDate: form.departureDate,
      ...(form.flexibleDates
        ? { latestDepartureDate: addDaysIso(form.departureDate, 3) }
        : {}),
    },
  ];

  if (form.tripType === "ROUND_TRIP") {
    segments.push({
      originAirportCode: destinationAirportCode,
      destinationAirportCode: originAirportCode,
      departureDate: form.returnDate,
      ...(form.flexibleDates
        ? { latestDepartureDate: addDaysIso(form.returnDate, 3) }
        : {}),
    });
  }

  return {
    tripType: form.tripType,
    cabinClass: form.cabinClass,
    segments,
    travelers,
    flexibleDates: form.flexibleDates,
    flexibilityDays: form.flexibleDates ? 3 : undefined,
    directFlightPreferred: form.directFlightPreferred,
    maxBudget: form.maxBudget ? Number(form.maxBudget) : undefined,
    currency: form.currency,
    contactEmail: form.contactEmail.trim(),
    contactPhone: form.contactPhone.trim() || undefined,
    baggagePreference: form.baggagePreference.trim() || undefined,
    customerNote: form.customerNote.trim() || undefined,
    idempotencyKey: createIdempotencyKey(),
  };
}

function validatePayload(
  payload: SaveFlightRequestPayload,
  form: FlightRequestFormState,
) {
  const [firstSegment] = payload.segments;

  if (
    !/^[A-Z]{3}$/.test(firstSegment.originAirportCode) ||
    !/^[A-Z]{3}$/.test(firstSegment.destinationAirportCode)
  ) {
    return "Airport codes must be exactly 3 letters.";
  }

  if (firstSegment.originAirportCode === firstSegment.destinationAirportCode) {
    return "Origin and destination airports must be different.";
  }

  if (!form.departureDate) {
    return "Choose a departure date.";
  }

  if (form.tripType === "ROUND_TRIP" && !form.returnDate) {
    return "Choose a return date for a round trip.";
  }

  if (!form.travelerName.trim() || !form.travelerDateOfBirth) {
    return "Add the lead traveler legal name and date of birth.";
  }

  if (!form.contactEmail.includes("@")) {
    return "Enter a valid contact email.";
  }

  return null;
}

function addDaysIso(value: string, days: number) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `flight-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
