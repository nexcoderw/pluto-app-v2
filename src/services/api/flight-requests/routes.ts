export const FLIGHT_REQUEST_ROUTES = {
  createDraft: "/flight-requests",
  myList: "/flight-requests/my",
  myDetail: (requestId: string) => `/flight-requests/${requestId}`,
  updateDraft: (requestId: string) => `/flight-requests/${requestId}/draft`,
  submit: (requestId: string) => `/flight-requests/${requestId}/submit`,
  cancel: (requestId: string) => `/flight-requests/${requestId}/cancel`,
  messages: (requestId: string) => `/flight-requests/${requestId}/messages`,
} as const;
