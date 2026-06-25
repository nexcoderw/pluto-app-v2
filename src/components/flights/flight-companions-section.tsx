"use client";

import type { CountryCode } from "libphonenumber-js";
import { Mail, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RWANDA_PHONE_COUNTRY } from "@/constants/phone-countries";
import type { FlightTravelerRelationship } from "@/services/api/flight-requests";
import { FlightPhoneInput } from "./flight-phone-input";
import type { FlightCompanionTraveler } from "./flight-request-types";
import styles from "./flight-companions-section.module.css";

type FlightCompanionsSectionProps = {
  enabled: boolean;
  companions: FlightCompanionTraveler[];
  onEnabledChange: (enabled: boolean) => void;
  onCompanionsChange: (companions: FlightCompanionTraveler[]) => void;
};

const relationshipOptions: Array<{
  value: FlightTravelerRelationship;
  label: string;
}> = [
  { value: "PARENT", label: "Parent" },
  { value: "SIBLING", label: "Sibling" },
  { value: "CHILD", label: "Child" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "FRIEND", label: "Friend" },
  { value: "COLLEAGUE", label: "Colleague" },
  { value: "OTHER", label: "Other" },
];

export function FlightCompanionsSection({
  enabled,
  companions,
  onEnabledChange,
  onCompanionsChange,
}: FlightCompanionsSectionProps) {
  function handleToggle(nextEnabled: boolean) {
    onEnabledChange(nextEnabled);

    if (nextEnabled && companions.length === 0) {
      onCompanionsChange([createCompanion()]);
    }
  }

  function updateCompanion(
    companionId: string,
    patch: Partial<FlightCompanionTraveler>,
  ) {
    onCompanionsChange(
      companions.map((companion) =>
        companion.id === companionId ? { ...companion, ...patch } : companion,
      ),
    );
  }

  function removeCompanion(companionId: string) {
    const nextCompanions = companions.filter(
      (companion) => companion.id !== companionId,
    );

    onCompanionsChange(nextCompanions);

    if (nextCompanions.length === 0) {
      onEnabledChange(false);
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.toggleField}>
        <span>Companions</span>
        <label className={styles.toggle} data-enabled={enabled}>
          <span>
            <strong>Traveling with others?</strong>
            <small>Add companion details only when someone joins this trip.</small>
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => handleToggle(Boolean(checked))}
            aria-label="Add companion travelers"
          />
        </label>
      </div>

      {enabled ? (
        <div className={styles.companions}>
          {companions.map((companion, index) => (
            <article key={companion.id} className={styles.companionCard}>
              <header>
                <span>
                  <UsersRound aria-hidden="true" />
                  Companion {index + 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  aria-label={`Remove companion ${index + 1}`}
                  onClick={() => removeCompanion(companion.id)}
                >
                  <Trash2 aria-hidden="true" />
                  Remove
                </Button>
              </header>

              <div className={styles.fields}>
                <label className={styles.field}>
                  <span>Relationship</span>
                  <Select
                    value={companion.relationship}
                    onValueChange={(value) =>
                      updateCompanion(companion.id, {
                        relationship: value as FlightTravelerRelationship,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose relationship" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className={styles.field}>
                  <span>Full name</span>
                  <Input
                    value={companion.legalName}
                    placeholder="Companion full name"
                    icon={<UserRound aria-hidden="true" />}
                    onChange={(event) =>
                      updateCompanion(companion.id, {
                        legalName: event.target.value,
                      })
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <Input
                    type="email"
                    value={companion.contactEmail}
                    placeholder="Optional email"
                    icon={<Mail aria-hidden="true" />}
                    onChange={(event) =>
                      updateCompanion(companion.id, {
                        contactEmail: event.target.value,
                      })
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Phone</span>
                  <FlightPhoneInput
                    country={companion.phoneCountry}
                    value={companion.contactPhone}
                    onCountryChange={(country) =>
                      updateCompanion(companion.id, {
                        phoneCountry: country,
                      })
                    }
                    onValueChange={(value) =>
                      updateCompanion(companion.id, {
                        contactPhone: value,
                      })
                    }
                  />
                </label>
              </div>
            </article>
          ))}

          {companions.length < 8 ? (
            <Button
              type="button"
              variant="outline"
              className={styles.addButton}
              onClick={() =>
                onCompanionsChange([...companions, createCompanion()])
              }
            >
              <Plus aria-hidden="true" />
              Add another companion
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function createCompanion(): FlightCompanionTraveler {
  return {
    id: createId(),
    relationship: "",
    legalName: "",
    contactEmail: "",
    phoneCountry: RWANDA_PHONE_COUNTRY as CountryCode,
    contactPhone: "",
  };
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `companion-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
