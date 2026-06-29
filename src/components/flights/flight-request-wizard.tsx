"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CountryCode } from "libphonenumber-js";
import {
  ArrowLeft,
  ArrowRight,
  Armchair,
  CheckCircle2,
  CircleDollarSign,
  Flag,
  Luggage,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageSquareText,
  PlaneLanding,
  PlaneTakeoff,
  UserRound,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListingLoginDialog } from "@/components/listings/listing-login-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUserSession } from "@/hooks/use-user-session";
import {
  PHONE_COUNTRIES,
  getPhoneCountryOption,
} from "@/constants/phone-countries";
import {
  isValidInternationalPhoneNumber,
  normalizePhoneNumber,
} from "@/lib/phone-number";
import { ApiRequestError } from "@/services/api/errors";
import {
  createFlightRequestDraft,
  submitFlightRequest,
  type FlightCabinClass,
  type FlightTripType,
  type SaveFlightRequestPayload,
} from "@/services/api/flight-requests";
import type { UserLoginResponse } from "@/services/api/auth";
import { FlightAirportCombobox } from "./flight-airport-combobox";
import { FlightCompanionsSection } from "./flight-companions-section";
import { FlightDatePicker } from "./flight-date-picker";
import { FlightPhoneInput } from "./flight-phone-input";
import { FlightRequestOverview } from "./flight-request-overview";
import { FlightRequestSuccessDialog } from "./flight-request-success-dialog";
import {
  defaultFlightRequestForm,
  type FlightRequestFormState,
  type FlightWizardStep,
} from "./flight-request-types";
import {
  FlightWizardStepper,
  flightWizardSteps,
} from "./flight-wizard-stepper";
import styles from "./flight-request-page.module.css";

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

export function FlightRequestWizard() {
  const router = useRouter();
  const currentUser = useUserSession();
  const [step, setStep] = useState<FlightWizardStep>("trip");
  const [form, setForm] = useState<FlightRequestFormState>(
    defaultFlightRequestForm,
  );
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [submittedRequestNo, setSubmittedRequestNo] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentStepIndex = flightWizardSteps.findIndex(
    (item) => item.id === step,
  );
  const isLastStep = currentStepIndex === flightWizardSteps.length - 1;
  const isCustomer = currentUser?.role === "CUSTOMER";
  const canSubmit = Boolean(currentUser && isCustomer);

  const submitMutation = useMutation({
    mutationFn: async (payload: SaveFlightRequestPayload) => {
      const draft = await createFlightRequestDraft(payload);

      return submitFlightRequest(draft.id);
    },
    onSuccess: (response) => {
      setSubmittedRequestNo(response.request.requestNo);
      setSuccessMessage(response.message);
      setIsSuccessDialogOpen(true);
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

  function goToPreviousStep() {
    const previousStep = flightWizardSteps[currentStepIndex - 1]?.id;

    if (previousStep) {
      setStep(previousStep);
    }
  }

  function goToNextStep() {
    const validationMessage = validateStep(step, form);

    if (validationMessage) {
      toast.error("Check this step", { description: validationMessage });
      return;
    }

    const nextStep = flightWizardSteps[currentStepIndex + 1]?.id;

    if (nextStep) {
      setStep(nextStep);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      goToNextStep();
      return;
    }

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

    const validationMessage = validateStep(step, form);

    if (validationMessage) {
      toast.error("Check your flight details", {
        description: validationMessage,
      });
      return;
    }

    submitMutation.mutate(buildPayload(form));
  }

  function handleLoginSuccess(response: UserLoginResponse) {
    setIsLoginDialogOpen(false);

    if (response.user.requiresPhoneNumber) {
      router.push("/complete-phone");
      return;
    }

    router.refresh();
  }

  function handleSuccessDialogClose() {
    setIsSuccessDialogOpen(false);
    router.push("/account/flight-requests");
  }

  return (
    <section className={styles.requestShell} data-locked={!currentUser}>
      <div
        className={styles.requestLayout}
        data-locked={!currentUser}
        inert={!currentUser ? true : undefined}
        aria-hidden={!currentUser}
      >
        <div className={styles.wizardFrame}>
          <FlightWizardStepper currentStep={step} />

          <form className={styles.formCard} onSubmit={handleSubmit}>
            {step === "trip" ? (
              <TripStep form={form} today={today} update={update} />
            ) : null}

            {step === "traveler" ? (
              <TravelerStep form={form} today={today} update={update} />
            ) : null}

            {step === "notes" ? <NotesStep form={form} update={update} /> : null}

            <div className={styles.formFooter}>
              <div className={styles.footerStatus}>
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
              </div>

              <div className={styles.wizardActions}>
                {currentStepIndex > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft aria-hidden="true" />
                    Back
                  </Button>
                ) : null}
                <Button
                  type="submit"
                  className={styles.submitButton}
                  disabled={
                    submitMutation.isPending ||
                    Boolean(isLastStep && currentUser && !canSubmit)
                  }
                >
                  {submitMutation.isPending ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className={styles.spinner}
                    />
                  ) : isLastStep ? (
                    <PlaneTakeoff aria-hidden="true" />
                  ) : (
                    <ArrowRight aria-hidden="true" />
                  )}
                  {isLastStep
                    ? currentUser
                      ? "Submit request"
                      : "Sign in to continue"
                    : "Continue"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <FlightRequestOverview form={form} />
      </div>

      {!currentUser ? (
        <FlightRequestAuthGate onSignIn={() => setIsLoginDialogOpen(true)} />
      ) : null}

      <ListingLoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        listingTitle="your flight request"
        intent="flight"
        onAuthenticated={handleLoginSuccess}
      />
      <FlightRequestSuccessDialog
        open={isSuccessDialogOpen}
        message={successMessage}
        requestNo={submittedRequestNo}
        onClose={handleSuccessDialogClose}
      />
    </section>
  );
}

function FlightRequestAuthGate({ onSignIn }: { onSignIn: () => void }) {
  return (
    <aside
      className={styles.authGate}
      aria-labelledby="flight-request-auth-title"
    >
      <span className={styles.authGateIcon} aria-hidden="true">
        <LockKeyhole />
      </span>
      <div className={styles.authGateCopy}>
        <span>Customer sign-in required</span>
        <h2 id="flight-request-auth-title">Sign in to request a flight</h2>
        <p>
          Your account keeps traveler details, request history, and flight desk
          replies together so you can continue without losing this page.
        </p>
      </div>
      <Button
        type="button"
        className={styles.authGateButton}
        aria-label="Sign in to unlock the flight request form"
        onClick={onSignIn}
      >
        <LockKeyhole aria-hidden="true" />
        Sign in to continue
      </Button>
    </aside>
  );
}

type StepProps = {
  form: FlightRequestFormState;
  update: <Key extends keyof FlightRequestFormState>(
    key: Key,
    value: FlightRequestFormState[Key],
  ) => void;
};

function TripStep({ form, today, update }: StepProps & { today: string }) {
  return (
    <div className={styles.stepPanel}>
      <header>
        <span className={styles.eyebrow}>
          <PlaneTakeoff aria-hidden="true" />
          Trip details
        </span>
        <h3>Where, when, and how should we search?</h3>
      </header>

      <div className={styles.segmented} role="group" aria-label="Trip type">
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

      <div className={styles.contactGrid}>
        <label className={styles.field}>
          <span>Legal name</span>
          <Input
            value={form.travelerName}
            placeholder="Full name as on ID"
            icon={<UserRound aria-hidden="true" />}
            onChange={(event) => update("travelerName", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <Input
            type="email"
            value={form.contactEmail}
            placeholder="you@example.com"
            icon={<Mail aria-hidden="true" />}
            onChange={(event) => update("contactEmail", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Phone</span>
          <FlightPhoneInput
            country={form.phoneCountry}
            value={form.contactPhone}
            onCountryChange={(country) => update("phoneCountry", country)}
            onValueChange={(value) => update("contactPhone", value)}
          />
        </label>
      </div>

      <div className={styles.routeFieldsGroup}>
        <div className={styles.routeAirportRow}>
          <FlightAirportCombobox
            label="From"
            value={form.originAirportCode}
            placeholder="Search origin airport"
            icon={<PlaneTakeoff aria-hidden="true" />}
            onChange={(value, airport) => {
              update("originAirportCode", value);
              update("originAirportName", airport?.name ?? "");
            }}
          />
          <FlightAirportCombobox
            label="To"
            value={form.destinationAirportCode}
            placeholder="Search destination airport"
            icon={<PlaneLanding aria-hidden="true" />}
            onChange={(value, airport) => {
              update("destinationAirportCode", value);
              update("destinationAirportName", airport?.name ?? "");
            }}
          />
        </div>
        <div className={styles.routeDateRow}>
          <FlightDatePicker
            label="Departure"
            value={form.departureDate}
            placeholder="Choose date"
            minDate={today}
            onChange={(value) => update("departureDate", value)}
          />
          <FlightDatePicker
            label="Return"
            value={form.returnDate}
            placeholder="Choose date"
            minDate={form.departureDate || today}
            disabled={form.tripType === "ONE_WAY"}
            onChange={(value) => update("returnDate", value)}
          />
        </div>
      </div>
    </div>
  );
}

function TravelerStep({ form, today, update }: StepProps & { today: string }) {
  return (
    <div className={styles.stepPanel}>
      <header>
        <span className={styles.eyebrow}>
          <UserRound aria-hidden="true" />
          Traveler and contact
        </span>
        <h3>Add traveler details and contact preferences.</h3>
      </header>

      <div className={styles.travelerTopGrid}>
        <label className={styles.field}>
          <span>Cabin</span>
          <Select
            value={form.cabinClass}
            onValueChange={(value) =>
              update("cabinClass", value as FlightCabinClass)
            }
          >
            <SelectTrigger className={styles.fieldSelectTrigger}>
              <SelectValue>
                <span className={styles.selectValueWithIcon}>
                  <Armchair aria-hidden="true" />
                  {getCabinLabel(form.cabinClass)}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              {cabinOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className={styles.field}>
          <span>Currency</span>
          <Select
            value={form.currency}
            onValueChange={(value) =>
              update("currency", value as "RWF" | "USD")
            }
          >
            <SelectTrigger className={styles.fieldSelectTrigger}>
              <SelectValue>
                <span className={styles.selectValueWithIcon}>
                  <CircleDollarSign aria-hidden="true" />
                  {form.currency}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="RWF">RWF</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <FlightCompanionsSection
          enabled={form.hasAdditionalTravelers}
          companions={form.companions}
          onEnabledChange={(enabled) => update("hasAdditionalTravelers", enabled)}
          onCompanionsChange={(companions) => update("companions", companions)}
        />
      </div>

      <div className={styles.optionGrid}>
        <label>
          <Checkbox
            checked={form.flexibleDates}
            onCheckedChange={(checked) =>
              update("flexibleDates", Boolean(checked))
            }
          />
          <span>
            <strong>Flexible by 3 days</strong>
            <small>Let us search nearby dates.</small>
          </span>
        </label>
        <label>
          <Checkbox
            checked={form.directFlightPreferred}
            onCheckedChange={(checked) =>
              update("directFlightPreferred", Boolean(checked))
            }
          />
          <span>
            <strong>Prefer direct flights</strong>
            <small>We will prioritize fewer stops.</small>
          </span>
        </label>
        <label className={styles.field}>
          <span>Nationality</span>
          <Select
            value={form.travelerNationality}
            onValueChange={(value) =>
              update("travelerNationality", value as CountryCode)
            }
          >
            <SelectTrigger className={styles.fieldSelectTrigger}>
              <SelectValue>
                <span className={styles.selectValueWithIcon}>
                  <Flag aria-hidden="true" />
                  {getPhoneCountryOption(form.travelerNationality).name}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              className={styles.countryCodeMenu}
              align="start"
              alignItemWithTrigger={false}
            >
              {PHONE_COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className={styles.countryOption}>
                    <span>{country.name}</span>
                    <small>{country.code}</small>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <FlightDatePicker
          label="Date of birth"
          value={form.travelerDateOfBirth}
          placeholder="Choose date"
          maxDate={today}
          description="Choose the date of birth on the lead traveler's document."
          onChange={(value) => update("travelerDateOfBirth", value)}
        />
      </div>
    </div>
  );
}

function NotesStep({ form, update }: StepProps) {
  return (
    <div className={styles.stepPanel}>
      <header>
        <span className={styles.eyebrow}>
          <Luggage aria-hidden="true" />
          Baggage and notes
        </span>
        <h3>Add anything our flight desk should know.</h3>
      </header>
      <div className={styles.notesGrid}>
        <label className={styles.field}>
          <span>Baggage</span>
          <span className={styles.textareaShell}>
            <Luggage aria-hidden="true" />
            <Textarea
              value={form.baggagePreference}
              placeholder="Example: one checked bag and one carry-on"
              className={styles.textarea}
              onChange={(event) =>
                update("baggagePreference", event.target.value)
              }
            />
          </span>
        </label>
        <label className={styles.field}>
          <span>Notes</span>
          <span className={styles.textareaShell}>
            <MessageSquareText aria-hidden="true" />
            <Textarea
              value={form.customerNote}
              placeholder="Preferred airlines, visa constraints, arrival time, special assistance..."
              className={styles.textarea}
              onChange={(event) => update("customerNote", event.target.value)}
            />
          </span>
        </label>
      </div>
    </div>
  );
}

function buildPayload(form: FlightRequestFormState): SaveFlightRequestPayload {
  const originAirportCode = form.originAirportCode.trim().toUpperCase();
  const destinationAirportCode = form.destinationAirportCode
    .trim()
    .toUpperCase();
  const nationality = getPhoneCountryOption(form.travelerNationality).name;
  const companions = form.hasAdditionalTravelers ? form.companions : [];
  const travelers = [
    {
      type: "ADULT" as const,
      legalName: form.travelerName.trim(),
      dateOfBirth: form.travelerDateOfBirth,
      nationality,
    },
    ...companions.map((companion) => ({
      type:
        companion.relationship === "CHILD"
          ? ("CHILD" as const)
          : ("ADULT" as const),
      relationship: companion.relationship || undefined,
      legalName: companion.legalName.trim(),
      contactEmail: companion.contactEmail.trim() || undefined,
      contactPhone: companion.contactPhone.trim()
        ? normalizePhoneNumber(companion.phoneCountry, companion.contactPhone)
        : undefined,
    })),
  ];
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
    currency: form.currency,
    contactEmail: form.contactEmail.trim(),
    contactPhone: form.contactPhone.trim()
      ? normalizePhoneNumber(form.phoneCountry, form.contactPhone)
      : undefined,
    baggagePreference: form.baggagePreference.trim() || undefined,
    customerNote: form.customerNote.trim() || undefined,
    idempotencyKey: createIdempotencyKey(),
  };
}

function validateStep(step: FlightWizardStep, form: FlightRequestFormState) {
  if (step === "trip") {
    const originAirportCode = form.originAirportCode.trim().toUpperCase();
    const destinationAirportCode = form.destinationAirportCode
      .trim()
      .toUpperCase();

    if (!form.travelerName.trim()) {
      return "Add the lead traveler legal name.";
    }

    if (!form.contactEmail.includes("@")) {
      return "Enter a valid contact email.";
    }

    if (
      form.contactPhone.trim() &&
      !isValidInternationalPhoneNumber(form.phoneCountry, form.contactPhone)
    ) {
      return "Use a valid phone number for the selected country code.";
    }

    if (
      !/^[A-Z]{3}$/.test(originAirportCode) ||
      !/^[A-Z]{3}$/.test(destinationAirportCode)
    ) {
      return "Airport codes must be exactly 3 letters.";
    }

    if (originAirportCode === destinationAirportCode) {
      return "Origin and destination airports must be different.";
    }

    if (!form.departureDate) {
      return "Choose a departure date.";
    }

    if (form.tripType === "ROUND_TRIP" && !form.returnDate) {
      return "Choose a return date for a round trip.";
    }
  }

  if (step === "traveler") {
    if (!form.travelerDateOfBirth) {
      return "Add the lead traveler date of birth.";
    }

    if (form.hasAdditionalTravelers) {
      if (!form.companions.length) {
        return "Add at least one companion or turn off companion travelers.";
      }

      for (const [index, companion] of form.companions.entries()) {
        if (!companion.relationship) {
          return `Choose a relationship for companion ${index + 1}.`;
        }

        if (!companion.legalName.trim()) {
          return `Add the full name for companion ${index + 1}.`;
        }

        if (
          companion.contactEmail.trim() &&
          !companion.contactEmail.includes("@")
        ) {
          return `Enter a valid email for companion ${index + 1}.`;
        }

        if (
          companion.contactPhone.trim() &&
          !isValidInternationalPhoneNumber(
            companion.phoneCountry,
            companion.contactPhone,
          )
        ) {
          return `Use a valid phone number for companion ${index + 1}.`;
        }
      }
    }
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

function getCabinLabel(value: FlightCabinClass) {
  return cabinOptions.find((option) => option.value === value)?.label ?? value;
}
