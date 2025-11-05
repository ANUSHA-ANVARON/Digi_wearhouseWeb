// // import React from 'react';

// // const FormSelect = ({ 
// //   label, 
// //   value, 
// //   onChange, 
// //   options, 
// //   placeholder,
// //   error = null,
// //   className = ""
// // }) => (
// //   <div className={`space-y-2 text-start ${className}`}>
// //     <label className="block text-sm text-start md:text-base font-medium text-gray-700">
// //       {label}
// //     </label>
// //     <select
// //       value={value}
// //       onChange={onChange}
// //       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white ${
// //         error ? 'border-red-500' : 'border-gray-200'
// //       }`}
// //     >
// //       <option value="">{placeholder}</option>
// //       {options.map((option, index) => (
// //         <option key={index} value={option}>
// //           {option}
// //         </option>
// //       ))}
// //     </select>
// //     {error && <p className="text-sm text-red-500">{error}</p>}
// //   </div>
// // );

// // export default FormSelect;

// import React from 'react';

// const FormSelect = ({ 
//   label, 
//   value, 
//   onChange, 
//   options = [], 
//   placeholder,
//   error = null,
//   className = ""
// }) => (
//   <div className={`space-y-2 text-start ${className}`}>
//     <label className="block text-sm text-start md:text-base font-medium text-gray-700">
//       {label}
//     </label>
//     <select
//       value={value}
//       onChange={onChange}
//       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white ${
//         error ? 'border-red-500' : 'border-gray-200'
//       }`}
//     >
//       <option value="">{placeholder}</option>
//       {options.map((option, index) => (
//         <option key={index} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//     {error && <p className="text-sm text-red-500">{error}</p>}
//   </div>
// );

// export default FormSelect;


// FormSelect.jsx (or wherever it's implemented)
import React from "react";

const FormSelect = ({ label, value, onChange, options = [], placeholder, disabled }) => {
  return (
    <div className="form-group">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border rounded p-2"
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((opt, idx) => {
          // if opt is a string, render string; if it's object, use value/label
          if (typeof opt === "string") {
            return (
              <option key={opt + idx} value={opt}>
                {opt}
              </option>
            );
          }
          // handle objects with { value, label } or { value, label, ... }
          const val = opt.value ?? opt.label ?? JSON.stringify(opt);
          const lbl = opt.label ?? opt.value ?? JSON.stringify(opt);
          return (
            <option key={val + idx} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default FormSelect;

