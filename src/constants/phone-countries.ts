import {
	getCountries,
	getCountryCallingCode,
	type CountryCode,
} from 'libphonenumber-js';

export type PhoneCountryOption = {
	code: CountryCode;
	name: string;
	callingCode: string;
	label: string;
};

const preferredCountries: CountryCode[] = [
	'RW',
	'KE',
	'UG',
	'TZ',
	'BI',
	'CD',
	'US',
	'GB',
];

const regionNames =
	typeof Intl !== 'undefined' && 'DisplayNames' in Intl
		? new Intl.DisplayNames(['en'], { type: 'region' })
		: null;

function getCountryName(country: CountryCode) {
	return regionNames?.of(country) ?? country;
}

function createCountryOption(country: CountryCode): PhoneCountryOption {
	const callingCode = `+${getCountryCallingCode(country)}`;

	return {
		code: country,
		name: getCountryName(country),
		callingCode,
		label: `${getCountryName(country)} (${callingCode})`,
	};
}

const countryMap = new Map(
	getCountries().map((country) => [country, createCountryOption(country)]),
);

export const RWANDA_PHONE_COUNTRY: CountryCode = 'RW';

export const PHONE_COUNTRIES = [
	...preferredCountries
		.map((country) => countryMap.get(country))
		.filter((country): country is PhoneCountryOption => Boolean(country)),
	...Array.from(countryMap.values())
		.filter((country) => !preferredCountries.includes(country.code))
		.sort((first, second) => first.name.localeCompare(second.name)),
];

export const PHONE_COUNTRY_CODES = PHONE_COUNTRIES.map(
	(country) => country.code,
);

export function isSupportedPhoneCountry(value: unknown): value is CountryCode {
	return typeof value === 'string' && PHONE_COUNTRY_CODES.includes(value as CountryCode);
}

export function getPhoneCountryOption(country: CountryCode) {
	return countryMap.get(country) ?? countryMap.get(RWANDA_PHONE_COUNTRY)!;
}

