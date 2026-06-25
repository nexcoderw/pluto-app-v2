"use client";

import type { CountryCode } from "libphonenumber-js";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PHONE_COUNTRIES,
  getPhoneCountryOption,
} from "@/constants/phone-countries";
import { getPhonePlaceholder } from "@/lib/phone-number";
import styles from "./flight-request-page.module.css";

type FlightPhoneInputProps = {
  country: CountryCode;
  value: string;
  onCountryChange: (country: CountryCode) => void;
  onValueChange: (value: string) => void;
};

export function FlightPhoneInput({
  country,
  value,
  onCountryChange,
  onValueChange,
}: FlightPhoneInputProps) {
  const selectedCountry = getPhoneCountryOption(country);
  const displayValue = stripSelectedCallingCode(value, selectedCountry.callingCode);
  const placeholder = getLocalPhonePlaceholder(country, selectedCountry.callingCode);

  return (
    <div className={styles.phoneInputShell}>
      <Select
        value={country}
        onValueChange={(nextCountry) =>
          onCountryChange(nextCountry as CountryCode)
        }
      >
        <SelectTrigger
          className={styles.countryCodeTrigger}
          aria-label="Country code"
        >
          <SelectValue>
            <span>{selectedCountry.code}</span>
            <strong>{selectedCountry.callingCode}</strong>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className={styles.countryCodeMenu}
          align="start"
          alignItemWithTrigger={false}
        >
          {PHONE_COUNTRIES.map((countryOption) => (
            <SelectItem key={countryOption.code} value={countryOption.code}>
              <span className={styles.countryOption}>
                <strong>{countryOption.callingCode}</strong>
                <span>{countryOption.name}</span>
                <small>{countryOption.code}</small>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className={styles.phoneDivider} aria-hidden="true" />
      <Phone aria-hidden="true" />
      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9 ]*"
        value={displayValue}
        placeholder={placeholder}
        onChange={(event) =>
          onValueChange(event.target.value.replace(/[^\d\s]/g, ""))
        }
      />
    </div>
  );
}

function stripSelectedCallingCode(value: string, callingCode: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith(callingCode)) {
    return value;
  }

  return trimmedValue.slice(callingCode.length).trimStart();
}

function getLocalPhonePlaceholder(country: CountryCode, callingCode: string) {
  return getPhonePlaceholder(country).replace(callingCode, "").trim();
}
