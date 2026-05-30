import {
	isValidPhoneNumber,
	parsePhoneNumberFromString,
	type CountryCode,
} from 'libphonenumber-js';
import { getPhoneCountryOption } from '@/constants/phone-countries';

export function normalizePhoneNumber(country: CountryCode, phone: string) {
	const trimmedPhone = phone.trim();

	if (trimmedPhone.startsWith('+')) {
		return trimmedPhone.replace(/\s+/g, '');
	}

	const digitsOnly = trimmedPhone.replace(/\D/g, '').replace(/^0+/, '');
	const countryOption = getPhoneCountryOption(country);

	return `${countryOption.callingCode}${digitsOnly}`;
}

export function isValidInternationalPhoneNumber(
	country: CountryCode,
	phone: string,
) {
	const normalizedPhone = normalizePhoneNumber(country, phone);
	const parsedPhone = parsePhoneNumberFromString(normalizedPhone, country);

	return Boolean(parsedPhone?.isValid()) && isValidPhoneNumber(normalizedPhone);
}

export function getPhonePlaceholder(country: CountryCode) {
	const countryOption = getPhoneCountryOption(country);

	if (country === 'RW') {
		return `${countryOption.callingCode} 788 123 456`;
	}

	return `${countryOption.callingCode} phone number`;
}

