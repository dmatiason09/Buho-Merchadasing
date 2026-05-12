import { z } from "zod";

/**
 * Schema único para validar el formulario de contacto.
 *
 * Se usa tanto en el frontend (React Hook Form + Zod resolver)
 * como en el backend (API Route para revalidar antes de guardar).
 *
 * Esta es la SOURCE OF TRUTH del contrato de datos.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es muy largo"),
  email: z
    .string()
    .email("Ingresa un email válido")
    .max(150, "El email es muy largo"),
  company: z.string().max(150).optional().or(z.literal("")),
  serviceType: z.enum(
    ["static", "motion", "cms-3d", "erp", "automation", "other"],
    {
      errorMap: () => ({ message: "Selecciona un tipo de servicio" }),
    }
  ),
  message: z
    .string()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(2000, "El mensaje es muy largo (máx. 2000 caracteres)"),
});

/** Tipo TypeScript inferido del schema, listo para usar en componentes */
export type ContactFormData = z.infer<typeof contactSchema>;

/** Opciones para el select del tipo de servicio (UI) */
export const SERVICE_TYPE_OPTIONS: Array<{
  value: ContactFormData["serviceType"];
  label: string;
}> = [
  { value: "static", label: "Página estática" },
  { value: "motion", label: "Motion site" },
  { value: "cms-3d", label: "CMS / 3D" },
  { value: "erp", label: "ERP a medida" },
  { value: "automation", label: "Automatización con n8n" },
  { value: "other", label: "Otro / Combinación" },
];
