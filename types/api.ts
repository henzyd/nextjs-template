export interface ApiErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
  non_field_errors?: string | string[];
  nonFieldErrors?: string | string[];
}

export interface ErrorWithResponse {
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
}
