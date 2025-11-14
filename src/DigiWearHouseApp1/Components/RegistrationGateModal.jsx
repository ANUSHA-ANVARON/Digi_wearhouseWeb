import React from "react";

export default function RegistrationGateModal({
  open,
  onClose,
  onGoToRegister,
  title = "Complete Your Registration",
  message = "You need to register your vendor profile before you can log in or continue with Google.",
  primaryLabel = "Go to Registration",
  secondaryLabel = "Close",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Card */}
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onGoToRegister}
            className="flex-1 cursor-pointer rounded-xl bg-cyan-600 px-4 py-2.5 text-white font-semibold hover:bg-cyan-700 transition"
          >
            {primaryLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
