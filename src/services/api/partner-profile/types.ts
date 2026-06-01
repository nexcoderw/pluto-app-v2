export type PartnerType = 'INDIVIDUAL' | 'COMPANY';

export type PartnerProfileStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type PartnerProfileSubmission = {
	id: string;
	status: PartnerProfileStatus;
	rejectionReason: string | null;
	adminNotes: string | null;
	submittedAt: string;
	reviewedAt: string | null;
	reviewedById: string | null;
};

export type PartnerProfile = {
	id: string;
	userId: string;
	partnerType: PartnerType;
	status: PartnerProfileStatus;
	legalName: string | null;
	nationalIdNumber: string | null;
	representativeName: string | null;
	representativeIdNumber: string | null;
	businessName: string | null;
	businessEmail: string | null;
	businessPhone: string | null;
	taxIdentification: string | null;
	registrationNumber: string | null;
	description: string | null;
	websiteUrl: string | null;
	addressLine: string | null;
	city: string;
	country: string;
	submittedAt: string | null;
	resubmittedAt: string | null;
	resubmissionCount: number;
	rejectionReason: string | null;
	adminNotes: string | null;
	reviewedById: string | null;
	reviewedAt: string | null;
	archivedAt: string | null;
	createdAt: string;
	updatedAt: string;
	submissions: PartnerProfileSubmission[];
};

export type PartnerProfileResponse = {
	message?: string;
	profile: PartnerProfile;
};

export type SaveIndividualPartnerProfileRequest = {
	legalName: string;
	nationalIdNumber: string;
	businessEmail: string;
	businessPhone: string;
	description: string;
	addressLine?: string;
	city?: string;
	country?: string;
	websiteUrl?: string;
};

export type SaveCompanyPartnerProfileRequest = {
	businessName: string;
	registrationNumber: string;
	taxIdentification: string;
	businessEmail: string;
	businessPhone: string;
	representativeName: string;
	representativeIdNumber: string;
	description: string;
	addressLine: string;
	city?: string;
	country?: string;
	websiteUrl?: string;
};
