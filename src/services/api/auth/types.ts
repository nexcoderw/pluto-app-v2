export type UserRole = 'CUSTOMER' | 'PARTNER';

export type UserAuthProfile = {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	role: UserRole;
	emailVerified: boolean;
	phoneVerified: boolean;
	requiresPhoneNumber: boolean;
};

export type UserAuthResponse = {
	message: string;
	accessToken: string;
	user: UserAuthProfile;
};

export type UserCurrentProfileResponse = {
	user: UserAuthProfile;
};

export type ApiMessageResponse = {
	message: string;
};
