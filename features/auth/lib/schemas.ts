import { z } from "zod";

/**
 * Los `message` en estos schemas son keys de i18n (no strings traducidos).
 * Los componentes los pasan a `t(\`errors.\${key}\`)` cuando los muestran.
 */

export const loginSchema = z.object({
  email: z.string().min(1, "fieldRequired").email("invalidEmail"),
  password: z.string().min(1, "fieldRequired"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "fieldRequired"),
    lastName: z.string().min(1, "fieldRequired"),
    email: z.string().min(1, "fieldRequired").email("invalidEmail"),
    password: z.string().min(1, "fieldRequired").min(8, "passwordTooShort"),
    confirmPassword: z.string().min(1, "fieldRequired"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
