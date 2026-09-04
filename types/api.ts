export interface ApiErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
  nonFieldErrors?: string | string[];
}

export interface ErrorWithResponse {
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
}
