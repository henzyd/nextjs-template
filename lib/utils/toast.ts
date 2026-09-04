import { type ExternalToast, toast } from "sonner";

type ToastParams = Omit<ExternalToast, "description"> & {
  message: string;
  description?: string;
};

export const notifySuccess = ({
  message,
  description,
  ...options
}: ToastParams) => toast.success(message, { description, ...options });

export const notifyError = ({
  message,
  description,
  ...options
}: ToastParams) => toast.error(message, { description, ...options });

export const notifyInfo = ({ message, description, ...options }: ToastParams) =>
  toast.info(message, { description, ...options });
