import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * CollapsibleFilterSection Component
 * 
 * A reusable collapsible section for filter groups.
 * Features:
 * - Smooth expand/collapse animation
 * - Keyboard accessible (Enter/Space)
 * - Optional "Mandatory" badge
 * - Clean, consistent styling
 * 
 * @param {string} title - Section title
 * @param {boolean} isExpanded - Controlled expand state
 * @param {function} onToggle - Callback when section is toggled
 * @param {boolean} mandatory - Show "(Mandatory)" badge
 * @param {ReactNode} children - Filter content
 */
const CollapsibleFilterSection = ({
  title,
  isExpanded = false,
  onToggle,
  mandatory = false,
  children,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle?.();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        onKeyPress={handleKeyPress}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} filter`}
      >
        <div className="flex items-center gap-2">
          <h4 className="text-sm md:text-base font-semibold text-gray-900">
            {title}
          </h4>
          {mandatory && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
              Mandatory
            </span>
          )}
        </div>
        <div className="text-gray-500">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Content with smooth animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-[800px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 border-t border-gray-200">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleFilterSection;
