import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("L'email est invalide"),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères"),
});
