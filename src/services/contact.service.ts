import { apiClient } from "@/lib/api-client";
import type { ContactFormData } from "@/lib/schemas/contact.schema";

export interface ContactResponse {
  ok: true;
  message: string;
  id?: string;
}

/**
 * Capa de servicio para el dominio "contact".
 *
 * Patrón: cada feature tiene su propio archivo en src/services/.
 * Los componentes NUNCA llaman a apiClient directamente; siempre
 * pasan por una capa de servicio. Esto da:
 * - Refactor seguro (renombrar endpoints en un solo lugar)
 * - Tests fáciles (mockeas el service, no fetch global)
 * - Lógica de negocio agrupada (transformaciones, mapeos)
 */
export const contactService = {
  send: (data: ContactFormData) =>
    apiClient.post<ContactResponse>("/api/contact", data),
};
