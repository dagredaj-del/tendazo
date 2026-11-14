"use client";

import { useState } from "react";
import { createStore } from "./actions";
import { PAYMENT_METHODS } from "@/lib/types";

export default function OnboardingForm() {
  const [step, setStep] = useState(1);

  return (
    <form action={createStore} className="mt-6 space-y-5">
      {/* Paso 1 */}
      <div className={step === 1 ? "space-y-3" : "hidden"}>
        <p className="text-sm font-semibold text-brand">
          Paso 1 de 3 · Tu tienda
        </p>
        <Field
          label="Nombre de la tienda"
          name="name"
          required
          placeholder="Moda Manizales"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ciudad" name="city" required placeholder="Manizales" />
          <Field label="Barrio / zona" name="zone" placeholder="La Enea" />
        </div>
        <Field
          label="WhatsApp (con indicativo)"
          name="whatsapp"
          required
          placeholder="3001234567"
        />
        <button
          type="button"
          onClick={() => setStep(2)}
          className="w-full rounded-xl bg-brand py-3 font-semibold text-white"
        >
          Siguiente
        </button>
      </div>

      {/* Paso 2 */}
      <div className={step === 2 ? "space-y-3" : "hidden"}>
        <p className="text-sm font-semibold text-brand">Paso 2 de 3 · Pagos</p>
        <p className="text-sm text-slate-500">¿Qué medios de pago recibes?</p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-2 rounded-xl border p-3 text-sm"
            >
              <input type="checkbox" name="payment" value={m.id} />
              {m.label}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 rounded-xl border py-3 font-medium"
          >
            Atrás
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Paso 3 */}
      <div className={step === 3 ? "space-y-3" : "hidden"}>
        <p className="text-sm font-semibold text-brand">Paso 3 de 3 · Ventas</p>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="checkbox" name="ships_national" />
          <span className="text-sm">Hago envíos a todo el país</span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="checkbox" name="does_wholesale" />
          <span className="text-sm">Vendo al por mayor</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex-1 rounded-xl border py-3 font-medium"
          >
            Atrás
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white"
          >
            Crear mi tienda
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border px-4 py-2.5 outline-none focus:border-brand"
      />
    </label>
  );
}
