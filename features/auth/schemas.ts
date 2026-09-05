import * as Yup from "yup";

export const passwordSchema = Yup.string()
  .required("Password is required")
  .min(8, "Use at least 8 characters")
  .matches(/[A-Z]/, "Include an uppercase letter")
  .matches(/[a-z]/, "Include a lowercase letter")
  .matches(/[0-9]/, "Include a number")
  .matches(/[^A-Za-z0-9]/, "Include a special character");

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const signupSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim(),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: passwordSchema,
});

export const emailSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

export const resetPasswordSchema = Yup.object({
  password: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});
