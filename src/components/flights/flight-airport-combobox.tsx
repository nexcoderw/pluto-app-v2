"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LoaderCircle, PlaneLanding, Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApiRequestError } from "@/services/api/errors";
import {
  searchAirports,
  type AirportSuggestion,
} from "@/services/api/reference-airports";
import styles from "./flight-request-page.module.css";

type FlightAirportComboboxProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: ReactNode;
  onChange: (airportCode: string, airport?: AirportSuggestion) => void;
};

const SEARCH_DELAY_MS = 220;
const airportSearchCache = new Map<string, AirportSuggestion[]>();

export function FlightAirportCombobox({
  label,
  value,
  placeholder,
  icon,
  onChange,
}: FlightAirportComboboxProps) {
  const listboxId = useId();
  const wrapperRef = useRef<HTMLLabelElement | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [items, setItems] = useState<AirportSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchText = inputValue.trim();
  const selectedCode = value.trim().toUpperCase();
  const helperText = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }

    if (!searchText) {
      return "Search by airport code, city, or airport name.";
    }

    if (!selectedCode) {
      return "Choose one suggestion to lock the airport code.";
    }

    return "";
  }, [errorMessage, searchText, selectedCode]);

  useEffect(() => {
    setInputValue((current) => {
      if (current.trim() || !value) {
        return current;
      }

      return value;
    });
  }, [value]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);

    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const query = searchText || value;
    const cacheKey = query.trim().toLowerCase();

    if (query.trim().length < 2) {
      setItems([]);
      setErrorMessage("");
      return;
    }

    const cachedItems = airportSearchCache.get(cacheKey);

    if (cachedItems) {
      setItems(cachedItems);
      setErrorMessage("");
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await searchAirports(
          {
            search: query,
            limit: 8,
          },
          abortController.signal,
        );

        if (!abortController.signal.aborted) {
          airportSearchCache.set(cacheKey, response.items);
          setItems(response.items);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setItems([]);
          setErrorMessage(
            error instanceof ApiRequestError
              ? error.message
              : "Airport search is unavailable right now.",
          );
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DELAY_MS);

    return () => {
      abortController.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, searchText, value]);

  function handleInputChange(nextValue: string) {
    setInputValue(nextValue);
    setIsOpen(true);
    setErrorMessage("");

    const possibleCode = nextValue.trim().toUpperCase();
    onChange(/^[A-Z]{3}$/.test(possibleCode) ? possibleCode : "");
  }

  function handleSelect(airport: AirportSuggestion) {
    const code = airport.iataCode;

    if (!code) {
      setErrorMessage("Choose an airport with a valid IATA code.");
      return;
    }

    onChange(code, airport);
    setInputValue(`${code} - ${airport.name}`);
    setItems([]);
    setIsOpen(false);
    setErrorMessage("");
  }

  return (
    <label ref={wrapperRef} className={styles.field}>
      <span>{label}</span>
      <div className={styles.airportCombobox}>
        <Input
          value={inputValue}
          placeholder={placeholder}
          icon={icon}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onChange={(event) => handleInputChange(event.target.value)}
          endAdornment={
            <span className={styles.airportInputStatus}>
              {isLoading ? (
                <LoaderCircle className={styles.spinner} />
              ) : inputValue ? (
                <button
                  type="button"
                  aria-label={`Clear ${label.toLowerCase()} airport`}
                  onClick={() => {
                    setInputValue("");
                    setItems([]);
                    setErrorMessage("");
                    onChange("");
                  }}
                >
                  <XCircle aria-hidden="true" />
                </button>
              ) : (
                <Search aria-hidden="true" />
              )}
            </span>
          }
        />

        {isOpen ? (
          <div
            id={listboxId}
            className={styles.airportMenu}
            role="listbox"
            aria-label={`${label} airport suggestions`}
          >
            {items.length ? (
              items.map((airport) => {
                const code = airport.iataCode ?? airport.airportCode;

                return (
                  <button
                    key={airport.id}
                    type="button"
                    role="option"
                    aria-selected={code === selectedCode}
                    onClick={() => handleSelect(airport)}
                  >
                    <span className={styles.airportCode}>{code}</span>
                    <span>
                      <strong>{airport.name}</strong>
                      <small>
                        {[airport.city, airport.countryCode]
                          .filter(Boolean)
                          .join(", ") || airport.ident}
                      </small>
                    </span>
                    <PlaneLanding aria-hidden="true" />
                  </button>
                );
              })
            ) : (
              <p>
                {isLoading
                  ? "Searching airports..."
                  : helperText || "No matching airports found."}
              </p>
            )}
          </div>
        ) : null}
      </div>
      {helperText ? (
        <small className={styles.fieldHint}>{helperText}</small>
      ) : null}
    </label>
  );
}
