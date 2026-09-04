"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthService } from "@/features/auth/services/auth.api";
import { setSessionState } from "@/features/auth/utils/session-state";
import { clearAccessToken, setAccessToken } from "@/lib/config/axios";
import { handleApiError } from "@/lib/utils/error-handler";
import { QUERY_KEYS } from "@/lib/utils/query-keys";
import { notifyError, notifySuccess } from "@/lib/utils/toast";

interface MutationOptions {
  onSuccess?: () => void;
}

export function useSignup(options: MutationOptions = {}) {
  return useMutation({
    mutationFn: AuthService.signup,
    onSuccess: options.onSuccess,
    onError: (error) =>
      handleApiError(error, {
        409: () =>
          notifyError({ message: "An account already uses that email." }),
      }),
  });
}

export function useVerifyEmail(options: MutationOptions = {}) {
  return useMutation({
    mutationFn: AuthService.verifyEmail,
    onSuccess: options.onSuccess,
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: AuthService.resendVerification,
    onSuccess: () =>
      notifySuccess({
        message: "If the address is eligible, a new link has been sent.",
      }),
    onError: (error) => handleApiError(error),
  });
}

export function useLogin(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.login,
    onMutate: () => queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.me }),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(QUERY_KEYS.auth.me, data.user);
      setSessionState("authenticated");
      options.onSuccess?.();
    },
    onError: (error) =>
      handleApiError(error, {
        401: () => notifyError({ message: "Email or password is incorrect." }),
      }),
  });
}

export function useLogout(options: { redirectTo?: string } = {}) {
  const queryClient = useQueryClient();
  const redirectTo = options.redirectTo ?? "/login";

  return useMutation({
    mutationFn: AuthService.logout,
    onSettled: () => {
      clearAccessToken();
      setSessionState("unauthenticated");
      queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.all });
      window.location.assign(redirectTo);
    },
  });
}

export function useGetMe(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: ({ signal }) => AuthService.getMe({ signal }),
    enabled: options.enabled ?? true,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: AuthService.forgotPassword,
    onSuccess: () =>
      notifySuccess({
        message: "If the account exists, reset instructions have been sent.",
      }),
    onError: (error) => handleApiError(error),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: () =>
      notifySuccess({ message: "Your password has been reset." }),
    onError: (error) => handleApiError(error),
  });
}

export function useRefreshSession() {
  const router = useRouter();

  return useMutation({
    mutationFn: AuthService.refresh,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setSessionState("authenticated");
    },
    onError: () => {
      clearAccessToken();
      setSessionState("unauthenticated");
      router.push("/login");
    },
  });
}
