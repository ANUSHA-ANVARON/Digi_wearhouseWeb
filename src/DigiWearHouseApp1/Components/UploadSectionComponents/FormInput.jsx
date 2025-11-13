import React from "react";

const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  error = null,
}) => (
  <div className={`space-y-2 text-start ${className}`}>
    <label className="block text-sm md:text-base font-medium text-gray-700">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="4"
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      />
    )}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default FormInput;
