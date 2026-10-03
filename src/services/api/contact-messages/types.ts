export type CreateContactMessagePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type CreateContactMessageResponse = { message: string };
