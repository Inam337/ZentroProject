import { z } from 'zod';

// Type for the translation function
export type TranslationFunction = (
  id: string,
  defaultMessage: string,
  values?: Record<string, string | number>,
) => string;

// Login form validation schema
export const createLoginSchema = (t: TranslationFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t('login.errors.emailRequired', 'Email is required'))
      .refine(
        (value) => {
          // Check if it's a valid email or phone number
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

          return emailRegex.test(value) || phoneRegex.test(value);
        },
        t('login.errors.invalidFormat', 'Please enter a valid email'),
      ),
    password: z
      .string()
      .min(1, t('login.errors.passwordRequired', 'Password is required')),
  });

// Export the schema types
export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

// Default values for forms
export const loginFormDefaultValues = {
  email: '',
  password: '',
};
