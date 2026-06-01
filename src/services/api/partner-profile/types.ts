export type PartnerType = 'INDIVIDUAL' | 'COMPANY';

export type PartnerProfileStatus =
	| 'DRAFT'
	| 'PENDING'
	| 'APPROVED'
	| 'REJECTED';

export type PartnerProfileSubmission = {
	id: string;
	status: PartnerProfileStatus;
	rejectionReason: string | null;
	adminNotes: string | null;
	submittedAt: string;
	reviewedAt: string | null;
	reviewedById: string | null;
};

export type PartnerDocument = {
	id: string;
	title: string;
	description: string | null;
	status: 'PENDING' | 'APPROVED' | 'REJECTED';
	rejectionReason: string | null;
	reviewedAt: string | null;
	createdAt: string;
	file: {
		id: string;
		originalName: string;
		mimeType: string;
		sizeBytes: number;
		publicUrl: string | null;
		key: string;
		storageProvider: 'GCS' | 'LOCAL';
		syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
	};
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
	documents: PartnerDocument[];
	submissions: PartnerProfileSubmission[];
};

export type PartnerProfileResponse = {
	message?: string;
	profile: PartnerProfile;
};

export type SaveIndividualPartnerProfileRequest = {
	legalName: string;
	nationalIdNumber?: string;
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

export type UploadPartnerDocumentRequest = {
	title: string;
	description?: string;
	file: File;
};

export type UploadPartnerDocumentResponse = {
	message: string;
	document: PartnerDocument;
};
