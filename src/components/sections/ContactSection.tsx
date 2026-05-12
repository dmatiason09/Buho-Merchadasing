import { ContactForm } from "@/components/forms/ContactForm";

export function ContactSection() {
  return (
    <section
      id="contacto"
      data-nav-theme="dark"
      className="relative z-[5] bg-black px-10 py-32 text-white"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex items-center gap-2 text-xs uppercase tracking-[0.18em] before:content-['•']">
          Contacto /
        </div>

        <h2 className="mb-12 max-w-[900px] font-display text-[clamp(28px,3.5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Cuéntanos sobre tu proyecto y armamos algo memorable juntos.
        </h2>

        <ContactForm />
      </div>
    </section>
  );
}
