"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  SERVICE_TYPE_OPTIONS,
  type ContactFormData,
} from "@/lib/schemas/contact.schema";
import { contactService } from "@/services/contact.service";
import { ApiClientError } from "@/lib/api-client";

type SubmitStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

const inputBase =
  "w-full rounded-md border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors";

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      serviceType: undefined,
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormData) => {
    setStatus({ state: "loading" });
    try {
      const res = await contactService.send(values);
      setStatus({ state: "success", message: res.message });
      reset();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Algo salió mal. Inténtalo de nuevo en un momento.";
      setStatus({ state: "error", message });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-2xl flex-col gap-5"
      noValidate
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/70"
          >
            Nombre
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            className={inputBase}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/70"
          >
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="tu@empresa.com"
            className={inputBase}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-company"
          className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/70"
        >
          Empresa <span className="opacity-50">(opcional)</span>
        </label>
        <input
          id="contact-company"
          type="text"
          autoComplete="organization"
          placeholder="Nombre de tu empresa"
          className={inputBase}
          {...register("company")}
        />
      </div>

      <div>
        <label
          htmlFor="contact-service"
          className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/70"
        >
          ¿Qué necesitas?
        </label>
        <select
          id="contact-service"
          className={inputBase}
          defaultValue=""
          {...register("serviceType")}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {SERVICE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.serviceType && (
          <p className="mt-2 text-sm text-red-400">
            {errors.serviceType.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/70"
        >
          Cuéntanos sobre tu proyecto
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Qué tienes, qué necesitas, plazos, presupuesto aproximado..."
          className={inputBase}
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-2 text-sm text-red-400">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status.state === "loading"}
        className="mt-2 self-start rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status.state === "loading" ? "Enviando..." : "Enviar mensaje"}
      </button>

      {status.state === "success" && (
        <p
          role="status"
          className="rounded-md border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm text-green-300"
        >
          ✓ {status.message}
        </p>
      )}
      {status.state === "error" && (
        <p
          role="alert"
          className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
        >
          ✗ {status.message}
        </p>
      )}
    </form>
  );
}
