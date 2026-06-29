"use client";

import { useEffect } from "react";

// Patrones de mensaje que delatan un "chunk" (archivo JS/CSS) que ya no existe —
// pasa cuando un deploy nuevo reemplaza los archivos y el navegador (con una
// pestaña vieja) pide uno con el nombre viejo.
const CHUNK_RE =
  /Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

export function isChunkError(name?: string, message?: string): boolean {
  if (name === "ChunkLoadError") return true;
  return !!message && CHUNK_RE.test(message);
}

const RELOAD_KEY = "buho-auto-reload-ts";
const RELOAD_WINDOW = 15000;

// Recarga la página UNA sola vez, con candado en sessionStorage para no entrar en
// bucle si el error fuese permanente. Devuelve true si disparó la recarga; false
// si ya recargó hace <15s (ahí conviene mostrar un mensaje en vez de insistir).
function guardedReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (Date.now() - last < RELOAD_WINDOW) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* sessionStorage no disponible: recargamos igual */
  }
  window.location.reload();
  return true;
}

// Recarga ante un chunk desfasado (lo usan los listeners globales de abajo).
export function reloadOnChunkError(): void {
  guardedReload();
}

// Recarga UNA vez ante CUALQUIER error que llegue a un boundary. Devuelve true si
// recargó (mostrar "cargando"), false si el candado ya estaba puesto (mostrar un
// mensaje calmado en vez de recargar en bucle).
export function recoverOnce(): boolean {
  return guardedReload();
}

// Limpia el candado, para un "Reintentar" manual del usuario.
export function clearReloadGuard(): void {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

// ¿El recurso que falló es un archivo de Next (/_next/static/...)? Detectar el
// fallo del propio <script>/<link> es lo MÁS fiable: no depende del texto del
// error (que en producción Next.js borra/minifica).
function isNextAsset(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t || (t.tagName !== "SCRIPT" && t.tagName !== "LINK")) return false;
  const url = (t as HTMLScriptElement).src || (t as HTMLLinkElement).href || "";
  return url.includes("/_next/static/");
}

/**
 * Auto-recarga ante un "ChunkLoadError" (archivos JS/CSS desfasados tras un
 * deploy). Es PASIVO: solo escucha eventos globales, no renderiza nada. Detecta
 * el fallo de dos formas: (1) el fallo de carga del propio <script>/<link> de
 * /_next/static (fiable, no depende del texto del error), y (2) por el mensaje.
 * Montado en el layout.
 */
export function ChunkReloader() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      // (1) Falló la carga de un recurso de Next (chunk 404 tras deploy).
      if (isNextAsset(e.target)) {
        reloadOnChunkError();
        return;
      }
      // (2) Error JS cuyo nombre/mensaje delata un chunk.
      const err = e.error as { name?: string } | undefined;
      if (isChunkError(err?.name, e.message)) reloadOnChunkError();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { name?: string; message?: string } | undefined;
      if (isChunkError(r?.name, r?.message)) reloadOnChunkError();
    };
    // capture:true para atrapar también fallos de carga de <script>/<link> (no burbujean).
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
