import React from "react";

const TabNavigation = ({ activeTab, onTabChange, tabs }) => (
  <div className="border-b border-gray-200 mb-6 md:mb-8">
    <nav className="flex space-x-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-3 px-1 border-b-2 font-medium text-sm md:text-base whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? "border-[#FEC601] text-[#800000]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

export default TabNavigation;
