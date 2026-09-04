import { getApiErrorData, getApiErrorStatus } from "@/lib/utils/error-handler";
import {
  ACCOUNT_INACTIVE_MESSAGE,
  ACCOUNT_SUSPENDED_MESSAGE,
} from "@/features/auth/constants";

export { getApiErrorData as getAuthErrorData };

export function isAccountStatusError(error: unknown): boolean {
  const message = getApiErrorData(error)?.message;
  return (
    getApiErrorStatus(error) === 403 &&
    (message === ACCOUNT_INACTIVE_MESSAGE ||
      message === ACCOUNT_SUSPENDED_MESSAGE)
  );
}
