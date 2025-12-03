import { z } from "zod";

export const registerProSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("L'email est invalide"),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères"),
  businessName: z.string().min(1, "Le nom de l'entreprise est requis"),
  trade: z.string().min(1, "Le métier est requis"),
  city: z.string().min(1, "La ville est requise"),
  zipcode: z.string().optional(),
  description: z.string().optional(),
  publicEmail: z.string().email("L'email public est invalide").optional(),
  publicPhone: z.string().optional(),
});
