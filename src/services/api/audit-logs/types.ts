export type UserAuditCategory =
	| "AUTH"
	| "USER"
	| "PARTNER"
	| "PRODUCT"
	| "BOOKING"
	| "PAYMENT"
	| "FILE"
	| "ADMIN"
	| "SECURITY"
	| "SYSTEM";

export type UserAuditRole = "SUPERADMIN" | "ADMIN" | "PARTNER" | "CUSTOMER";
export type UserAuditSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type UserAuditOutcome = "SUCCESS" | "FAILED" | "DENIED";
export type UserAuditOrderBy =
	| "createdAt"
	| "action"
	| "category"
	| "severity"
	| "outcome"
	| "entityType";
export type UserAuditOrder = "asc" | "desc";

export type ListUserAuditLogsRequest = {
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: UserAuditOrderBy;
	order?: UserAuditOrder;
	category?: UserAuditCategory;
	severity?: UserAuditSeverity;
	outcome?: UserAuditOutcome;
	entityType?: string;
	dateFrom?: string;
	dateTo?: string;
};

export type UserAuditFieldChange = {
	id: string;
	fieldName: string;
	oldValue: unknown;
	newValue: unknown;
	createdAt: string;
};

export type UserAuditLog = {
	id: string;
	traceId: string | null;
	requestId: string | null;
	sessionId: string | null;
	actorId: string | null;
	actorRole: UserAuditRole | null;
	actorEmail: string | null;
	category: UserAuditCategory;
	severity: UserAuditSeverity;
	outcome: UserAuditOutcome;
	action: string;
	entityType: string | null;
	entityId: string | null;
	entityName: string | null;
	method: string | null;
	endpoint: string | null;
	statusCode: number | null;
	ipAddress: string | null;
	userAgent: string | null;
	deviceType: string;
	country: string | null;
	city: string | null;
	beforeData: unknown;
	afterData: unknown;
	changes: unknown;
	metadata: unknown;
	message: string | null;
	errorCode: string | null;
	errorMessage: string | null;
	createdAt: string;
	fieldChanges: UserAuditFieldChange[];
};

export type UserAuditLogMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	orderBy: UserAuditOrderBy;
	order: UserAuditOrder;
};

export type ListUserAuditLogsResponse = {
	items: UserAuditLog[];
	meta: UserAuditLogMeta;
};
