import type { ListPaymentIntentsRequest } from "./types";

export const paymentQueryKeys = {
	all: ["payments"] as const,
	lists: () => [...paymentQueryKeys.all, "list"] as const,
	list: (params: ListPaymentIntentsRequest) =>
		[
			...paymentQueryKeys.lists(),
			{
				page: params.page ?? 1,
				limit: params.limit ?? 10,
				status: params.status ?? "ALL",
			},
		] as const,
	detail: (paymentIntentId: string) =>
		[...paymentQueryKeys.all, "detail", paymentIntentId] as const,
};
